// Function Plotter page. Uses globals from CDN scripts: math (math.js), Plotly.
import { sample2D, sampleSurface } from "./utils.js";

const POINTS_2D = 1000;
const POINTS_3D = 60; // per axis; 60x60 = 3600 evaluations, keeps rotation smooth

/** Clone the last .expression-row with a fresh id/label (f2, f3, ...) and empty input. */
function addExpressionRow() {
  // TODO (Plan step 7c)
}

/** Remove a row; keep at least one. */
function removeExpressionRow(button) {
  // TODO (Plan step 7c)
  void button;
}

/** Read #x-min..#y-max; return null and show an error if min >= max. */
function readWindow() {
  // TODO (Plan step 7d)
  return null;
}

/**
 * Compile one expression with math.js.
 * 2D: scope {x}; 3D: scope {x, y}. Throw a readable Error for bad syntax.
 * @param {string} expr
 * @param {"2d"|"3d"} mode
 * @returns {Function}
 */
function compileExpression(expr, mode) {
  // TODO (Plan step 7d): const code = math.compile(expr); return (x, y) => code.evaluate({x, y})
  void expr, mode;
  throw new Error("Not implemented");
}

/** Read all rows, sample each with sample2D / sampleSurface, and Plotly.react into #plot. */
function redraw() {
  // TODO (Plan step 7e):
  // 1. mode = checked [name=mode]; win = readWindow(); bail if null.
  // 2. For each non-empty input: compile (catch -> show in #plot-error, skip that row).
  // 3. 2D: traces {type:"scatter", mode:"lines", x, y, name}; 3D: {type:"surface", x, y, z}.
  // 4. Plotly.react("plot", traces, layout, {responsive: true}); colors from CSS tokens.
  void sample2D, sampleSurface, POINTS_2D, POINTS_3D, compileExpression;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-expr")?.addEventListener("click", addExpressionRow);
  document.getElementById("expression-list")?.addEventListener("click", (e) => {
    if (e.target.closest(".remove-expr")) removeExpressionRow(e.target.closest(".remove-expr"));
  });
  // TODO (Plan step 7f): debounce input events (~250 ms) so typing doesn't redraw every key.
  document.getElementById("plot-controls")?.addEventListener("input", redraw);
  redraw();
});
