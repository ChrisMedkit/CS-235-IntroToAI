// Data Structures page: stack, queue, linked list, BST, min-heap, hash table drawn in an SVG.
import { bstInsert, bstDelete, bstSearch, treeLayout, heapPush, heapPop, hashIndex } from "./cs-lib.js";

const HASH_BUCKETS = 8;

// One state per structure so switching tabs keeps what you built.
const state = { stack: [], queue: [], list: [], bst: null, heap: [], hash: Array.from({ length: HASH_BUCKETS }, () => []) };

/** Relabel #ds-ops buttons for the chosen structure (Push/Pop/Peek, Enqueue/Dequeue/Front, ...). */
function renderOps(kind) {
  // TODO (Plan CS step 2b)
  void kind;
}

/**
 * Run an operation, append a plain-English line to #ds-log, then draw().
 * Stack/queue/list are plain arrays here; BST, heap and hash use cs-lib.js.
 * @param {string} kind
 * @param {"insert"|"remove"|"search"|"clear"} op
 * @param {string} raw  the #ds-value text (numbers for bst/heap; any key for hash)
 */
function run(kind, op, raw) {
  // TODO (Plan CS step 2c): validate raw (show #ds-error), call the lib, log, draw(kind, highlight path).
  void kind, op, raw, state, bstInsert, bstDelete, bstSearch, heapPush, heapPop, hashIndex;
}

/**
 * Draw into #ds-canvas: boxes for stack/queue/list (arrows for the list), circles + lines for
 * BST (treeLayout) and heap (array index layout), bucket rows for the hash table.
 * Build SVG with createElementNS; values via textContent.
 */
function draw(kind, highlight = []) {
  // TODO (Plan CS step 2d): also update #ds-size and #ds-height.
  void kind, highlight, treeLayout, HASH_BUCKETS;
}

document.addEventListener("DOMContentLoaded", () => {
  const kind = () => document.querySelector('[name="ds"]:checked').value;
  document.getElementById("ds-kind")?.addEventListener("change", () => {
    renderOps(kind());
    draw(kind());
  });
  document.getElementById("ds-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    run(kind(), "insert", document.getElementById("ds-value").value);
  });
  document.getElementById("ds-ops")?.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-op]");
    if (button && button.type !== "submit") run(kind(), button.dataset.op, document.getElementById("ds-value").value);
  });
});
