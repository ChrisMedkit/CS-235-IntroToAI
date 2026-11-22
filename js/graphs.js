// Graphs page: draw on a grid, then animate gridSearch() (visited order, then the path).
import { gridSearch, generateMaze } from "./cs-lib.js";

const ROWS = 21; // odd, for generateMaze
// Phones get a square grid so cells stay big enough to tap (~15 px instead of ~6 px).
const COLS = window.matchMedia("(max-width: 600px)").matches ? 21 : 41;
const WEIGHT = 5;
const NAMES = { bfs: "BFS", dfs: "DFS", dijkstra: "Dijkstra", astar: "A*" };

const state = {
  grid: [], // grid[r][c] = cost to enter: 0 wall, 1 open, WEIGHT weighted
  start: [10, 5],
  end: [10, COLS - 6],
  cells: [], // cells[r][c] = <button>
  result: null, // last gridSearch result
  frames: [], // [{r, c, kind: "visited"|"path"}] still to show
  shown: 0,
  timer: null,
  paint: null, // what a drag paints this time: "wall" | "weight" | "open" | "start" | "end"
};

const $ = (id) => document.getElementById(id);
const tool = () => document.querySelector('[name="tool"]:checked').value;
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
/** Speed 1..100 -> cells per second, ~1 up to ~14000 (exponential so the slider feels even). */
const rate = () => 1.1 ** Number($("graph-speed").value);

/** Fill #graph-grid with ROWS x COLS buttons. Only one is in the Tab order (arrow keys move). */
function buildGrid() {
  const board = $("graph-grid");
  board.style.setProperty("--cols", COLS);
  board.setAttribute("role", "group");
  board.setAttribute("aria-label", `Grid, ${ROWS} rows by ${COLS} columns. Arrow keys move, Enter or Space draws.`);
  state.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
  state.cells = state.grid.map((row, r) =>
    row.map((_, c) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.tabIndex = -1;
      return cell;
    }),
  );
  board.replaceChildren(...state.cells.flat());
  state.cells[state.start[0]][state.start[1]].tabIndex = 0;
  renderAll();
}

/** Base look of one cell (start / end / wall / weight / open) and its accessible name. */
function renderCell(r, c) {
  const kind = same([r, c], state.start)
    ? "start"
    : same([r, c], state.end)
      ? "end"
      : state.grid[r][c] === 0
        ? "wall"
        : state.grid[r][c] === WEIGHT
          ? "weight"
          : "open";
  const cell = state.cells[r][c];
  cell.className = kind === "open" ? "cell" : `cell ${kind}`;
  cell.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}, ${kind}`);
}

function renderAll() {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) renderCell(r, c);
}

/** What this drag will paint, decided once on press: dragging from a wall erases walls, etc. */
function choosePaint(r, c) {
  const t = tool();
  if (t === "start" || t === "end") return t;
  if (t === "erase") return "open";
  const value = t === "wall" ? 0 : WEIGHT;
  return state.grid[r][c] === value ? "open" : t;
}

/** Apply state.paint to one cell. Start/end move instead of painting; walls never cover them. */
function paint(r, c) {
  const p = state.paint;
  if (p === "start" || p === "end") {
    const other = p === "start" ? state.end : state.start;
    if (same([r, c], other)) return;
    const old = state[p];
    state[p] = [r, c];
    state.grid[r][c] = Math.max(state.grid[r][c], 1); // moving onto a wall clears it
    renderCell(...old);
  } else {
    if (same([r, c], state.start) || same([r, c], state.end)) return;
    state.grid[r][c] = p === "wall" ? 0 : p === "weight" ? WEIGHT : 1;
  }
  renderCell(r, c);
  clearPath(); // the old result no longer matches the grid
}

/** Remove .visited / .path, stop any animation, reset stats (walls stay). */
function clearPath() {
  clearTimeout(state.timer);
  state.timer = null;
  state.result = null;
  state.frames = [];
  state.shown = 0;
  for (const cell of $("graph-grid").querySelectorAll(".visited, .path")) cell.classList.remove("visited", "path");
  $("graph-run").textContent = "Run";
  $("graph-visited").textContent = 0;
  $("graph-length").textContent = 0;
  $("graph-cost").textContent = 0;
  $("graph-status").textContent = "";
}

/** Run the search once and queue its frames: visited cells first, then the path. */
function prepare() {
  const algorithm = $("graph-algorithm").value;
  state.result = gridSearch(state.grid, state.start, state.end, algorithm);
  state.frames = [
    ...state.result.visited.map(([r, c]) => ({ r, c, kind: "visited" })),
    ...state.result.path.map(([r, c]) => ({ r, c, kind: "path" })),
  ];
  state.shown = 0;
}

/** Show the next `n` frames. Returns false once everything is shown. */
function showFrames(n) {
  const { frames } = state;
  for (let k = 0; k < n && state.shown < frames.length; k++) {
    const { r, c, kind } = frames[state.shown++];
    state.cells[r][c].classList.add(kind);
    if (kind === "visited") $("graph-visited").textContent = Number($("graph-visited").textContent) + 1;
  }
  if (state.shown < frames.length) return true;
  finish();
  return false;
}

function finish() {
  clearTimeout(state.timer);
  state.timer = null;
  $("graph-run").textContent = "Run";
  const { path, cost, visited } = state.result;
  const name = NAMES[$("graph-algorithm").value];
  $("graph-visited").textContent = visited.length;
  $("graph-length").textContent = Math.max(path.length - 1, 0);
  $("graph-cost").textContent = cost;
  $("graph-status").textContent = path.length
    ? `${name} found a path: ${path.length - 1} moves, cost ${cost}, after visiting ${visited.length} cells.`
    : `${name} visited ${visited.length} cells: the end can't be reached.`;
}

/** Timers fire ~60/s at most, so fast speeds show several cells per frame. */
function tick() {
  const perTick = Math.max(1, Math.round(rate() / 60));
  if (showFrames(perTick)) state.timer = setTimeout(tick, perTick > 1 ? 16 : 1000 / rate());
}

/** Run / Pause / Resume. Running again after it finished starts over. */
function run() {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
    $("graph-run").textContent = "Resume";
    $("graph-status").textContent = "Paused.";
    return;
  }
  if (!state.result || state.shown >= state.frames.length) {
    clearPath();
    prepare();
  }
  $("graph-run").textContent = "Pause";
  $("graph-status").textContent = `Searching with ${NAMES[$("graph-algorithm").value]}…`;
  tick();
}

function step() {
  if (state.timer) run(); // pause first
  if (!state.result || state.shown >= state.frames.length) {
    clearPath();
    prepare();
  }
  if (showFrames(1)) {
    const { r, c, kind } = state.frames[state.shown - 1];
    $("graph-status").textContent = `${kind === "visited" ? "Visit" : "Path"}: row ${r + 1}, column ${c + 1}.`;
  }
}

function randomMaze() {
  clearPath();
  state.grid = generateMaze(ROWS, COLS, Math.random);
  state.start = [1, 1];
  state.end = [ROWS - 2, COLS - 2];
  renderAll();
  $("graph-status").textContent = "New maze. Every open cell is reachable; press Run.";
}

function clearAll() {
  clearPath();
  state.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
  renderAll();
}

/* ---------- Pointer + keyboard drawing ---------- */

/** The cell under a pointer (works for touch drags too, where the target doesn't change). */
function cellAt(x, y) {
  const el = document.elementFromPoint(x, y);
  return el?.classList.contains("cell") && el.closest("#graph-grid") ? [Number(el.dataset.r), Number(el.dataset.c)] : null;
}

function initDrawing() {
  const board = $("graph-grid");
  let last = null;
  board.addEventListener("pointerdown", (e) => {
    const at = cellAt(e.clientX, e.clientY);
    if (!at) return;
    e.preventDefault(); // no text selection / focus scroll while dragging
    state.paint = choosePaint(...at);
    paint(...at);
    last = at;
  });
  board.addEventListener("pointermove", (e) => {
    if (!state.paint) return;
    const at = cellAt(e.clientX, e.clientY);
    if (at && !same(at, last)) {
      paint(...at);
      last = at;
    }
  });
  document.addEventListener("pointerup", () => (state.paint = null));
  document.addEventListener("pointercancel", () => (state.paint = null));

  board.addEventListener("keydown", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    let r = Number(cell.dataset.r);
    let c = Number(cell.dataset.c);
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (moves[e.key]) {
      e.preventDefault();
      r = Math.min(ROWS - 1, Math.max(0, r + moves[e.key][0]));
      c = Math.min(COLS - 1, Math.max(0, c + moves[e.key][1]));
      cell.tabIndex = -1;
      state.cells[r][c].tabIndex = 0;
      state.cells[r][c].focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      state.paint = choosePaint(r, c);
      paint(r, c);
      state.paint = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildGrid();
  initDrawing();
  $("graph-run").addEventListener("click", run);
  $("graph-step").addEventListener("click", step);
  $("graph-clear-path").addEventListener("click", clearPath);
  $("graph-clear-all").addEventListener("click", clearAll);
  $("graph-maze").addEventListener("click", randomMaze);
  $("graph-algorithm").addEventListener("change", clearPath);
  $("graph-status").textContent = "Draw walls (drag), then press Run.";
});
