// Tests for js/utils.js. Run: npm test (Node's built-in test runner, nothing to install).
// All fail until the matching TODOs are done.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sample2D,
  sampleSurface,
  parseMatrix,
  rref,
  formatNumber,
  cleanOcrText,
  toLatexDocument,
  filterTools,
} from "../js/utils.js";
import { TOOLS } from "../js/tools.js";
import { STICKERS } from "../js/stickers.js";

test("sample2D: evenly spaced, endpoints included", () => {
  const { x, y } = sample2D((t) => 2 * t, 0, 1, 3);
  assert.deepEqual(x, [0, 0.5, 1]);
  assert.deepEqual(y, [0, 1, 2]);
});

test("sample2D: non-finite values become null (asymptotes)", () => {
  const { y } = sample2D((t) => 1 / t, -1, 1, 3);
  assert.deepEqual(y, [-1, null, 1]);
});

test("sample2D: rejects n < 2 and empty window", () => {
  assert.throws(() => sample2D((t) => t, 0, 1, 1), RangeError);
  assert.throws(() => sample2D((t) => t, 1, 1, 10), RangeError);
});

test("sampleSurface: z[j][i] = f(x[i], y[j])", () => {
  const { x, y, z } = sampleSurface((a, b) => a + 10 * b, [0, 1], [0, 1], 2);
  assert.deepEqual(x, [0, 1]);
  assert.deepEqual(y, [0, 1]);
  assert.deepEqual(z, [
    [0, 1],
    [10, 11],
  ]);
});

test("parseMatrix: spaces, commas, fractions, blank lines", () => {
  assert.deepEqual(parseMatrix("1 2\n\n3, 1/2\n"), [
    [1, 2],
    [3, 0.5],
  ]);
});

test("parseMatrix: ragged rows and bad entries throw", () => {
  assert.throws(() => parseMatrix("1 2\n3"), /row/i);
  assert.throws(() => parseMatrix("1 x"), /x/);
  assert.throws(() => parseMatrix("   "));
});

test("rref: invertible 3x3 -> identity, with steps", () => {
  const A = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 10],
  ];
  const { matrix, steps } = rref(A);
  assert.deepEqual(matrix, [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
  assert.ok(steps.length > 0);
  assert.equal(A[0][0], 1, "input not modified");
});

test("rref: singular matrix keeps a zero row", () => {
  const { matrix } = rref([
    [1, 2],
    [2, 4],
  ]);
  assert.deepEqual(matrix, [
    [1, 2],
    [0, 0],
  ]);
});

test("rref: augmented system [A|b]", () => {
  // x + y = 3, x - y = 1  ->  x = 2, y = 1
  const { matrix } = rref([
    [1, 1, 3],
    [1, -1, 1],
  ]);
  assert.deepEqual(matrix, [
    [1, 0, 2],
    [0, 1, 1],
  ]);
});

test("formatNumber", () => {
  assert.equal(formatNumber(3), "3");
  assert.equal(formatNumber(1 / 3), "0.3333");
  assert.equal(formatNumber(0.5), "0.5");
  assert.equal(formatNumber(-0), "0");
});

test("cleanOcrText: line endings, hyphenation, blank lines", () => {
  assert.equal(cleanOcrText("equa-\ntion  \r\n\n\n\nnext"), "equation\n\nnext");
});

test("toLatexDocument: compilable wrapper", () => {
  const doc = toLatexDocument("$x^2$", "Notes");
  assert.match(doc, /^\\documentclass/);
  assert.match(doc, /amsmath/);
  assert.match(doc, /\\maketitle/);
  assert.match(doc, /\$x\^2\$/);
  assert.match(doc, /\\end\{document\}\s*$/);
});

test("filterTools: all / live / planned, order kept", () => {
  assert.equal(filterTools(TOOLS, "all").length, TOOLS.length);
  assert.ok(filterTools(TOOLS, "live").every((t) => t.status === "live"));
  assert.ok(filterTools(TOOLS, "planned").every((t) => t.status === "planned"));
});

test("TOOLS registry: unique ids, live tools have a page", () => {
  const ids = TOOLS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of TOOLS) if (t.status === "live") assert.match(t.href, /\.html$/);
});

test("TOOLS registry: every live tool's page, card image and (Math/CS) desktop icon exist", async () => {
  const { existsSync } = await import("node:fs");
  const site = new URL("../", import.meta.url);
  for (const t of TOOLS.filter((tool) => tool.status === "live")) {
    assert.ok(existsSync(new URL(t.href, site)), `${t.id}: page ${t.href}`);
    assert.ok(existsSync(new URL(`images/${t.id}.svg`, site)), `${t.id}: card image`);
    if (t.category === "math" || t.category === "cs") {
      assert.ok(existsSync(new URL(`images/icons/${t.id}.svg`, site)), `${t.id}: desktop icon`);
    }
  }
});

test("STICKERS: files exist, each has a page, position and width; link stickers have alt text", async () => {
  const { existsSync } = await import("node:fs");
  const site = new URL("../", import.meta.url);
  for (const [i, s] of STICKERS.entries()) {
    const name = `sticker ${i} (${s.src})`;
    assert.ok(existsSync(new URL(s.src, site)), `${name}: image file`);
    if (s.still) assert.ok(existsSync(new URL(s.still, site)), `${name}: still file`);
    assert.ok([].concat(s.page).length > 0, `${name}: page`);
    assert.ok(Number.isFinite(s.y) && Number.isFinite(s.w) && s.w > 0, `${name}: y and w are numbers`);
    assert.ok(s.x !== undefined || s.right !== undefined, `${name}: x or right`);
    if (s.href) assert.ok(s.alt, `${name}: a link sticker needs alt text`);
  }
});
