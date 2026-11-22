// Big-O page: growth curves (Plotly global from the CDN) and a benchmark that times real code.
import { GROWTH, fitComplexity } from "./cs-lib.js";

const PRETTY = {
  1: "O(1)",
  "log n": "O(log n)",
  n: "O(n)",
  "n log n": "O(n log n)",
  "n^2": "O(n²)",
  "n^3": "O(n³)",
  "2^n": "O(2ⁿ)",
  "n!": "O(n!)",
};
const EXPLODING = ["2^n", "n!"];

const $ = (id) => document.getElementById(id);

/* ---------------- Growth curves ---------------- */

/** Plotly colors that follow the site theme (read from the CSS tokens). */
function theme() {
  const css = getComputedStyle(document.documentElement);
  const token = (name) => css.getPropertyValue(name).trim();
  return {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "M PLUS Rounded 1c, system-ui, sans-serif", color: token("--text") },
    colorway: ["#1e9bd7", "#2ecc71", "#f5b041", "#e74c3c", "#9b59b6", "#16a085", "#d35400", "#7f8c8d"],
    margin: { l: 60, r: 20, t: 20, b: 50 },
    legend: { orientation: "h", y: -0.2 },
    gridcolor: token("--border"),
  };
}

const CONFIG = { responsive: true, displaylogo: false };

/** Redraw the checked growth curves for n = 1..nMax. */
function drawCurves() {
  const nMax = Number($("bigo-n").value);
  const log = $("bigo-log").checked;
  const checked = [...$("bigo-classes").querySelectorAll("input:checked")].map((box) => box.value);
  const step = Math.max(1, Math.ceil(nMax / 200)); // ~200 points is smooth enough
  const xs = [];
  for (let n = 1; n < nMax; n += step) xs.push(n);
  xs.push(nMax);
  const traces = checked.map((name) => ({
    x: xs,
    // Values past ~1e300 (2^n, n! for big n) aren't plottable: leave a gap.
    y: xs.map((n) => {
      const y = GROWTH[name](n);
      return Number.isFinite(y) && y < 1e300 ? y : null;
    }),
    name: PRETTY[name],
    mode: "lines",
    line: { width: 3 },
  }));
  // Linear scale: zoom to the tallest *polynomial* curve so 2^n and n! visibly shoot off the top.
  const tame = checked.filter((name) => !EXPLODING.includes(name));
  const yMax = tame.length
    ? Math.max(...tame.map((name) => GROWTH[name](nMax)), 1)
    : Math.max(...checked.map((name) => GROWTH[name](Math.min(nMax, 20))), 1);
  const { gridcolor, ...base } = theme();
  Plotly.react(
    "bigo-plot",
    traces,
    {
      ...base,
      xaxis: { title: { text: "n (input size)" }, gridcolor },
      yaxis: log
        ? { title: { text: "steps (log scale)" }, type: "log", dtick: 1, exponentformat: "power", gridcolor }
        : { title: { text: "steps" }, range: [0, yMax * 1.05], gridcolor },
    },
    CONFIG,
  );
}

/* ---------------- Benchmark ---------------- */

const bubble = (a) => {
  for (let i = 0; i < a.length - 1; i++)
    for (let j = 0; j < a.length - 1 - i; j++) if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
};
const insertion = (a) => {
  for (let i = 1; i < a.length; i++) {
    const v = a[i];
    let j = i - 1;
    for (; j >= 0 && a[j] > v; j--) a[j + 1] = a[j];
    a[j + 1] = v;
  }
};
const merge = (a) => {
  if (a.length < 2) return a;
  const mid = a.length >> 1;
  const left = merge(a.slice(0, mid));
  const right = merge(a.slice(mid));
  let i = 0;
  let j = 0;
  let k = 0;
  while (i < left.length && j < right.length) a[k++] = left[i] <= right[j] ? left[i++] : right[j++];
  while (i < left.length) a[k++] = left[i++];
  while (j < right.length) a[k++] = right[j++];
  return a;
};
const quick = (a, lo = 0, hi = a.length - 1) => {
  while (lo < hi) {
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (a[j] < a[hi]) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    // Recurse into the smaller side, loop on the bigger one: stack depth stays O(log n).
    if (i - lo < hi - i) {
      quick(a, lo, i - 1);
      lo = i + 1;
    } else {
      quick(a, i + 1, hi);
      hi = i - 1;
    }
  }
};

/**
 * What each benchmark runs, its largest allowed n (bigger would freeze the tab), the textbook
 * answer, and default sizes. n log n needs a ~1000x range to tell it apart from n: over 16x the
 * two differ by only ~1.3x, which timer noise swamps.
 */
const ALGORITHMS = {
  linear: { expect: "n", sizes: "100000, 200000, 400000, 800000, 1600000", maxN: 10_000_000, sorted: false, mutates: false, run: (a) => a.indexOf(-1) }, // never found: full scan
  binary: {
    expect: "log n",
    sizes: "1000, 10000, 100000, 1000000",
    maxN: 10_000_000,
    sorted: true,
    mutates: false,
    run: (a) => {
      let lo = 0;
      let hi = a.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (a[mid] < 0.5) lo = mid + 1; // 0.5 is never in the array (integers): worst case
        else hi = mid - 1;
      }
      return lo;
    },
  },
  bubble: { expect: "n^2", sizes: "500, 1000, 2000, 4000, 8000", maxN: 20_000, sorted: false, mutates: true, run: bubble },
  insertion: { expect: "n^2", sizes: "500, 1000, 2000, 4000, 8000", maxN: 20_000, sorted: false, mutates: true, run: insertion },
  merge: { expect: "n log n", sizes: "1000, 10000, 100000, 1000000", maxN: 1_000_000, sorted: false, mutates: true, run: merge },
  quick: { expect: "n log n", sizes: "1000, 10000, 100000, 1000000", maxN: 1_000_000, sorted: false, mutates: true, run: quick },
  builtin: { expect: "n log n", sizes: "1000, 10000, 100000, 1000000", maxN: 1_000_000, sorted: false, mutates: true, run: (a) => a.sort((x, y) => x - y) },
};

const randomArray = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 1e9));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

/**
 * Average time of one run at size n. Repeats until at least 25 ms have passed, because one
 * fast run can be shorter than the browser's timer resolution (0.1 ms or worse).
 */
function measureOnce(algorithm, base) {
  let runs = 0;
  const t0 = performance.now();
  let elapsed = 0;
  do {
    algorithm.run(algorithm.mutates ? base.slice() : base);
    runs++;
    elapsed = performance.now() - t0;
  } while (elapsed < 25);
  return elapsed / runs;
}

/**
 * Time one algorithm on each size: median of 3 measurements (1 if a run is slow), with a short
 * warm-up so the JIT compiler has optimized the code first.
 * @returns {Promise<number[]>} ms per run, one per size
 */
async function benchmark(name, sizes) {
  const algorithm = ALGORITHMS[name];
  const times = [];
  let warm = false;
  for (const [index, n] of sizes.entries()) {
    $("bench-status").textContent = `Timing n = ${n.toLocaleString()} (${index + 1} of ${sizes.length})…`;
    await nextFrame(); // let the status paint before the busy loop
    const base = randomArray(n);
    if (algorithm.sorted) base.sort((x, y) => x - y);
    if (!warm) {
      measureOnce(algorithm, base); // warm-up at a real size, so the JIT has optimized the code; result discarded
      warm = true;
    }
    const first = measureOnce(algorithm, base);
    if (first > 200) {
      times.push(first);
      continue;
    }
    const samples = [first, measureOnce(algorithm, base), measureOnce(algorithm, base)].sort((x, y) => x - y);
    times.push(samples[1]);
  }
  return times;
}

/** "1000, 2000 4000" -> sorted unique positive integers, or an error message. */
function parseSizes(text, maxN) {
  const parts = text.split(/[\s,]+/).filter(Boolean);
  const sizes = parts.map(Number);
  if (sizes.some((n) => !Number.isInteger(n) || n < 10)) return { error: "Sizes must be whole numbers of at least 10." };
  const unique = [...new Set(sizes)].sort((a, b) => a - b);
  if (unique.length < 2 || unique.length > 8) return { error: "Give between 2 and 8 different sizes." };
  if (unique.at(-1) > maxN) return { error: `Keep sizes at or below ${maxN.toLocaleString()} for this algorithm, or the tab will freeze.` };
  return { sizes: unique };
}

const formatMs = (t) => (t < 0.01 ? t.toExponential(2) : t < 100 ? t.toFixed(3) : t.toFixed(0));

let lastBench = null; // kept so the chart can be redrawn when the theme changes

/** Table of times and growth ratios, the best-fit class, and the measured-vs-fit chart. */
function showResults(name, sizes, times) {
  const body = $("bench-table").tBodies[0];
  body.replaceChildren(
    ...sizes.map((n, i) => {
      const row = document.createElement("tr");
      const ratio = i ? `×${(times[i] / times[i - 1]).toFixed(2)} for ×${(n / sizes[i - 1]).toFixed(1)} n` : "-";
      for (const text of [n.toLocaleString(), formatMs(times[i]), ratio]) {
        row.append(Object.assign(document.createElement("td"), { textContent: text }));
      }
      return row;
    }),
  );

  const fit = fitComplexity(sizes, times);
  const expected = ALGORITHMS[name].expect;
  if (!fit) {
    $("bench-fit").textContent = "Too fast to measure; try bigger sizes.";
    return;
  }
  let text = `Looks like ${PRETTY[fit.best]}; the textbook answer is ${PRETTY[expected]}.`;
  if (fit.best !== expected) {
    text +=
      expected === "log n"
        ? " log n grows so slowly that timer noise and loop overhead can hide it."
        : " Real timings include caches, the JIT compiler and noise; try a wider range of sizes.";
  }
  $("bench-fit").textContent = text;
  lastBench = { sizes, times, fit };
  drawBench();
}

function drawBench() {
  if (!lastBench) return;
  const { sizes, times, fit } = lastBench;
  const lo = sizes[0];
  const hi = sizes.at(-1);
  const xs = Array.from({ length: 60 }, (_, k) => lo + ((hi - lo) * k) / 59);
  const { gridcolor, ...base } = theme();
  $("bench-plot-heading").hidden = false;
  $("bench-plot").hidden = false;
  Plotly.react(
    "bench-plot",
    [
      { x: sizes, y: times, mode: "markers", name: "measured", marker: { size: 11 } },
      { x: xs, y: xs.map((n) => fit.c * GROWTH[fit.best](n)), mode: "lines", name: `best fit: ${PRETTY[fit.best]}` },
    ],
    {
      ...base,
      xaxis: { title: { text: "n (input size)" }, gridcolor },
      yaxis: { title: { text: "time per run (ms)" }, rangemode: "tozero", gridcolor },
    },
    CONFIG,
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const n = $("bigo-n");
  n.addEventListener("input", () => {
    $("bigo-n-out").value = n.value;
    drawCurves();
  });
  $("bigo-classes").addEventListener("change", drawCurves);
  $("bigo-log").addEventListener("change", drawCurves);
  const defaultSizes = () => ($("bench-sizes").value = ALGORITHMS[$("bench-algorithm").value].sizes);
  $("bench-algorithm").addEventListener("change", defaultSizes);
  defaultSizes();

  $("bench-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("bench-algorithm").value;
    const parsed = parseSizes($("bench-sizes").value, ALGORITHMS[name].maxN);
    if (parsed.error) {
      $("bench-status").textContent = parsed.error;
      return;
    }
    const button = e.submitter ?? e.target.querySelector("button");
    button.disabled = true;
    try {
      const times = await benchmark(name, parsed.sizes);
      showResults(name, parsed.sizes, times);
      $("bench-status").textContent = "Done.";
    } finally {
      button.disabled = false;
    }
  });

  // Plotly bakes colors in, so redraw when Dark mode is toggled.
  new MutationObserver(() => {
    drawCurves();
    drawBench();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  drawCurves();
});
