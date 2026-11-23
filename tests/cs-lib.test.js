// Tests for js/cs-lib.js. Run: npm test
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

test("BST: duplicates, leaf / one-child / root deletes, missing value", () => {
  const build = (values) => values.reduce((root, v) => bstInsert(root, v).root, null);
  const inorder = (node) => (node ? [...inorder(node.left), node.value, ...inorder(node.right)] : []);
  const root = build([8, 3, 10, 1, 6, 14, 13]);
  const dup = bstInsert(root, 6);
  assert.equal(dup.inserted, false);
  assert.equal(dup.root, root, "duplicate leaves the tree as is");
  assert.deepEqual(bstInsert(root, 7).path, [8, 3, 6, 7]);
  for (const [value, children] of [[1, 0], [14, 1], [8, 2]]) {
    const r = bstDelete(root, value);
    assert.equal(r.found, true);
    assert.equal(r.children, children, `children of ${value}`);
    assert.deepEqual(inorder(r.root), [1, 3, 6, 8, 10, 13, 14].filter((v) => v !== value));
  }
  const missing = bstDelete(root, 99);
  assert.equal(missing.found, false);
  assert.equal(missing.root, root, "deleting a missing value leaves the tree as is");
  assert.equal(bstDelete(build([5]), 5).root, null);
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

test("min-heap: random pushes and pops match a sort; swaps are recorded; empty pop", () => {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const values = Array.from({ length: 40 }, () => Math.floor(random() * 20));
  let heap = values.reduce((h, v) => heapPush(h, v).heap, []);
  const popped = [];
  while (heap.length) {
    const r = heapPop(heap);
    popped.push(r.min);
    heap = r.heap;
  }
  assert.deepEqual(popped, [...values].sort((a, b) => a - b));
  assert.deepEqual(heapPush([1, 5, 8], 0).swaps, [[3, 1], [1, 0]]);
  assert.deepEqual(heapPop([]), { heap: [], min: undefined, swaps: [] });
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

test("gridSearch: random weighted grids, all four algorithms", () => {
  let seed = 3;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let trial = 0; trial < 30; trial++) {
    const grid = Array.from({ length: 9 }, () =>
      Array.from({ length: 12 }, () => (random() < 0.25 ? 0 : random() < 0.2 ? 5 : 1)),
    );
    grid[0][0] = 1;
    grid[8][11] = 1;
    const results = Object.fromEntries(
      ["bfs", "dfs", "dijkstra", "astar"].map((a) => [a, gridSearch(grid, [0, 0], [8, 11], a)]),
    );
    const reachable = results.bfs.path.length > 0;
    for (const [name, { path, cost }] of Object.entries(results)) {
      assert.equal(path.length > 0, reachable, `${name} agrees on reachability`);
      for (let k = 1; k < path.length; k++) {
        const [[r1, c1], [r2, c2]] = [path[k - 1], path[k]];
        assert.equal(Math.abs(r1 - r2) + Math.abs(c1 - c2), 1, `${name} path steps are adjacent`);
        assert.ok(grid[r2][c2] > 0, `${name} path avoids walls`);
      }
      assert.equal(cost, path.slice(1).reduce((s, [r, c]) => s + grid[r][c], 0));
    }
    if (!reachable) continue;
    // BFS has the fewest moves; Dijkstra and A* the lowest cost, and they agree.
    for (const name of ["dfs", "dijkstra", "astar"]) assert.ok(results[name].path.length >= results.bfs.path.length);
    assert.equal(results.astar.cost, results.dijkstra.cost);
    for (const name of ["bfs", "dfs"]) assert.ok(results[name].cost >= results.dijkstra.cost);
  }
});

test("gridSearch: start equals end; unknown algorithm", () => {
  assert.deepEqual(gridSearch(OPEN, [1, 2], [1, 2], "astar"), { visited: [[1, 2]], path: [[1, 2]], cost: 0 });
  assert.throws(() => gridSearch(OPEN, [0, 0], [2, 2], "teleport"), RangeError);
});

test("generateMaze: every open cell is reachable (one connected maze)", () => {
  let seed = 11;
  const maze = generateMaze(21, 41, () => (seed = (seed * 16807) % 2147483647) / 2147483647);
  const open = maze.flat().filter((v) => v === 1).length;
  const { visited } = gridSearch(maze, [1, 1], [-1, -1], "bfs"); // unreachable end: BFS floods everything
  assert.equal(visited.length, open);
  assert.ok(maze[0].every((v) => v === 0) && maze.every((row) => row[0] === 0), "outer wall intact");
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

test("fitComplexity recognizes each class, even with ±10% noise", () => {
  const ns = [1000, 2000, 4000, 8000, 16000];
  const noise = [1.08, 0.93, 1.05, 0.97, 1.1];
  for (const name of ["1", "log n", "n", "n log n", "n^2", "n^3"]) {
    const exact = fitComplexity(ns, ns.map((n) => 1e-3 * GROWTH[name](n)));
    assert.equal(exact.best, name, `${name} exact`);
    assert.ok(Math.abs(exact.c - 1e-3) < 1e-9, `${name} constant`);
    if (name === "1" || name === "log n") continue; // these two differ by less than the noise
    assert.equal(fitComplexity(ns, ns.map((n, i) => 1e-3 * GROWTH[name](n) * noise[i])).best, name, `${name} noisy`);
  }
});

test("fitComplexity ignores zero times and needs two points", () => {
  assert.equal(fitComplexity([1000, 2000, 4000], [0, 0.4, 1.6]).best, "n^2");
  assert.equal(fitComplexity([1000, 2000], [0, 0.5]), null);
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

test("explainRegex: literal runs, lazy quantifiers, groups, sets, escapes", () => {
  const explain = (p) => explainRegex(p).map((t) => t.token);
  const meaning = (p, token) => explainRegex(p).find((t) => t.token === token).meaning;
  assert.deepEqual(explain("abc+d"), ["ab", "c", "+", "d"], "a quantifier repeats only the last character");
  assert.match(meaning("a*?", "*?"), /0 or more.*as few as possible/);
  assert.match(meaning("x{2,}", "{2,}"), /2 or more/);
  assert.match(meaning("x{2,5}", "{2,5}"), /2 to 5/);
  assert.match(meaning("(a)(?<year>b)(?:c)", "(?<year>"), /group 2, named "year"/);
  assert.match(meaning("(?:c)", "(?:"), /doesn't capture/);
  assert.match(meaning("[^a-z0]", "[^a-z0]"), /NOT any of: a to z, "0"/);
  assert.match(meaning(String.raw`\.`, String.raw`\.`), /"\." \(escaped/);
  assert.match(meaning(String.raw`(a)\1`, String.raw`\1`), /group 1/);
  assert.deepEqual(explain("a|b"), ["a", "|", "b"]);
  assert.ok(explainRegex(String.raw`^(\w+)@[\w.-]+\.(com|org)$`).every((t) => t.meaning.length > 0));
});

test("findMatches: unmatched groups are undefined; empty matches step over emoji in u mode", () => {
  assert.deepEqual(findMatches("(a)|(b)", "", "b")[0].groups, [undefined, "b"]);
  const matches = findMatches("", "u", "😀x");
  assert.deepEqual(matches.map((m) => m.index), [0, 2, 3], "never lands between the two halves of 😀");
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
