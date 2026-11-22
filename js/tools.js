// Tool registry: the one list the home gallery and the Hub read from.
// To add a tool to Christopia: add an entry here, add its page, add a nav link.

/**
 * @typedef {Object} Tool
 * @property {string} id        short slug, also the image name in images/
 * @property {string} name      display name
 * @property {string} href      page link ("" for planned tools with no page yet)
 * @property {string} summary   one sentence for the card
 * @property {"live"|"planned"} status
 * @property {string} category  e.g. "math", "study", "home"
 */

/** @type {Tool[]} */
export const TOOLS = [
  {
    id: "plotter",
    name: "Function Plotter",
    href: "plotter.html",
    summary: "TODO: 2D and 3D graphs of functions you type.",
    status: "live",
    category: "math",
  },
  {
    id: "scanner",
    name: "Notes Scanner",
    href: "scanner.html",
    summary: "TODO: photo of notes in, typed text out.",
    status: "live",
    category: "study",
  },
  {
    id: "matrix",
    name: "Matrix Lab",
    href: "matrix.html",
    summary: "TODO: RREF with steps, determinant, inverse, eigenvalues.",
    status: "live",
    category: "math",
  },
  {
    id: "latex",
    name: "LaTeX Scratchpad",
    href: "latex.html",
    summary: "TODO: write math, see it rendered, export .tex.",
    status: "live",
    category: "study",
  },
  {
    id: "home-server",
    name: "Home Server",
    href: "",
    summary: "TODO: status of services on the home server.",
    status: "planned",
    category: "home",
  },
  {
    id: "smart-home",
    name: "Smart Home",
    href: "",
    summary: "TODO: lights and devices.",
    status: "planned",
    category: "home",
  },
  // TODO: more ideas: unit converter, statistics calculator, ODE solver / slope fields,
  // regex tester, big-O cheat sheet, GPA / grade calculator.
];
