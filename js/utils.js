// Pure functions (no DOM, no globals) so they run in Node with `npm test`.
// Page scripts (plotter.js, scanner.js, ...) import these and handle the DOM.

/** localStorage key the scanner writes and the LaTeX page reads. */
export const SCAN_STORAGE_KEY = "christopia:lastScan";

/**
 * Sample y = f(x) on [xMin, xMax] for a 2D line plot.
 * @param {(x: number) => number} f  compiled function (from math.js in the browser)
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} n  number of points, >= 2
 * @returns {{x: number[], y: (number|null)[]}}  same-length arrays; y is null where f is
 *   not finite (NaN, ±Infinity, throws) so Plotly breaks the line at asymptotes.
 */
export function sample2D(f, xMin, xMax, n) {
  if (!(n >= 2) || !(xMin < xMax)) throw new RangeError("Need n >= 2 and xMin < xMax");
  const step = (xMax - xMin) / (n - 1);
  const x = Array.from({ length: n }, (_, i) => (i === n - 1 ? xMax : xMin + i * step));
  return { x, y: x.map((t) => finiteOrNull(() => f(t))) };
}

/** f() if it returns a finite number, else null (NaN, ±Infinity, complex, throws). */
function finiteOrNull(f) {
  try {
    const v = f();
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/**
 * Sample z = f(x, y) on a grid for a 3D surface plot.
 * @param {(x: number, y: number) => number} f
 * @param {[number, number]} xRange
 * @param {[number, number]} yRange
 * @param {number} n  grid points per axis, >= 2
 * @returns {{x: number[], y: number[], z: (number|null)[][]}}  z[j][i] = f(x[i], y[j])
 *   (Plotly surface wants rows indexed by y).
 */
export function sampleSurface(f, xRange, yRange, n) {
  const { x } = sample2D(() => 0, xRange[0], xRange[1], n);
  const { x: y } = sample2D(() => 0, yRange[0], yRange[1], n);
  return { x, y, z: y.map((b) => x.map((a) => finiteOrNull(() => f(a, b)))) };
}

/**
 * Parse matrix text: one row per line, entries split by spaces/commas, fractions "a/b" allowed.
 * @param {string} text
 * @returns {number[][]}
 * @throws {Error} on empty input, a non-numeric entry, or rows of different lengths
 *   (message says which row/entry, shown to the user).
 */
export function parseMatrix(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) throw new Error("Type a matrix: one row per line.");
  const rows = lines.map((line, r) =>
    line
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((entry, c) => {
        const parts = entry.split("/");
        const value =
          parts.length === 2
            ? Number(parts[0]) / Number(parts[1])
            : parts.length === 1
              ? Number(entry)
              : NaN;
        if (!Number.isFinite(value) || parts.some((p) => p === "")) {
          throw new Error(`Row ${r + 1}, entry ${c + 1}: "${entry}" is not a number.`);
        }
        return value;
      }),
  );
  rows.forEach((row, r) => {
    if (row.length !== rows[0].length) {
      throw new Error(`Row ${r + 1} has ${row.length} entries but row 1 has ${rows[0].length}.`);
    }
  });
  return rows;
}

/**
 * Reduced row echelon form by Gauss-Jordan elimination, recording each row operation.
 * Does not modify the input.
 * @param {number[][]} A
 * @param {number} [eps=1e-10]  treat |value| < eps as 0
 * @returns {{matrix: number[][], steps: {op: string, matrix: number[][]}[]}}
 *   op is human readable, e.g. "R2 ← R2 − 4·R1", "R1 ↔ R3", "R2 ← (1/3)·R2".
 */
export function rref(A, eps = 1e-10) {
  const M = A.map((row) => [...row]);
  const rows = M.length;
  const cols = rows ? M[0].length : 0;
  const steps = [];
  const snap = () =>
    M.forEach((row) => row.forEach((v, c) => (row[c] = Math.abs(v) < eps ? 0 : v)));
  const record = (op) => {
    snap();
    steps.push({ op, matrix: M.map((row) => [...row]) });
  };
  let lead = 0;
  for (let r = 0; r < rows && lead < cols; r++) {
    // Partial pivoting: the largest |value| in this column at or below row r.
    let pivot = -1;
    while (lead < cols) {
      pivot = r;
      for (let i = r + 1; i < rows; i++)
        if (Math.abs(M[i][lead]) > Math.abs(M[pivot][lead])) pivot = i;
      if (Math.abs(M[pivot][lead]) >= eps) break;
      lead++;
    }
    if (lead >= cols) break;
    if (pivot !== r) {
      [M[r], M[pivot]] = [M[pivot], M[r]];
      record(`R${r + 1} ↔ R${pivot + 1}`);
    }
    const p = M[r][lead];
    if (Math.abs(p - 1) >= eps) {
      M[r] = M[r].map((v) => v / p);
      record(`R${r + 1} ← (1/${formatNumber(p)})·R${r + 1}`);
    }
    for (let i = 0; i < rows; i++) {
      const k = M[i][lead];
      if (i === r || Math.abs(k) < eps) continue;
      M[i] = M[i].map((v, c) => v - k * M[r][c]);
      record(
        k > 0
          ? `R${i + 1} ← R${i + 1} − ${formatNumber(k)}·R${r + 1}`
          : `R${i + 1} ← R${i + 1} + ${formatNumber(-k)}·R${r + 1}`,
      );
    }
    lead++;
  }
  snap();
  // Round away float noise like 0.9999999999 so exact answers look exact.
  return {
    matrix: M.map((row) =>
      row.map((v) => (Math.abs(v - Math.round(v)) < eps ? Math.round(v) + 0 : v)),
    ),
    steps,
  };
}

/**
 * Format a number for display: integers as-is, otherwise up to `digits` decimals,
 * trailing zeros removed; -0 shows as 0.
 * @param {number} x
 * @param {number} [digits=4]
 * @returns {string}
 */
export function formatNumber(x, digits = 4) {
  const rounded = Number(x.toFixed(digits));
  return String(rounded === 0 ? 0 : rounded);
}

/**
 * Clean raw OCR text: normalize line endings, trim trailing spaces, collapse 3+ blank lines
 * to one blank line, rejoin words hyphenated across a line break ("equa-\ntion" -> "equation").
 * @param {string} raw
 * @returns {string}
 */
export function cleanOcrText(raw) {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/(\w)-\n(\w)/g, "$1$2")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Wrap scratchpad text in a minimal compilable LaTeX document.
 * @param {string} body
 * @param {string} [title=""]  adds \title + \maketitle when non-empty
 * @returns {string}  starts with \documentclass, includes amsmath/amssymb, ends with \end{document}
 */
export function toLatexDocument(body, title = "") {
  const head = title ? `\\title{${title}}\n\\date{}\n` : "";
  const make = title ? "\\maketitle\n\n" : "";
  return `\\documentclass{article}\n\\usepackage{amsmath,amssymb}\n${head}\\begin{document}\n${make}${body.trim()}\n\\end{document}\n`;
}

/**
 * Filter the tool registry (Home's Services panel shows the "planned" ones).
 * @param {import("./tools.js").Tool[]} tools
 * @param {"all"|"live"|"planned"} status
 * @returns {import("./tools.js").Tool[]}  new array, original order
 */
export function filterTools(tools, status) {
  return status === "all" ? [...tools] : tools.filter((tool) => tool.status === status);
}
