// Tests for js/cs-lib.js. They fail until the matching TODOs are done.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sortSteps,
  PSEUDOCODE,
  applyStep,
  bstInsert,
  bstDelete,
  bstSearch,
  treeLayout,
  heapPush,
  heapPop,
  hashIndex,
  gridSearch,
  generateMaze,
  fitComplexity,
  GROWTH,
  explainRegex,
  findMatches,
  escapeRegex,
  PRESETS,
} from "../js/cs-lib.js";

const ALGORITHMS = ["bubble", "insertion", "selection", "merge", "quick", "heap"];
const SAMPLE = [5, 1, 4, 2, 8, 2, 9, 0];

for (const algorithm of ALGORITHMS) {
  test(`sortSteps(${algorithm}): replaying the steps sorts the array`, () => {
    const steps = sortSteps(algorithm, SAMPLE);
    const a = [...SAMPLE];
    for (const step of steps) applyStep(a, step);
    assert.deepEqual(a, [...SAMPLE].sort((x, y) => x - y));
    assert.deepEqual(SAMPLE, [5, 1, 4, 2, 8, 2, 9, 0], "input not modified");
    assert.ok(steps.some((s) => s.type === "compare"));
  });
}

test("sortSteps: already sorted bubble sort makes no swaps", () => {
  assert.ok(!sortSteps("bubble", [1, 2, 3, 4]).some((s) => s.type === "swap"));
});

test("sortSteps: random arrays with duplicates, plus empty and one-element arrays", () => {
  let seed = 42;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const arrays = [[], [7]];
  for (let k = 0; k < 20; k++) {
    arrays.push(Array.from({ length: 1 + Math.floor(random() * 40) }, () => Math.floor(random() * 10)));
  }
  for (const algorithm of ALGORITHMS) {
    for (const values of arrays) {
      const steps = sortSteps(algorithm, values);
      const a = [...values];
      for (const step of steps) applyStep(a, step);
      assert.deepEqual(a, [...values].sort((x, y) => x - y), `${algorithm} ${values}`);
      // Every index is marked sorted exactly once, and every step points at a real pseudocode line.
      const marked = steps.filter((s) => s.type === "sorted").map((s) => s.i).sort((x, y) => x - y);
      assert.deepEqual(marked, values.map((_, i) => i), `${algorithm} sorted marks`);
      assert.ok(steps.every((s) => Number.isInteger(s.line) && PSEUDOCODE[algorithm][s.line] !== undefined));
    }
  }
});

test("sortSteps: unknown algorithm throws", () => {
  assert.throws(() => sortSteps("bogo", [2, 1]), RangeError);
});

test("BST insert/search/delete", () => {
  let root = null;
  for (const v of [8, 3, 10, 1, 6, 14]) root = bstInsert(root, v).root;
  assert.deepEqual(bstSearch(root, 6), { found: true, path: [8, 3, 6] });
  assert.equal(bstSearch(root, 7).found, false);
  const { root: after, found } = bstDelete(root, 3); // two children -> successor 6
  assert.equal(found, true);
  assert.equal(after.left.value, 6);
  assert.equal(bstSearch(root, 3).found, true, "original tree unchanged");
});

test("treeLayout: x is in-order rank, y is depth", () => {
  let root = null;
  for (const v of [2, 1, 3]) root = bstInsert(root, v).root;
  const nodes = treeLayout(root);
  const byValue = Object.fromEntries(nodes.map((n) => [n.value, n]));
  assert.deepEqual([byValue[1].x, byValue[2].x, byValue[3].x], [0, 1, 2]);
  assert.deepEqual([byValue[1].y, byValue[2].y, byValue[3].y], [1, 0, 1]);
});

test("min-heap push/pop returns values in order", () => {
  let heap = [];
  for (const v of [5, 3, 8, 1, 9, 2]) heap = heapPush(heap, v).heap;
  assert.equal(heap[0], 1);
  const out = [];
  while (heap.length) {
    const r = heapPop(heap);
    out.push(r.min);
    heap = r.heap;
  }
  assert.deepEqual(out, [1, 2, 3, 5, 8, 9]);
});

test("hashIndex: deterministic and in range", () => {
  assert.equal(hashIndex("apple", 8), hashIndex("apple", 8));
  for (const k of ["", "a", "banana", "zzzzzzzzzzzzzzzzzzzz"]) {
    const i = hashIndex(k, 8);
    assert.ok(Number.isInteger(i) && i >= 0 && i < 8, k);
  }
});

const OPEN = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
];

test("gridSearch: BFS finds a shortest path around a wall", () => {
  const { path, visited } = gridSearch(OPEN, [0, 0], [2, 2], "bfs");
  assert.equal(path.length, 5); // 4 moves
  assert.deepEqual(path[0], [0, 0]);
  assert.deepEqual(path.at(-1), [2, 2]);
  assert.ok(visited.length >= path.length);
});

test("gridSearch: no path when blocked", () => {
  const blocked = [
    [1, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ];
  assert.deepEqual(gridSearch(blocked, [0, 0], [2, 2], "dijkstra").path, []);
});

test("gridSearch: Dijkstra and A* avoid an expensive cell; BFS doesn't care", () => {
  const grid = [
    [1, 5, 1],
    [1, 1, 1],
  ];
  const d = gridSearch(grid, [0, 0], [0, 2], "dijkstra");
  const a = gridSearch(grid, [0, 0], [0, 2], "astar");
  assert.equal(d.cost, 4); // down, right, right, up
  assert.equal(a.cost, d.cost);
  assert.equal(gridSearch(grid, [0, 0], [0, 2], "bfs").path.length, 3);
});

test("generateMaze: size, values, open corners", () => {
  let seed = 1;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const maze = generateMaze(11, 15, random);
  assert.equal(maze.length, 11);
  assert.ok(maze.every((row) => row.length === 15 && row.every((v) => v === 0 || v === 1)));
  assert.equal(maze[1][1], 1);
  assert.equal(maze[9][13], 1);
});

test("fitComplexity recognizes n^2 and n log n", () => {
  const ns = [1000, 2000, 4000, 8000];
  assert.equal(fitComplexity(ns, ns.map((n) => 3e-6 * n * n)), "n^2");
  assert.equal(fitComplexity(ns, ns.map((n) => 2e-4 * GROWTH["n log n"](n))), "n log n");
});

test("explainRegex tokens", () => {
  const tokens = explainRegex(String.raw`^\d{3}-[a-z]+$`).map((t) => t.token);
  assert.deepEqual(tokens, ["^", String.raw`\d`, "{3}", "-", "[a-z]", "+", "$"]);
  assert.ok(explainRegex("(?:ab)|c").every((t) => t.meaning.length > 0));
});

test("findMatches: groups, indexes, empty matches, bad pattern", () => {
  assert.deepEqual(findMatches(String.raw`(\w)(\d)`, "", "a1 b2"), [
    { match: "a1", index: 0, groups: ["a", "1"] },
    { match: "b2", index: 3, groups: ["b", "2"] },
  ]);
  assert.equal(findMatches("x*", "g", "abc").length, 4); // empty match at each position, no hang
  assert.equal(findMatches("a", "g", "aaaa", 2).length, 2);
  assert.throws(() => findMatches("(", "g", "x"), SyntaxError);
});

test("escapeRegex makes text literal", () => {
  const text = "1+1=2? (yes) [a] {b} ^$ | \\ /";
  assert.ok(new RegExp(escapeRegex(text)).test(text));
});

test("PRESETS compile and match examples", () => {
  const examples = {
    email: "hello@example.com",
    url: "https://example.com/a?b=1",
    phone: "(715) 555-0123",
    isoDate: "2026-11-22",
    hexColor: "#1e9bd7",
    integer: "-42",
    decimal: "3.14",
  };
  for (const [name, example] of Object.entries(examples)) {
    const { pattern, flags } = PRESETS[name];
    assert.ok(new RegExp(pattern, flags).test(example), name);
  }
});
