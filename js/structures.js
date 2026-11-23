// Data Structures page: stack, queue, linked list, BST, min-heap, hash table drawn in an SVG.
// BST, heap and hash logic live in cs-lib.js (tested); stack/queue/list are plain arrays here.
import {
  bstInsert,
  bstDelete,
  bstSearch,
  treeLayout,
  heapPush,
  heapPop,
  hashIndex,
} from "./cs-lib.js";

const HASH_BUCKETS = 8;
const MIN_W = 320; // drawings are 1:1 pixels; wide ones scroll inside .ds-scroll
const MAX = { stack: 12, queue: 12, list: 10, bst: 31, heap: 31, hash: 32 };

/** Button labels, input hint and cost of each operation, per structure. */
const OPS = {
  stack: {
    insert: ["Push", "O(1)"],
    remove: ["Pop", "O(1)"],
    search: ["Peek", "O(1)"],
    hint: "any value",
  },
  queue: {
    insert: ["Enqueue", "O(1)"],
    remove: ["Dequeue", "O(1)"],
    search: ["Front", "O(1)"],
    hint: "any value",
  },
  list: {
    insert: ["Insert at head", "O(1)"],
    remove: ["Delete", "O(n)"],
    search: ["Search", "O(n)"],
    hint: "any value",
  },
  bst: {
    insert: ["Insert", "O(h)"],
    remove: ["Delete", "O(h)"],
    search: ["Search", "O(h)"],
    hint: "a number",
  },
  heap: {
    insert: ["Push", "O(log n)"],
    remove: ["Pop min", "O(log n)"],
    search: ["Peek min", "O(1)"],
    hint: "a number",
  },
  hash: {
    insert: ["Add", "O(1) avg"],
    remove: ["Remove", "O(1) avg"],
    search: ["Find", "O(1) avg"],
    hint: "any key",
  },
};
// Operations that don't read the Value box.
const NO_VALUE = {
  stack: ["remove", "search"],
  queue: ["remove", "search"],
  heap: ["remove", "search"],
};

// One state per structure, so switching keeps what you built.
const state = {
  stack: [],
  queue: [],
  list: [],
  bst: null,
  heap: [],
  hash: Array.from({ length: HASH_BUCKETS }, () => []),
};

const $ = (id) => document.getElementById(id);
const kind = () => document.querySelector('[name="ds"]:checked').value;

/** Relabel the operation buttons and the Value hint for the chosen structure. */
function renderOps(k) {
  for (const button of $("ds-ops").querySelectorAll("button[data-op]")) {
    const op = OPS[k][button.dataset.op];
    if (op) button.textContent = op[0];
  }
  $("ds-value").placeholder = OPS[k].hint;
  $("ds-error").textContent = "";
}

function log(text) {
  const list = $("ds-log");
  list.append(Object.assign(document.createElement("li"), { textContent: text }));
  while (list.children.length > 40) list.firstElementChild.remove();
  list.scrollTop = list.scrollHeight;
}

/**
 * Validate the Value box for this structure and operation.
 * @returns {{value: string|number}|{error: string}}
 */
function readValue(k, op, raw) {
  const text = raw.trim();
  if (NO_VALUE[k]?.includes(op)) return { value: null };
  if (!text) return { error: `Type ${OPS[k].hint} first.` };
  if (k !== "bst" && k !== "heap") return { value: text };
  const n = Number(text);
  if (!Number.isFinite(n))
    return {
      error: `"${text}" isn't a number. The ${k === "bst" ? "tree" : "heap"} compares numbers.`,
    };
  if (Math.abs(n) > 9999)
    return { error: "Keep numbers between -9999 and 9999 so they fit in a node." };
  return { value: n };
}

const size = (k) =>
  k === "bst"
    ? treeLayout(state.bst).length
    : k === "hash"
      ? state.hash.flat().length
      : state[k].length;

/**
 * Run one operation, log a plain-English explanation, and redraw with highlights.
 * @param {string} k  structure
 * @param {"insert"|"remove"|"search"|"clear"} op
 * @param {string} raw  the Value box text
 */
function run(k, op, raw) {
  $("ds-error").textContent = "";
  if (op === "clear") {
    state[k] =
      k === "bst" ? null : k === "hash" ? Array.from({ length: HASH_BUCKETS }, () => []) : [];
    log(
      `Cleared the ${$("ds-kind").querySelector(":checked").parentElement.textContent.trim().toLowerCase()}.`,
    );
    draw(k);
    $("ds-cost").textContent = "-";
    return;
  }
  const read = readValue(k, op, raw);
  if (read.error) {
    $("ds-error").textContent = read.error;
    return;
  }
  if (op === "insert" && size(k) >= MAX[k]) {
    $("ds-error").textContent =
      `That's ${MAX[k]} items, the most that fits on screen. Remove some or Clear.`;
    return;
  }
  const v = read.value;
  const [name, cost] = OPS[k][op];
  $("ds-cost").textContent = `${name}: ${cost}`;
  const result = OPERATIONS[k][op](v);
  if (result.error) {
    $("ds-error").textContent = result.error;
    draw(k);
    return;
  }
  log(result.text);
  draw(k, result.highlight);
  if (op === "insert") $("ds-value").select();
}

/* Each operation updates state[k] and returns {text, highlight} or {error}.
   highlight: {hit: [...keys on the path], focus: key}; keys are indexes, BST values, or "bucket:slot". */
const OPERATIONS = {
  stack: {
    insert(v) {
      state.stack.push(v);
      return { text: `Push ${v}: it goes on top.`, highlight: { focus: state.stack.length - 1 } };
    },
    remove() {
      if (!state.stack.length) return { error: "The stack is empty." };
      const v = state.stack.pop();
      return {
        text: `Pop: removed ${v} from the top.`,
        highlight: { focus: state.stack.length - 1 },
      };
    },
    search() {
      if (!state.stack.length) return { error: "The stack is empty." };
      return {
        text: `Peek: the top is ${state.stack.at(-1)} (not removed).`,
        highlight: { focus: state.stack.length - 1 },
      };
    },
  },
  queue: {
    insert(v) {
      state.queue.push(v);
      return {
        text: `Enqueue ${v}: it joins the rear.`,
        highlight: { focus: state.queue.length - 1 },
      };
    },
    remove() {
      if (!state.queue.length) return { error: "The queue is empty." };
      const v = state.queue.shift();
      return {
        text: `Dequeue: removed ${v} from the front (first in, first out).`,
        highlight: { focus: 0 },
      };
    },
    search() {
      if (!state.queue.length) return { error: "The queue is empty." };
      return { text: `Front: ${state.queue[0]} is next to leave.`, highlight: { focus: 0 } };
    },
  },
  list: {
    insert(v) {
      state.list.unshift(v);
      return {
        text: `Insert ${v} at the head: the new node points to the old head.`,
        highlight: { focus: 0 },
      };
    },
    remove(v) {
      const i = state.list.findIndex((x) => String(x) === String(v));
      const walked = i === -1 ? state.list.length : i + 1;
      if (i === -1)
        return {
          text: `Delete ${v}: not found after checking ${walked} node(s).`,
          highlight: { hit: indexes(walked) },
        };
      state.list.splice(i, 1);
      const how = i === 0 ? "moved head to the next node" : `node ${i - 1} now points past it`;
      return {
        text: `Delete ${v}: walked ${walked} node(s), then ${how}.`,
        highlight: { hit: indexes(i) },
      };
    },
    search(v) {
      const i = state.list.findIndex((x) => String(x) === String(v));
      if (i === -1)
        return {
          text: `Search ${v}: not found after checking ${state.list.length} node(s).`,
          highlight: { hit: indexes(state.list.length) },
        };
      return {
        text: `Search ${v}: found at position ${i} after checking ${i + 1} node(s).`,
        highlight: { hit: indexes(i), focus: i },
      };
    },
  },
  bst: {
    insert(v) {
      const r = bstInsert(state.bst, v);
      state.bst = r.root;
      const route = r.path.join(" → ");
      return r.inserted
        ? {
            text: `Insert ${v}: ${route} (smaller goes left, larger goes right).`,
            highlight: { hit: r.path, focus: v },
          }
        : {
            text: `Insert ${v}: already in the tree (${route}); values stay unique.`,
            highlight: { hit: r.path, focus: v },
          };
    },
    remove(v) {
      const r = bstDelete(state.bst, v);
      if (!r.found)
        return {
          text: `Delete ${v}: not found (${r.path.join(" → ") || "empty tree"}).`,
          highlight: { hit: r.path },
        };
      state.bst = r.root;
      const how = [
        "it was a leaf, so it is simply removed",
        "it had one child, which takes its place",
        "it had two children, so its in-order successor (smallest value on the right) takes its place",
      ][r.children];
      return {
        text: `Delete ${v}: ${r.path.join(" → ")}; ${how}.`,
        highlight: { hit: r.path.slice(0, -1) },
      };
    },
    search(v) {
      const r = bstSearch(state.bst, v);
      const route = r.path.join(" → ") || "empty tree";
      return {
        text: `Search ${v}: ${route}, ${r.found ? "found" : "not found"}.`,
        highlight: { hit: r.path, focus: r.found ? v : undefined },
      };
    },
  },
  heap: {
    insert(v) {
      const r = heapPush(state.heap, v);
      state.heap = r.heap;
      const end = r.swaps.length ? r.swaps.at(-1)[1] : r.heap.length - 1;
      return {
        text: `Push ${v}: added at index ${r.heap.length - 1}, sifted up with ${r.swaps.length} swap(s) to index ${end}.`,
        highlight: { hit: r.swaps.flat(), focus: end },
      };
    },
    remove() {
      if (!state.heap.length) return { error: "The heap is empty." };
      const r = heapPop(state.heap);
      state.heap = r.heap;
      return {
        text: `Pop min: removed ${r.min}; the last item moved to the root and sifted down with ${r.swaps.length} swap(s).`,
        highlight: { hit: r.swaps.flat() },
      };
    },
    search() {
      if (!state.heap.length) return { error: "The heap is empty." };
      return {
        text: `Peek min: ${state.heap[0]} (the minimum is always at index 0).`,
        highlight: { focus: 0 },
      };
    },
  },
  hash: {
    insert(key) {
      const b = hashIndex(key, HASH_BUCKETS);
      const bucket = state.hash[b];
      if (bucket.includes(key))
        return {
          text: `Add "${key}": hash → bucket ${b}; already there.`,
          highlight: { focus: `${b}:${bucket.indexOf(key)}` },
        };
      bucket.push(key);
      const collision =
        bucket.length > 1 ? ` Collision: chained after ${bucket.length - 1} key(s).` : "";
      return {
        text: `Add "${key}": hash("${key}") mod ${HASH_BUCKETS} = bucket ${b}.${collision}`,
        highlight: { focus: `${b}:${bucket.length - 1}` },
      };
    },
    remove(key) {
      const b = hashIndex(key, HASH_BUCKETS);
      const i = state.hash[b].indexOf(key);
      if (i === -1)
        return {
          text: `Remove "${key}": bucket ${b} doesn't have it.`,
          highlight: { hit: [`${b}:bucket`] },
        };
      state.hash[b].splice(i, 1);
      return {
        text: `Remove "${key}": found in bucket ${b} and unlinked.`,
        highlight: { hit: [`${b}:bucket`] },
      };
    },
    search(key) {
      const b = hashIndex(key, HASH_BUCKETS);
      const i = state.hash[b].indexOf(key);
      const checked = i === -1 ? state.hash[b].length : i + 1;
      return {
        text: `Find "${key}": bucket ${b}, ${i === -1 ? "not found" : "found"} after checking ${checked} key(s).`,
        highlight: {
          hit: [`${b}:bucket`, ...indexes(i === -1 ? checked : i).map((s) => `${b}:${s}`)],
          focus: i === -1 ? undefined : `${b}:${i}`,
        },
      };
    },
  },
};

const indexes = (n) => Array.from({ length: n }, (_, i) => i);

/* ---------------- Drawing ---------------- */

const NS = "http://www.w3.org/2000/svg";
function svg(name, attrs, text) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = String(text);
  return node;
}

/** Node class: path nodes pulse one after another (--d), the target gets .focus. */
function cls(key, highlight, base) {
  const h = highlight ?? {};
  const order = (h.hit ?? []).indexOf(key);
  return {
    class: `${base}${order >= 0 ? " hit" : ""}${h.focus === key ? " focus" : ""}`,
    style: `--d: ${Math.max(order, 0) * 120}ms`,
  };
}

function box(x, y, w, h, label, key, highlight) {
  const g = svg("g", cls(key, highlight, "ds-node"));
  g.append(
    svg("rect", { x, y, width: w, height: h, rx: 8 }),
    svg("text", { x: x + w / 2, y: y + h / 2 }, label),
  );
  return g;
}

function circle(x, y, label, key, highlight) {
  const g = svg("g", cls(key, highlight, "ds-node"));
  g.append(svg("circle", { cx: x, cy: y, r: 22 }), svg("text", { x, y }, label));
  return g;
}

const line = (x1, y1, x2, y2, arrow = false) =>
  svg("line", {
    x1,
    y1,
    x2,
    y2,
    class: "ds-edge",
    ...(arrow && { "marker-end": "url(#ds-arrow)" }),
  });
const label = (x, y, text, anchor = "middle") =>
  svg("text", { x, y, class: "ds-label", "text-anchor": anchor }, text);

/** Each drawer returns {width, height, items}. */
const DRAW = {
  stack(highlight) {
    const items = [];
    const n = state.stack.length;
    state.stack.forEach((v, i) => {
      const y = 30 + (n - 1 - i) * 46;
      items.push(box(90, y, 180, 40, v, i, highlight));
      if (i === n - 1) items.push(label(80, y + 20, "top →", "end"));
    });
    if (!n) items.push(label(MIN_W / 2, 60, "Empty stack. Push something."));
    return { width: MIN_W, height: Math.max(120, 60 + n * 46), items };
  },
  queue(highlight) {
    const items = [];
    const n = state.queue.length;
    state.queue.forEach((v, i) => {
      items.push(box(40 + i * 100, 50, 88, 48, v, i, highlight));
      if (i > 0) items.push(line(40 + i * 100 - 12, 74, 40 + i * 100, 74));
    });
    if (n) items.push(label(84, 38, "front"), label(40 + (n - 1) * 100 + 44, 125, "rear"));
    else items.push(label(MIN_W / 2, 60, "Empty queue. Enqueue something."));
    return { width: Math.max(MIN_W, 40 + n * 100), height: 150, items };
  },
  list(highlight) {
    const items = [];
    const n = state.list.length;
    state.list.forEach((v, i) => {
      const x = 40 + i * 130;
      items.push(box(x, 50, 70, 44, v, i, highlight));
      items.push(
        svg("rect", { x: x + 70, y: 50, width: 24, height: 44, rx: 4, class: "ds-pointer" }),
      );
      items.push(line(x + 82, 72, x + 128, 72, true));
    });
    items.push(label(40 + n * 130 + 18, 77, "null", "start"));
    if (n) items.push(label(75, 38, "head"));
    return { width: Math.max(MIN_W, 100 + n * 130), height: 130, items };
  },
  bst(highlight) {
    const nodes = treeLayout(state.bst);
    const items = [];
    const X = (n) => 28 + n.x * 50;
    const Y = (n) => 40 + n.y * 70;
    for (const n of nodes)
      if (n.parent !== null) items.push(line(X(nodes[n.parent]), Y(nodes[n.parent]), X(n), Y(n)));
    for (const n of nodes) items.push(circle(X(n), Y(n), n.value, n.value, highlight));
    if (!nodes.length) items.push(label(MIN_W / 2, 40, "Empty tree. Insert numbers."));
    const depth = Math.max(0, ...nodes.map((n) => n.y));
    return { width: Math.max(MIN_W, 6 + nodes.length * 50), height: 84 + depth * 70, items };
  },
  heap(highlight) {
    const h = state.heap;
    const levels = h.length ? Math.floor(Math.log2(h.length)) + 1 : 1;
    const width = Math.max(MIN_W, 2 ** (levels - 1) * 56);
    const pos = (i) => {
      const level = Math.floor(Math.log2(i + 1));
      const slot = i + 1 - 2 ** level;
      return [(slot + 0.5) * (width / 2 ** level), 40 + level * 70];
    };
    const items = [];
    h.forEach((_, i) => i && items.push(line(...pos(Math.floor((i - 1) / 2)), ...pos(i))));
    h.forEach((v, i) => items.push(circle(...pos(i), v, i, highlight)));
    // The same heap as the array it really is.
    const arrayY = 40 + levels * 70;
    items.push(label(20, arrayY + 28, "array:", "start"));
    h.forEach((v, i) => {
      items.push(box(80 + i * 46, arrayY, 42, 40, v, i, highlight));
      items.push(label(80 + i * 46 + 21, arrayY + 56, i));
    });
    if (!h.length) items.push(label(MIN_W / 2, 40, "Empty heap. Push numbers."));
    return { width: Math.max(width, 120 + h.length * 46), height: arrayY + 70, items };
  },
  hash(highlight) {
    const items = [];
    let widest = 0;
    state.hash.forEach((bucket, b) => {
      const y = 20 + b * 52;
      items.push(box(40, y, 56, 40, b, `${b}:bucket`, highlight));
      bucket.forEach((key, s) => {
        const x = 130 + s * 140;
        items.push(line(x - 34, y + 20, x, y + 20, true));
        items.push(box(x, y, 110, 40, key, `${b}:${s}`, highlight));
      });
      widest = Math.max(widest, bucket.length);
    });
    return { width: Math.max(MIN_W, 120 + widest * 140), height: 20 + HASH_BUCKETS * 52, items };
  },
};

/** Redraw #ds-canvas for structure k and update the Size / Height stats. */
function draw(k, highlight) {
  const canvas = $("ds-canvas");
  const { width, height, items } = DRAW[k](highlight);
  const defs = svg("defs", {});
  const marker = svg("marker", {
    id: "ds-arrow",
    viewBox: "0 0 10 10",
    refX: 9,
    refY: 5,
    markerWidth: 7,
    markerHeight: 7,
    orient: "auto-start-reverse",
  });
  marker.append(svg("path", { d: "M0 0 L10 5 L0 10 z", class: "ds-arrowhead" }));
  defs.append(marker);
  canvas.setAttribute("viewBox", `0 0 ${width} ${height}`);
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
  canvas.replaceChildren(defs, ...items);

  $("ds-size").textContent = size(k);
  const heightLabel = $("ds-height").previousElementSibling;
  if (k === "hash") {
    heightLabel.textContent = "Load factor";
    $("ds-height").textContent = (size(k) / HASH_BUCKETS).toFixed(2);
  } else {
    heightLabel.textContent = "Height";
    // Height in edges: one node = 0. Linear structures don't have one.
    const n = size(k);
    $("ds-height").textContent =
      !n || !(k === "bst" || k === "heap")
        ? "-"
        : k === "heap"
          ? Math.floor(Math.log2(n))
          : Math.max(...treeLayout(state.bst).map((node) => node.y));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("ds-kind").addEventListener("change", () => {
    renderOps(kind());
    draw(kind());
    $("ds-cost").textContent = "-";
  });
  $("ds-form").addEventListener("submit", (e) => {
    e.preventDefault();
    run(kind(), "insert", $("ds-value").value);
  });
  $("ds-ops").addEventListener("click", (e) => {
    const button = e.target.closest("button[data-op]");
    if (button && button.type !== "submit") run(kind(), button.dataset.op, $("ds-value").value);
  });
  renderOps(kind());
  draw(kind());
});
