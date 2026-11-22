// Pure functions (no DOM, no globals) so they run in Node with `npm test`.
// Page scripts (plotter.js, scanner.js, ...) import these and handle the DOM.

/** localStorage key the scanner writes and the LaTeX page reads. */
export const SCAN_STORAGE_KEY = "christopia:lastScan";

/** localStorage key for the dark/light choice. */
export const THEME_STORAGE_KEY = "christopia:theme";

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
  // TODO (Plan step 7a):
  // 1. Throw RangeError if n < 2 or xMin >= xMax.
  // 2. step = (xMax - xMin) / (n - 1); x_i = xMin + i * step.
  // 3. y_i = f(x_i); wrap in try/catch; non-finite -> null.
  void f, xMin, xMax, n;
  throw new Error("Not implemented");
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
  // TODO (Plan step 7b): reuse the spacing from sample2D for both axes, then a nested loop.
  void f, xRange, yRange, n;
  throw new Error("Not implemented");
}

/**
 * Parse matrix text: one row per line, entries split by spaces/commas, fractions "a/b" allowed.
 * @param {string} text
 * @returns {number[][]}
 * @throws {Error} on empty input, a non-numeric entry, or rows of different lengths
 *   (message says which row/entry, shown to the user).
 */
export function parseMatrix(text) {
  // TODO (Plan step 8a): trim, split lines, drop blank lines, split entries, parse, check widths.
  void text;
  throw new Error("Not implemented");
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
  // TODO (Plan step 8b), follow the algorithm from Linear Algebra:
  // 1. Copy A. lead = 0.
  // 2. For each row r: find pivot row (largest |value| in column lead at or below r; partial
  //    pivoting). If none, lead++ and retry; stop when lead == columns.
  // 3. Swap into place (record), scale pivot to 1 (record), eliminate the column in every
  //    other row (record each), lead++.
  // 4. Snap |x| < eps to 0 so -0 and 1e-17 don't show.
  void A, eps;
  throw new Error("Not implemented");
}

/**
 * Format a number for display: integers as-is, otherwise up to `digits` decimals,
 * trailing zeros removed; -0 shows as 0.
 * @param {number} x
 * @param {number} [digits=4]
 * @returns {string}
 */
export function formatNumber(x, digits = 4) {
  // TODO (Plan step 8c)
  void x, digits;
  throw new Error("Not implemented");
}

/**
 * Clean raw OCR text: normalize line endings, trim trailing spaces, collapse 3+ blank lines
 * to one blank line, rejoin words hyphenated across a line break ("equa-\ntion" -> "equation").
 * @param {string} raw
 * @returns {string}
 */
export function cleanOcrText(raw) {
  // TODO (Plan step 9a)
  void raw;
  throw new Error("Not implemented");
}

/**
 * Wrap scratchpad text in a minimal compilable LaTeX document.
 * @param {string} body
 * @param {string} [title=""]  adds \title + \maketitle when non-empty
 * @returns {string}  starts with \documentclass, includes amsmath/amssymb, ends with \end{document}
 */
export function toLatexDocument(body, title = "") {
  // TODO (Plan step 10a)
  void body, title;
  throw new Error("Not implemented");
}

/**
 * Filter the tool registry for the Hub.
 * @param {import("./tools.js").Tool[]} tools
 * @param {"all"|"live"|"planned"} status
 * @returns {import("./tools.js").Tool[]}  new array, original order
 */
export function filterTools(tools, status) {
  return status === "all" ? [...tools] : tools.filter((tool) => tool.status === status);
}
