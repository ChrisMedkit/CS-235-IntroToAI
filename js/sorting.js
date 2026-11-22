// Sorting page: records every step with sortSteps(), then replays them as bar animations.
import { sortSteps, applyStep, PSEUDOCODE } from "./cs-lib.js";

const AVERAGE = {
  bubble: "O(n²)",
  insertion: "O(n²)",
  selection: "O(n²)",
  merge: "O(n log n)",
  quick: "O(n log n)",
  heap: "O(n log n)",
};

const state = {
  values: [], // the unsorted array this run started from
  current: [], // values with steps[0..pos) applied
  steps: null, // computed on the first Step/Play, so changing the algorithm is free
  pos: 0,
  compares: 0,
  writes: 0,
  sorted: new Set(),
  timer: null,
};

const $ = (id) => document.getElementById(id);
const algorithm = () => $("sort-algorithm").value;

/** Speed slider 1..100 -> steps per second, ~1 up to ~2200 (exponential so the slider feels even). */
const rate = () => 1.08 ** Number($("sort-speed").value);

/** New random array of `size` values in 5..100, then reset. */
function shuffle(size) {
  state.values = Array.from({ length: size }, () => 5 + Math.floor(Math.random() * 96));
  reset();
}

/** Back to the start of this array (same values), paused. */
function reset() {
  pause();
  Object.assign(state, { current: [...state.values], steps: null, pos: 0, compares: 0, writes: 0 });
  state.sorted.clear();
  $("sort-bigo").textContent = AVERAGE[algorithm()];
  $("sort-status").textContent = "Press Play, or Step to go one move at a time.";
  renderStats();
  renderBars();
  renderPseudocode(-1);
}

/** One .bar per value (height = value%); highlight the indices the current step touches. */
function renderBars(step) {
  const container = $("sort-bars");
  if (container.children.length !== state.current.length) {
    container.replaceChildren(
      ...state.current.map(() => Object.assign(document.createElement("div"), { className: "bar" })),
    );
  }
  const touched = step && step.type !== "sorted" ? [step.i, step.j] : [];
  const hot = step?.type === "compare" ? "comparing" : "swapping";
  [...container.children].forEach((bar, index) => {
    bar.style.height = `${state.current[index]}%`;
    bar.className = "bar";
    if (state.sorted.has(index)) bar.classList.add("sorted");
    if (touched.includes(index)) bar.classList.add(hot);
  });
}

/** Fill #sort-code from PSEUDOCODE and highlight `line` (-1 = none). */
function renderPseudocode(line) {
  const list = $("sort-code");
  const lines = PSEUDOCODE[algorithm()];
  if (list.dataset.algorithm !== algorithm()) {
    list.dataset.algorithm = algorithm();
    list.replaceChildren(...lines.map((text) => Object.assign(document.createElement("li"), { textContent: text })));
  }
  [...list.children].forEach((li, index) => {
    li.classList.toggle("active", index === line);
    if (index === line) li.setAttribute("aria-current", "step");
    else li.removeAttribute("aria-current");
  });
}

function renderStats() {
  $("sort-compares").textContent = state.compares;
  $("sort-writes").textContent = state.writes;
}

/** Plain-English description of a step, for the status line when stepping by hand. */
function describe(step) {
  const v = (i) => state.current[i];
  if (step.type === "compare") return `Compare a[${step.i}] = ${v(step.i)} with a[${step.j}] = ${v(step.j)}.`;
  if (step.type === "swap") return `Swap a[${step.i}] and a[${step.j}]; now ${v(step.i)}, ${v(step.j)}.`;
  if (step.type === "write") return `Write ${step.value} into a[${step.i}].`;
  return `a[${step.i}] = ${v(step.i)} is in its final place.`;
}

/** Apply the next step to the data (no drawing). Returns it, or null when there is none left. */
function advance() {
  state.steps ??= sortSteps(algorithm(), state.values);
  if (state.pos >= state.steps.length) return null;
  const s = state.steps[state.pos++];
  applyStep(state.current, s);
  if (s.type === "compare") state.compares++;
  else if (s.type === "sorted") state.sorted.add(s.i);
  else state.writes++;
  return s;
}

/**
 * Draw after one or more advance() calls.
 * @param {object} s  the last step applied
 * @param {boolean} [announce]  describe it in the status line (manual Step only; during
 *   Play that would flood screen readers)
 */
function show(s, announce = false) {
  renderStats();
  renderBars(s);
  renderPseudocode(s.line);
  if (state.pos === state.steps.length) finish();
  else if (announce) $("sort-status").textContent = describe(s);
}

function finish() {
  pause();
  renderBars();
  renderPseudocode(-1);
  $("sort-status").textContent =
    `Sorted ${state.values.length} values with ${state.compares} comparisons and ${state.writes} swaps/writes.`;
}

/** Timers can't fire much faster than ~60/s, so fast speeds apply several steps per frame. */
function tick() {
  const perTick = Math.max(1, Math.round(rate() / 60));
  let last = null;
  for (let k = 0; k < perTick; k++) last = advance() ?? last;
  if (last) show(last);
  // finish() already paused on the last step; only schedule while steps remain.
  if (state.pos < state.steps.length) state.timer = setTimeout(tick, perTick > 1 ? 16 : 1000 / rate());
}

function play() {
  if (state.steps && state.pos >= state.steps.length) reset(); // finished: replay the same array
  $("sort-play").textContent = "Pause";
  $("sort-status").textContent = "Playing…";
  tick();
}

function pause() {
  clearTimeout(state.timer);
  state.timer = null;
  $("sort-play").textContent = "Play";
}

function togglePlay() {
  if (state.timer) {
    pause();
    $("sort-status").textContent = "Paused.";
  } else {
    play();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const size = $("sort-size");
  size.addEventListener("input", () => {
    $("sort-size-out").value = size.value;
    shuffle(Number(size.value));
  });
  $("sort-algorithm").addEventListener("change", reset);
  $("sort-form").addEventListener("submit", (e) => {
    e.preventDefault();
    togglePlay();
  });
  $("sort-step").addEventListener("click", () => {
    pause();
    const s = advance();
    if (s) show(s, true);
    else $("sort-status").textContent = "Already sorted. Press Reset or New array.";
  });
  $("sort-shuffle").addEventListener("click", () => shuffle(Number(size.value)));
  $("sort-reset").addEventListener("click", reset);
  shuffle(Number(size.value));
});
