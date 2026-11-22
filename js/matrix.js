// Matrix Lab page. RREF is ours (utils.js, with steps); det/inv/eigs use the math global (math.js).
import { parseMatrix, rref, formatNumber } from "./utils.js";

/**
 * Build a <table class="matrix"> for a 2D array (numbers via formatNumber).
 * @param {number[][]} M
 * @returns {HTMLTableElement}
 */
function matrixTable(M) {
  // TODO (Plan step 8d)
  void M, formatNumber;
  return document.createElement("table");
}

/**
 * Run the chosen operation and render into #matrix-result / #matrix-steps.
 * @param {number[][]} A
 * @param {"rref"|"det"|"inv"|"eigs"|"transpose"} op
 */
function compute(A, op) {
  // TODO (Plan step 8e):
  // rref      -> rref(A); table of result; one <li> per step (op text + matrixTable).
  // det       -> require square; math.det(A).
  // inv       -> require square; det ≈ 0 -> "singular, no inverse"; else math.inv(A).
  // eigs      -> require square; math.eigs(A).values (may be complex: show a+bi).
  // transpose -> math.transpose(A).
  void A, op, rref;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("matrix-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const error = document.getElementById("matrix-error");
    error.textContent = "";
    try {
      const A = parseMatrix(document.getElementById("matrix-text").value);
      compute(A, document.querySelector('[name="op"]:checked').value);
    } catch (err) {
      error.textContent = err.message;
    }
  });
});
