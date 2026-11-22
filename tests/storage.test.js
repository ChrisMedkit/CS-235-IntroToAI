// Tests for js/storage.js, with a tiny stand-in for the browser's localStorage.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const store = new Map();
let full = false;
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => {
    if (full) throw new Error("QuotaExceededError");
    store.set(key, String(value));
  },
};
const { load, save } = await import("../js/storage.js");

beforeEach(() => {
  store.clear();
  full = false;
});

test("save then load round-trips, under the christopia: prefix", async () => {
  await save("guestbook", [{ name: "Ana", message: "hi" }]);
  assert.ok(store.has("christopia:guestbook"));
  assert.deepEqual(await load("guestbook", []), [{ name: "Ana", message: "hi" }]);
});

test("load returns the fallback when nothing is saved or the JSON is corrupt", async () => {
  assert.deepEqual(await load("missing", ["fallback"]), ["fallback"]);
  store.set("christopia:broken", "{not json");
  assert.deepEqual(await load("broken", []), []);
});

test("save rejects when storage is full, so the page can say 'Not saved'", async () => {
  full = true;
  await assert.rejects(() => save("guestbook", []));
});
