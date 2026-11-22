// Tool registry: the one list the home gallery, section pages and the Hub read from.
// To add a tool: add an entry here, add its page in its section folder, add it to that
// section's sub-nav (every page in the section) and a static card on the section index.

/**
 * @typedef {Object} Tool
 * @property {string} id        short slug, also the image name in images/
 * @property {string} name      display name
 * @property {string} href      page path from the site root ("" for planned tools)
 * @property {string} summary   one sentence for the card
 * @property {"live"|"planned"} status
 * @property {"math"|"cs"|"social"|"home"} category  section the tool lives in
 */

/** @type {Tool[]} */
export const TOOLS = [
  {
    id: "plotter",
    name: "Function Plotter",
    href: "math/plotter.html",
    summary: "Graph y = f(x) in 2D and z = f(x, y) in 3D.",
    status: "live",
    category: "math",
  },
  {
    id: "matrix",
    name: "Matrix Lab",
    href: "math/matrix.html",
    summary: "RREF with row steps, determinant, inverse, eigenvalues.",
    status: "live",
    category: "math",
  },
  {
    id: "latex",
    name: "LaTeX Scratchpad",
    href: "math/latex.html",
    summary: "Write math, see it rendered, export .tex.",
    status: "live",
    category: "math",
  },
  {
    id: "scanner",
    name: "Notes Scanner",
    href: "math/scanner.html",
    summary: "Photo of your notes in, typed text out.",
    status: "live",
    category: "math",
  },
  {
    id: "sorting",
    name: "Sorting Visualizer",
    href: "cs/sorting.html",
    summary: "Watch six sorting algorithms compare and swap, step by step.",
    status: "live",
    category: "cs",
  },
  {
    id: "structures",
    name: "Data Structures",
    href: "cs/data-structures.html",
    summary: "Stacks, queues, linked lists, BSTs, heaps and hash tables, animated.",
    status: "live",
    category: "cs",
  },
  {
    id: "graphs",
    name: "Graphs & Pathfinding",
    href: "cs/graphs.html",
    summary: "BFS, DFS, Dijkstra and A* on a grid you draw.",
    status: "live",
    category: "cs",
  },
  {
    id: "bigo",
    name: "Big-O Playground",
    href: "cs/big-o.html",
    summary: "Compare growth rates and benchmark real algorithms.",
    status: "live",
    category: "cs",
  },
  {
    id: "regex",
    name: "Regex Builder",
    href: "cs/regex.html",
    summary: "Build a regular expression from blocks, see it explained and matched.",
    status: "live",
    category: "cs",
  },
  {
    id: "forum",
    name: "Forum",
    href: "social/forum.html",
    summary: "Threads and replies for classes, projects and anything else.",
    status: "live",
    category: "social",
  },
  {
    id: "events",
    name: "Events",
    href: "social/events.html",
    summary: "Create events, RSVP, and add them to your calendar.",
    status: "live",
    category: "social",
  },
  {
    id: "journal",
    name: "Private Journal",
    href: "social/journal.html",
    summary: "Password-locked, encrypted notes with a Notion-style editor.",
    status: "live",
    category: "social",
  },
  {
    id: "home-server",
    name: "Home Server",
    href: "",
    summary: "Status of services on the home server.",
    status: "planned",
    category: "home",
  },
  {
    id: "smart-home",
    name: "Smart Home",
    href: "",
    summary: "Lights and devices.",
    status: "planned",
    category: "home",
  },
  // Ideas: unit converter, statistics calculator, ODE slope fields, GPA calculator.
];
