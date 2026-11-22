// Sorting page: replays sortSteps() as bar animations.
import { sortSteps, applyStep, PSEUDOCODE } from "./cs-lib.js";

const state = { values: [], steps: [], pos: 0, timer: null };

/** New random array of `size` values in 5..100 and reset the replay. */
function shuffle(size) {
  // TODO (Plan CS step 1b)
  void size, state;
}

/** Draw one .bar per value (height = value%); mark the current step's indices. */
function renderBars(step) {
  // TODO (Plan CS step 1b): reuse existing .bar elements instead of rebuilding when sizes match.
  void step;
}

/** Fill #sort-code from PSEUDOCODE[algorithm]; highlight `line`. */
function renderPseudocode(algorithm, line) {
  // TODO (Plan CS step 1b)
  void algorithm, line, PSEUDOCODE;
}

/** Advance one step: applyStep, update counters (#sort-compares, #sort-writes), redraw. */
function step() {
  // TODO (Plan CS step 1c): compute state.steps lazily with sortSteps(algorithm, values).
  void sortSteps, applyStep;
}

/** Play/pause with setInterval; delay from #sort-speed (e.g. 500 / speed ms). Respect reduced motion? Keep playing, it's user-started. */
function togglePlay() {
  // TODO (Plan CS step 1c): button text Play <-> Pause; stop at the end.
}

document.addEventListener("DOMContentLoaded", () => {
  const size = document.getElementById("sort-size");
  size?.addEventListener("input", () => {
    document.getElementById("sort-size-out").value = size.value;
    shuffle(Number(size.value));
  });
  document.getElementById("sort-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    togglePlay();
  });
  document.getElementById("sort-step")?.addEventListener("click", step);
  document.getElementById("sort-shuffle")?.addEventListener("click", () => shuffle(Number(size.value)));
  document.getElementById("sort-reset")?.addEventListener("click", () => shuffle(Number(size.value)));
  void renderBars, renderPseudocode;
});
