// Big-O page: growth curves (Plotly global from the CDN) and a small benchmark.
import { GROWTH, fitComplexity } from "./cs-lib.js";

/** Redraw the checked curves for n = 1..nMax with Plotly.react("bigo-plot", ...). */
function drawCurves() {
  // TODO (Plan CS step 4b): log-scale y axis toggle is a nice extra (2^n and n! explode).
  void GROWTH;
}

/**
 * Time one algorithm on a random array of each size (median of 5 runs with performance.now()).
 * The sorts can be simple local implementations; binary search needs a sorted input.
 * @param {string} algorithm
 * @param {number[]} sizes
 * @returns {Promise<number[]>} ms per size
 */
async function benchmark(algorithm, sizes) {
  // TODO (Plan CS step 4c): await a frame between sizes so the page stays responsive;
  // refuse bubble/insertion above ~20,000 (it would hang the tab).
  void algorithm, sizes;
  return [];
}

/** Fill #bench-table, show "Looks like O(...)" from fitComplexity, plot the points. */
function showResults(sizes, times) {
  // TODO (Plan CS step 4c)
  void sizes, times, fitComplexity;
}

document.addEventListener("DOMContentLoaded", () => {
  const n = document.getElementById("bigo-n");
  n?.addEventListener("input", () => {
    document.getElementById("bigo-n-out").value = n.value;
    drawCurves();
  });
  document.getElementById("bigo-classes")?.addEventListener("change", drawCurves);
  document.getElementById("bench-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    // TODO: parse #bench-sizes (positive integers, show an error otherwise).
    const sizes = [];
    showResults(sizes, await benchmark(document.getElementById("bench-algorithm").value, sizes));
  });
  drawCurves();
});
