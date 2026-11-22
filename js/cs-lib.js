// Pure logic for the CS section (no DOM), tested by tests/cs-lib.test.js.
// Page scripts (sorting.js, structures.js, graphs.js, bigo.js, regex.js) animate the results.

/* ---------------- Sorting ---------------- */

/**
 * @typedef {Object} SortStep
 * @property {"compare"|"swap"|"write"|"sorted"} type
 * @property {number} i            first index
 * @property {number} [j]          second index (compare / swap)
 * @property {number} [value]      new value at i (write: merge sort copies back)
 * @property {number} line         0-based line in PSEUDOCODE[algorithm] to highlight
 */

/** Pseudocode shown next to the bars; SortStep.line points into these arrays. */
export const PSEUDOCODE = {
  bubble: [
    "for i from 0 to n - 2",
    "  for j from 0 to n - i - 2",
    "    if a[j] > a[j + 1]",
    "      swap a[j], a[j + 1]",
  ],
  insertion: [
    "for i from 1 to n - 1",
    "  j = i",
    "  while j > 0 and a[j - 1] > a[j]",
    "    swap a[j - 1], a[j]",
    "    j = j - 1",
  ],
  selection: [
    "for i from 0 to n - 2",
    "  min = i",
    "  for j from i + 1 to n - 1",
    "    if a[j] < a[min]",
    "      min = j",
    "  swap a[i], a[min]",
  ],
  merge: [
    "mergeSort(lo, hi):",
    "  if lo >= hi: return",
    "  mid = floor((lo + hi) / 2)",
    "  mergeSort(lo, mid); mergeSort(mid + 1, hi)",
    "  while both halves have items:",
    "    if left[i] <= right[j]: take left[i]",
    "    else: take right[j]",
    "  copy whatever is left",
  ],
  quick: [
    "quickSort(lo, hi):",
    "  if lo >= hi: return",
    "  pivot = a[hi]; i = lo",
    "  for j from lo to hi - 1",
    "    if a[j] < pivot",
    "      swap a[i], a[j]; i = i + 1",
    "  swap a[i], a[hi]   // pivot lands in place",
    "  quickSort(lo, i - 1); quickSort(i + 1, hi)",
  ],
  heap: [
    "build max-heap: siftDown(i, n) for i = n/2 - 1 down to 0",
    "for end from n - 1 down to 1",
    "  swap a[0], a[end]   // largest goes to the back",
    "  siftDown(0, end)",
    "siftDown(i, size): compare a[i] with its children",
    "  if a child is larger: swap, continue from that child",
  ],
};

/**
 * Run a sorting algorithm on a copy of `values` and record every step, so the page can
 * replay it. Does not modify `values`.
 * @param {"bubble"|"insertion"|"selection"|"merge"|"quick"|"heap"} algorithm
 * @param {number[]} values
 * @returns {SortStep[]}  every index gets exactly one "sorted" step (the last ones at the end)
 */
export function sortSteps(algorithm, values) {
  const a = [...values];
  const n = a.length;
  const steps = [];
  const done = new Set();
  const compare = (i, j, line) => steps.push({ type: "compare", i, j, line });
  const swap = (i, j, line) => {
    [a[i], a[j]] = [a[j], a[i]];
    steps.push({ type: "swap", i, j, line });
  };
  const write = (i, value, line) => {
    a[i] = value;
    steps.push({ type: "write", i, value, line });
  };
  const sorted = (i, line) => {
    if (done.has(i)) return;
    done.add(i);
    steps.push({ type: "sorted", i, line });
  };

  const algorithms = {
    bubble() {
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          compare(j, j + 1, 2);
          if (a[j] > a[j + 1]) swap(j, j + 1, 3);
        }
        sorted(n - 1 - i, 0); // the largest remaining value has bubbled to the end
      }
    },
    insertion() {
      for (let i = 1; i < n; i++) {
        for (let j = i; j > 0; j--) {
          compare(j - 1, j, 2);
          if (a[j - 1] <= a[j]) break;
          swap(j - 1, j, 3);
        }
      }
    },
    selection() {
      for (let i = 0; i < n - 1; i++) {
        let min = i;
        for (let j = i + 1; j < n; j++) {
          compare(j, min, 3);
          if (a[j] < a[min]) min = j;
        }
        if (min !== i) swap(i, min, 5);
        sorted(i, 0);
      }
    },
    merge() {
      const mergeSort = (lo, hi) => {
        if (lo >= hi) return;
        const mid = Math.floor((lo + hi) / 2);
        mergeSort(lo, mid);
        mergeSort(mid + 1, hi);
        const left = a.slice(lo, mid + 1);
        const right = a.slice(mid + 1, hi + 1);
        let i = 0;
        let j = 0;
        let k = lo;
        while (i < left.length && j < right.length) {
          // Indices are where those items started; good enough to show which halves are compared.
          compare(lo + i, mid + 1 + j, 5);
          if (left[i] <= right[j]) write(k++, left[i++], 5); // <= keeps merge sort stable
          else write(k++, right[j++], 6);
        }
        while (i < left.length) write(k++, left[i++], 7);
        while (j < right.length) write(k++, right[j++], 7);
      };
      mergeSort(0, n - 1);
    },
    quick() {
      const quickSort = (lo, hi) => {
        if (lo > hi) return;
        if (lo === hi) return sorted(lo, 1);
        let i = lo;
        for (let j = lo; j < hi; j++) {
          compare(j, hi, 4);
          if (a[j] < a[hi]) {
            if (i !== j) swap(i, j, 5);
            i++;
          }
        }
        if (i !== hi) swap(i, hi, 6);
        sorted(i, 6);
        quickSort(lo, i - 1);
        quickSort(i + 1, hi);
      };
      quickSort(0, n - 1);
    },
    heap() {
      const siftDown = (i, size) => {
        for (;;) {
          const l = 2 * i + 1;
          const r = l + 1;
          let largest = i;
          if (l < size) {
            compare(l, largest, 4);
            if (a[l] > a[largest]) largest = l;
          }
          if (r < size) {
            compare(r, largest, 4);
            if (a[r] > a[largest]) largest = r;
          }
          if (largest === i) return;
          swap(i, largest, 5);
          i = largest;
        }
      };
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
      for (let end = n - 1; end > 0; end--) {
        swap(0, end, 2);
        sorted(end, 2);
        siftDown(0, end);
      }
    },
  };

  if (!algorithms[algorithm]) throw new RangeError(`Unknown algorithm: ${algorithm}`);
  algorithms[algorithm]();
  for (let i = 0; i < n; i++) sorted(i, 0); // final sweep marks whatever is left
  return steps;
}

/**
 * Apply one step to an array in place (the page and the tests replay steps with this).
 * compare/sorted: no change; swap: exchange a[i], a[j]; write: a[i] = value.
 * @param {number[]} a
 * @param {SortStep} step
 */
export function applyStep(a, step) {
  if (step.type === "swap") [a[step.i], a[step.j]] = [a[step.j], a[step.i]];
  else if (step.type === "write") a[step.i] = step.value;
}

/* ---------------- Data structures ---------------- */

/** @typedef {{value: number, left: BstNode|null, right: BstNode|null}} BstNode */

/**
 * Insert into a binary search tree without mutating it (return a new root; copy the path).
 * Duplicates are ignored.
 * @param {BstNode|null} root
 * @param {number} value
 * @returns {{root: BstNode, path: number[], inserted: boolean}}  path = values visited, ending
 *   with the new node (or the existing duplicate)
 */
export function bstInsert(root, value) {
  const path = [];
  let inserted = false;
  const insert = (node) => {
    if (!node) {
      inserted = true;
      path.push(value);
      return { value, left: null, right: null };
    }
    path.push(node.value);
    // Copy a node only if its subtree changed, so a duplicate returns the very same tree.
    if (value < node.value) {
      const left = insert(node.left);
      return left === node.left ? node : { ...node, left };
    }
    if (value > node.value) {
      const right = insert(node.right);
      return right === node.right ? node : { ...node, right };
    }
    return node; // duplicate: unchanged
  };
  return { root: insert(root), path, inserted };
}

/**
 * Delete from a BST (no mutation). Two children: replace with the in-order successor
 * (smallest value in the right subtree).
 * @returns {{root: BstNode|null, path: number[], found: boolean, children: number}}
 *   children = how many children the deleted node had (0, 1 or 2), for the explanation
 */
export function bstDelete(root, value) {
  const path = [];
  let found = false;
  let children = 0;
  const removeMin = (node) => (node.left ? { ...node, left: removeMin(node.left) } : node.right);
  const remove = (node) => {
    if (!node) return null;
    path.push(node.value);
    if (value < node.value) {
      const left = remove(node.left);
      return left === node.left ? node : { ...node, left };
    }
    if (value > node.value) {
      const right = remove(node.right);
      return right === node.right ? node : { ...node, right };
    }
    found = true;
    children = (node.left ? 1 : 0) + (node.right ? 1 : 0);
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    let successor = node.right;
    while (successor.left) successor = successor.left;
    return { value: successor.value, left: node.left, right: removeMin(node.right) };
  };
  return { root: remove(root), path, found, children };
}

/** @returns {{found: boolean, path: number[]}} */
export function bstSearch(root, value) {
  const path = [];
  for (let node = root; node; node = value < node.value ? node.left : node.right) {
    path.push(node.value);
    if (node.value === value) return { found: true, path };
  }
  return { found: false, path };
}

/**
 * Positions for drawing a tree: x = in-order rank, y = depth.
 * @param {BstNode|null} root
 * @returns {{value: number, x: number, y: number, parent: number|null}[]}  parent = index in this
 *   array (pre-order, so a parent always comes before its children)
 */
export function treeLayout(root) {
  const rank = new Map();
  let x = 0;
  const inorder = (node) => {
    if (!node) return;
    inorder(node.left);
    rank.set(node, x++);
    inorder(node.right);
  };
  inorder(root);
  const out = [];
  const preorder = (node, y, parent) => {
    if (!node) return;
    const index = out.push({ value: node.value, x: rank.get(node), y, parent }) - 1;
    preorder(node.left, y + 1, index);
    preorder(node.right, y + 1, index);
  };
  preorder(root, 0, null);
  return out;
}

/**
 * Push onto a binary min-heap stored as an array (no mutation), recording sift-up swaps.
 * @param {number[]} heap
 * @param {number} value
 * @returns {{heap: number[], swaps: [number, number][]}}  each swap is [child, parent]
 */
export function heapPush(heap, value) {
  const h = [...heap, value];
  const swaps = [];
  let i = h.length - 1;
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (h[parent] <= h[i]) break;
    [h[i], h[parent]] = [h[parent], h[i]];
    swaps.push([i, parent]);
    i = parent;
  }
  return { heap: h, swaps };
}

/**
 * Pop the minimum (no mutation), recording sift-down swaps.
 * @returns {{heap: number[], min: number|undefined, swaps: [number, number][]}}  swaps are [parent, child]
 */
export function heapPop(heap) {
  if (heap.length === 0) return { heap: [], min: undefined, swaps: [] };
  const h = [...heap];
  const min = h[0];
  const last = h.pop();
  const swaps = [];
  if (h.length > 0) {
    h[0] = last;
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let smallest = i;
      if (l < h.length && h[l] < h[smallest]) smallest = l;
      if (r < h.length && h[r] < h[smallest]) smallest = r;
      if (smallest === i) break;
      [h[i], h[smallest]] = [h[smallest], h[i]];
      swaps.push([i, smallest]);
      i = smallest;
    }
  }
  return { heap: h, min, swaps };
}

/**
 * Bucket index for a key: djb2 string hash (h = h * 33 + charCode, kept as a 32-bit int) mod size.
 * @param {string} key
 * @param {number} size  number of buckets, >= 1
 * @returns {number}  0 <= index < size
 */
export function hashIndex(key, size) {
  let h = 5381;
  for (let k = 0; k < key.length; k++) h = (Math.imul(h, 33) + key.charCodeAt(k)) | 0;
  return ((h % size) + size) % size; // h can be negative after 32-bit overflow
}

/* ---------------- Graphs ---------------- */

/**
 * Search a grid. grid[r][c] is the cost to enter that cell: 0 = wall, 1 = normal, 5 = weight.
 * BFS and DFS ignore costs when choosing (fewest steps / first found); Dijkstra and A* minimize cost.
 * A* uses the Manhattan distance. Neighbors in order: up, right, down, left.
 * @param {number[][]} grid
 * @param {[number, number]} start  [row, col]
 * @param {[number, number]} end
 * @param {"bfs"|"dfs"|"dijkstra"|"astar"} algorithm
 * @returns {{visited: [number, number][], path: [number, number][], cost: number}}
 *   visited in the order cells were taken off the frontier; path from start to end inclusive,
 *   [] if unreachable; cost = sum of grid values along the path excluding start (0 if no path).
 */
export function gridSearch(grid, start, end, algorithm) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const id = (r, c) => r * cols + c;
  const cell = (i) => [Math.floor(i / cols), i % cols];
  const startId = id(...start);
  const endId = id(...end);
  const neighbors = (i) => {
    const [r, c] = cell(i);
    const out = [];
    for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] > 0) out.push(id(nr, nc));
    }
    return out;
  };
  const cameFrom = new Map([[startId, null]]);
  const visited = [];
  let reached = false;

  if (algorithm === "bfs") {
    const queue = [startId];
    for (let head = 0; head < queue.length; head++) {
      const i = queue[head];
      visited.push(i);
      if (i === endId) {
        reached = true;
        break;
      }
      for (const n of neighbors(i)) {
        if (cameFrom.has(n)) continue;
        cameFrom.set(n, i);
        queue.push(n);
      }
    }
  } else if (algorithm === "dfs") {
    // Each stack entry remembers who pushed it; a cell is settled the first time it is popped.
    cameFrom.clear();
    const stack = [[startId, null]];
    while (stack.length) {
      const [i, from] = stack.pop();
      if (cameFrom.has(i)) continue;
      cameFrom.set(i, from);
      visited.push(i);
      if (i === endId) {
        reached = true;
        break;
      }
      // Push in reverse so "up" is popped (explored) first.
      for (const n of neighbors(i).reverse()) if (!cameFrom.has(n)) stack.push([n, i]);
    }
  } else if (algorithm === "dijkstra" || algorithm === "astar") {
    const [er, ec] = end;
    const h = (i) => {
      if (algorithm !== "astar") return 0;
      const [r, c] = cell(i);
      return Math.abs(r - er) + Math.abs(c - ec); // every move costs >= 1, so this never overestimates
    };
    const dist = new Map([[startId, 0]]);
    const done = new Set();
    const open = [startId]; // shortcut: scan for the minimum (fine for ~1000 cells); a binary heap scales better
    while (open.length) {
      let best = 0;
      for (let k = 1; k < open.length; k++) {
        const a = open[k];
        const b = open[best];
        const fa = dist.get(a) + h(a);
        const fb = dist.get(b) + h(b);
        if (fa < fb || (fa === fb && h(a) < h(b))) best = k; // ties: closer to the goal first
      }
      const i = open.splice(best, 1)[0];
      if (done.has(i)) continue;
      done.add(i);
      visited.push(i);
      if (i === endId) {
        reached = true;
        break;
      }
      for (const n of neighbors(i)) {
        const [nr, nc] = cell(n);
        const d = dist.get(i) + grid[nr][nc];
        if (!done.has(n) && d < (dist.get(n) ?? Infinity)) {
          dist.set(n, d);
          cameFrom.set(n, i);
          open.push(n);
        }
      }
    }
  } else {
    throw new RangeError(`Unknown algorithm: ${algorithm}`);
  }

  const path = [];
  if (reached) for (let i = endId; i !== null; i = cameFrom.get(i)) path.unshift(cell(i));
  const cost = path.slice(1).reduce((sum, [r, c]) => sum + grid[r][c], 0);
  return { visited: visited.map(cell), path, cost };
}

/**
 * Random maze for the "Random maze" button (recursive backtracker on odd cells).
 * @param {number} rows  odd
 * @param {number} cols  odd
 * @param {() => number} random  Math.random or a seeded generator (tests)
 * @returns {number[][]}  0 = wall, 1 = open; [1][1] and [rows-2][cols-2] are open
 */
export function generateMaze(rows, cols, random) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  grid[1][1] = 1;
  const stack = [[1, 1]];
  while (stack.length) {
    const [r, c] = stack.at(-1);
    const options = [[-2, 0], [0, 2], [2, 0], [0, -2]].filter(
      ([dr, dc]) => r + dr > 0 && r + dr < rows - 1 && c + dc > 0 && c + dc < cols - 1 && !grid[r + dr][c + dc],
    );
    if (!options.length) {
      stack.pop(); // dead end: back up
      continue;
    }
    const [dr, dc] = options[Math.floor(random() * options.length)];
    grid[r + dr / 2][c + dc / 2] = 1; // knock down the wall between
    grid[r + dr][c + dc] = 1;
    stack.push([r + dr, c + dc]);
  }
  return grid;
}

/* ---------------- Big-O ---------------- */

/** Growth functions plotted on the Big-O page (n >= 1). */
export const GROWTH = {
  1: () => 1,
  "log n": (n) => Math.log2(n),
  n: (n) => n,
  "n log n": (n) => n * Math.log2(n),
  "n^2": (n) => n ** 2,
  "n^3": (n) => n ** 3,
  "2^n": (n) => 2 ** n,
  "n!": (n) => (n <= 1 ? 1 : n * GROWTH["n!"](n - 1)),
};

/**
 * Which growth class best explains measured times? For each class f, fit time ≈ c·f(n)
 * by least squares (c = Σ t·f / Σ f²) and pick the class with the smallest relative error.
 * Only consider 1, log n, n, n log n, n^2, n^3.
 * @param {number[]} ns     input sizes
 * @param {number[]} times  matching times (ms)
 * @returns {string}  a key of GROWTH
 */
export function fitComplexity(ns, times) {
  // TODO (Plan CS step 4)
  void ns, times;
  throw new Error("Not implemented");
}

/* ---------------- Regex ---------------- */

/** Patterns for the preset menu on the Regex page. */
export const PRESETS = {
  email: { pattern: String.raw`\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b`, flags: "g" },
  url: { pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*`, flags: "gi" },
  phone: { pattern: String.raw`\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}`, flags: "g" },
  isoDate: { pattern: String.raw`\b\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b`, flags: "g" },
  hexColor: { pattern: String.raw`#(?:[0-9a-fA-F]{3}){1,2}\b`, flags: "g" },
  integer: { pattern: String.raw`-?\b\d+\b`, flags: "g" },
  decimal: { pattern: String.raw`-?\d+(?:\.\d+)?`, flags: "g" },
};

/**
 * Split a pattern into tokens with plain-English meanings for the Explanation list.
 * Handle at least: escapes (\d \w \s \b and their capitals, \. etc.), . ^ $ |, [sets] (incl. ranges
 * and ^), groups ( (?: (?<name> (?= (?! and ), quantifiers * + ? {n} {n,} {n,m} with lazy ?,
 * and literal characters (merge runs of literals into one token).
 * @param {string} pattern
 * @returns {{token: string, meaning: string}[]}
 */
export function explainRegex(pattern) {
  // TODO (Plan CS step 5)
  void pattern;
  throw new Error("Not implemented");
}

/**
 * All matches of pattern in text. Always searches globally (adds "g" if missing).
 * Guards: an empty match advances lastIndex by one (no infinite loop); stops after `limit`.
 * @param {string} pattern
 * @param {string} flags
 * @param {string} text
 * @param {number} [limit=1000]
 * @returns {{match: string, index: number, groups: string[]}[]}
 * @throws {SyntaxError} for an invalid pattern or flags (message shown to the user)
 */
export function findMatches(pattern, flags, text, limit = 1000) {
  // TODO (Plan CS step 5): new RegExp(...); loop with exec. Catastrophic backtracking can still
  // freeze the tab; later, run this in a Web Worker with a timeout.
  void pattern, flags, text, limit;
  throw new Error("Not implemented");
}

/**
 * Escape text so it matches literally inside a regex.
 * @param {string} text
 * @returns {string}
 */
export function escapeRegex(text) {
  // TODO (Plan CS step 5): backslash every one of . * + ? ^ $ { } ( ) | [ ] \ /
  void text;
  throw new Error("Not implemented");
}
