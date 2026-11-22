// Graphs page: draw on a grid, then animate gridSearch() (visited order, then the path).
import { gridSearch, generateMaze } from "./cs-lib.js";

const ROWS = 21; // odd, for generateMaze
const COLS = 41;
const WEIGHT = 5;

const state = { grid: [], start: [10, 5], end: [10, 35], drawing: false, timer: null };

/**
 * Fill #graph-grid with ROWS x COLS <button class="cell"> (aria-label "row r, column c, open"),
 * CSS grid columns = COLS. Mouse: press + drag paints with the chosen tool; keyboard: arrows move
 * focus, Enter/Space paints.
 */
function buildGrid() {
  // TODO (Plan CS step 3b)
  void state, ROWS, COLS;
}

/** Apply the selected tool (wall / weight / start / end / erase) to one cell and redraw it. */
function paint(r, c) {
  // TODO (Plan CS step 3b): start/end move instead of paint; never wall over start/end.
  void r, c, WEIGHT;
}

/** Run the chosen algorithm and animate .visited cells, then .path cells; fill the stats. */
function run() {
  // TODO (Plan CS step 3c): clearPath() first; speed from #graph-speed; "No path" in #graph-status.
  void gridSearch;
}

/** Remove .visited / .path classes and reset stats (walls stay). */
function clearPath() {
  // TODO (Plan CS step 3c)
}

document.addEventListener("DOMContentLoaded", () => {
  buildGrid();
  document.getElementById("graph-run")?.addEventListener("click", run);
  document.getElementById("graph-clear-path")?.addEventListener("click", clearPath);
  document.getElementById("graph-clear-all")?.addEventListener("click", () => {
    // TODO: all cells back to 1, keep start/end.
    clearPath();
  });
  document.getElementById("graph-maze")?.addEventListener("click", () => {
    // TODO (Plan CS step 3d): state.grid = generateMaze(ROWS, COLS, Math.random); move start/end onto open cells.
    void generateMaze, paint;
  });
  // TODO: #graph-step advances the animation one cell at a time.
});
