// Run with `npm test`. Covers the lightbox's wrap-around logic (Step 7 / Step 8 testing).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { wrapIndex } = require("../js/script.js");

test("next stays in range", () => {
  assert.equal(wrapIndex(3, 6), 3);
});

test("next after last image goes to first", () => {
  assert.equal(wrapIndex(6, 6), 0);
});

test("previous before first image goes to last", () => {
  assert.equal(wrapIndex(-1, 6), 5);
});

test("single image always stays at 0", () => {
  assert.equal(wrapIndex(1, 1), 0);
  assert.equal(wrapIndex(-1, 1), 0);
});
