// Function Plotter page. Uses globals from CDN scripts: math (math.js), Plotly.
import { sample2D, sampleSurface } from "./utils.js";

const POINTS_2D = 1000;
const POINTS_3D = 60; // per axis; 60x60 = 3600 evaluations, keeps rotation smooth
const $ = (id) => document.getElementById(id);
let nextId = 1; // expr-0 is in the HTML

/** Give each row its f₁, f₂, … label and a matching Remove label, in order. */
function renumberRows() {
  document.querySelectorAll(".expression-row").forEach((row, i) => {
    row.querySelector("label").innerHTML = `f<sub>${i + 1}</sub>`;
    row.querySelector(".remove-expr").setAttribute("aria-label", `Remove f${i + 1}`);
  });
}

/** Clone the last .expression-row with a fresh id/label (f2, f3, ...) and empty input. */
function addExpressionRow() {
  const rows = document.querySelectorAll(".expression-row");
  const row = rows[rows.length - 1].cloneNode(true);
  const id = `expr-${nextId++}`;
  row.querySelector("label").htmlFor = id;
  Object.assign(row.querySelector("input"), { id, value: "" });
  $("expression-list").append(row);
  renumberRows();
  row.querySelector("input").focus();
}

/** Remove a row; keep at least one. */
function removeExpressionRow(button) {
  const rows = document.querySelectorAll(".expression-row");
  if (rows.length === 1) {
    rows[0].querySelector("input").value = "";
  } else {
    button.closest(".expression-row").remove();
    renumberRows();
  }
  $("add-expr").focus(); // the pressed button is gone; don't drop focus to <body>
  redraw();
}

/** Read #x-min..#y-max; return null and show an error if min >= max. */
function readWindow() {
  const [xMin, xMax, yMin, yMax] = ["x-min", "x-max", "y-min", "y-max"].map((id) => Number($(id).value));
  if (![xMin, xMax, yMin, yMax].every(Number.isFinite)) {
    $("plot-error").textContent = "Fill in all four window numbers.";
    return null;
  }
  if (xMin >= xMax || yMin >= yMax) {
    $("plot-error").textContent = "Each min must be smaller than its max.";
    return null;
  }
  return { xMin, xMax, yMin, yMax };
}

/**
 * Compile one expression with math.js.
 * 2D: scope {x}; 3D: scope {x, y}. Throw a readable Error for bad syntax.
 * @param {string} expr
 * @param {"2d"|"3d"} mode
 * @returns {Function}
 */
function compileExpression(expr, mode) {
  // Desmos habit: accept "y = ...", "f(x) = ...", "z = ...".
  const code = math.compile(expr.replace(/^\s*[a-z]\s*(\([^)]*\))?\s*=(?!=)/i, ""));
  const f = mode === "2d" ? (x) => code.evaluate({ x }) : (x, y) => code.evaluate({ x, y });
  f(0.5, 0.5); // a typo like "sinx" only fails when evaluated: surface "Undefined symbol sinx" now
  return f;
}

function layout(mode, win) {
  const base = {
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    font: { family: "M PLUS Rounded 1c, system-ui, sans-serif", color: "#000000" },
    margin: { l: 50, r: 20, t: 20, b: 40 },
    showlegend: true,
    legend: { orientation: "h", y: -0.12 },
    // The classic 16-color VGA palette, as on the Big-O page.
    colorway: ["#000080", "#008000", "#800000", "#008080", "#800080", "#808000", "#ff0000", "#0000ff"],
    uirevision: mode, // keep the user's zoom / 3D camera across redraws
  };
  const axis = (range, title) => ({ range, title: { text: title }, zerolinecolor: "#000000", gridcolor: "#dfdfdf" });
  if (mode === "2d") return { ...base, xaxis: axis([win.xMin, win.xMax], "x"), yaxis: axis([win.yMin, win.yMax], "y") };
  return { ...base, margin: { l: 0, r: 0, t: 0, b: 0 }, scene: { xaxis: axis(null, "x"), yaxis: axis(null, "y"), zaxis: axis(null, "z") } };
}

/** Read all rows, sample each with sample2D / sampleSurface, and Plotly.react into #plot. */
function redraw() {
  const mode = document.querySelector('[name="mode"]:checked').value;
  $("plot-error").textContent = "";
  const win = readWindow();
  if (!win) return;
  const errors = [];
  const traces = [];
  document.querySelectorAll(".expression-row input").forEach((input, i) => {
    const expr = input.value.trim();
    input.removeAttribute("aria-invalid");
    if (!expr) return;
    let f;
    try {
      f = compileExpression(expr, mode);
    } catch (err) {
      input.setAttribute("aria-invalid", "true");
      errors.push(`f${i + 1}: ${err.message}`);
      return;
    }
    const name = `f${i + 1}: ${expr}`;
    if (mode === "2d") {
      const { x, y } = sample2D(f, win.xMin, win.xMax, POINTS_2D);
      // Asymptotes (1/x, tan x): samples rarely hit the pole exactly, so Plotly would join +big to −big
      // with a vertical line. Break the line where neighbors are off-screen on opposite sides.
      const off = (v) => (v === null ? 0 : v > win.yMax ? 1 : v < win.yMin ? -1 : 0);
      for (let k = 1; k < y.length; k++) if (off(y[k]) * off(y[k - 1]) === -1) y[k] = null;
      traces.push({ type: "scatter", mode: "lines", name, x, y });
    } else {
      const surface = sampleSurface(f, [win.xMin, win.xMax], [win.yMin, win.yMax], POINTS_3D);
      // Only the first surface gets a color bar; more would pile up on the right.
      traces.push({ type: "surface", name, showscale: traces.length === 0, colorscale: "Blues", ...surface });
    }
  });
  $("plot-error").textContent = errors.join(" ");
  Plotly.react("plot", traces, layout(mode, win), { responsive: true, displaylogo: false });
}

let timer = null;
document.addEventListener("DOMContentLoaded", () => {
  $("add-expr").addEventListener("click", addExpressionRow);
  $("expression-list").addEventListener("click", (e) => {
    if (e.target.closest(".remove-expr")) removeExpressionRow(e.target.closest(".remove-expr"));
  });
  // Typing redraws 250 ms after the last key, not on every key.
  $("plot-controls").addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(redraw, 250);
  });
  redraw();
});
