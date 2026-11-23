// Matrix Lab page. RREF is ours (utils.js, with steps); det/inv/eigs use the math global (math.js).
import { parseMatrix, rref, formatNumber } from "./utils.js";

const $ = (id) => document.getElementById(id);

/** A number, or a math.js Complex from eigs, as text: 2, 0.5, 1 + 2i. */
function formatValue(v) {
  if (typeof v === "number") return formatNumber(v);
  const re = formatNumber(v.re);
  const im = formatNumber(Math.abs(v.im));
  if (im === "0") return re;
  if (re === "0") return `${v.im < 0 ? "−" : ""}${im}i`;
  return `${re} ${v.im < 0 ? "−" : "+"} ${im}i`;
}

/**
 * Build a <table class="matrix"> for a 2D array (numbers via formatNumber).
 * @param {number[][]} M
 * @returns {HTMLTableElement}
 */
function matrixTable(M) {
  const table = document.createElement("table");
  table.className = "matrix";
  for (const row of M) {
    const tr = table.insertRow();
    for (const v of row) tr.insertCell().textContent = formatNumber(v);
  }
  return table;
}

function requireSquare(A, what) {
  if (A.length !== A[0].length) throw new Error(`${what} needs a square matrix; this one is ${A.length}×${A[0].length}.`);
}

const para = (text) => Object.assign(document.createElement("p"), { textContent: text });

/**
 * Run the chosen operation and render into #matrix-result / #matrix-steps.
 * @param {number[][]} A
 * @param {"rref"|"det"|"inv"|"eigs"|"transpose"} op
 */
function compute(A, op) {
  const result = $("matrix-result");
  const steps = $("matrix-steps");
  result.replaceChildren();
  steps.replaceChildren();
  const size = `${A.length}×${A[0].length}`;

  if (op === "rref") {
    const out = rref(A);
    const rank = out.matrix.filter((row) => row.some((v) => v !== 0)).length;
    result.append(para(`RREF of the ${size} matrix (rank ${rank}):`), matrixTable(out.matrix));
    if (!out.steps.length) steps.append(Object.assign(document.createElement("li"), { textContent: "Already in RREF." }));
    for (const step of out.steps) {
      const li = document.createElement("li");
      li.append(Object.assign(document.createElement("code"), { textContent: step.op }), matrixTable(step.matrix));
      steps.append(li);
    }
    return;
  }

  steps.append(Object.assign(document.createElement("li"), { textContent: "Steps are shown for RREF only." }));
  if (op === "transpose") {
    result.append(para(`Transpose (${A[0].length}×${A.length}):`), matrixTable(math.transpose(A)));
  } else if (op === "det") {
    requireSquare(A, "The determinant");
    result.append(para(`det(A) = ${formatNumber(math.det(A))}`));
  } else if (op === "inv") {
    requireSquare(A, "The inverse");
    // A zero row in the RREF means singular; safer than det ≈ 0, which depends on the entries' scale.
    if (rref(A).matrix.some((row) => row.every((v) => v === 0))) {
      result.append(para("This matrix is singular (determinant 0), so it has no inverse."));
    } else {
      result.append(para("A⁻¹ ="), matrixTable(math.inv(A)));
    }
  } else if (op === "eigs") {
    requireSquare(A, "Eigenvalues");
    const { values } = math.eigs(A);
    const list = document.createElement("ul");
    for (const v of values) {
      list.append(Object.assign(document.createElement("li"), { textContent: `λ = ${formatValue(v)}` }));
    }
    result.append(para(`Eigenvalues (with repeats):`), list);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("matrix-form").addEventListener("submit", (e) => {
    e.preventDefault();
    $("matrix-error").textContent = "";
    try {
      const A = parseMatrix($("matrix-text").value);
      compute(A, document.querySelector('[name="op"]:checked').value);
    } catch (err) {
      $("matrix-result").replaceChildren();
      $("matrix-steps").replaceChildren();
      $("matrix-error").textContent = err.message;
    }
  });
});
