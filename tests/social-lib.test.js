// Tests for js/social-lib.js. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validatePost,
  sortThreads,
  relativeTime,
  rsvpSummary,
  setRsvp,
  splitEvents,
  toICS,
  deriveKey,
  encryptJSON,
  decryptJSON,
  markdownShortcut,
  buildPageTree,
  searchPages,
} from "../js/social-lib.js";

test("validatePost", () => {
  assert.deepEqual(validatePost({ body: "hi", author: "Sam" }), {});
  const errors = validatePost({ title: "  ", body: "", author: "x".repeat(41) }, { requireTitle: true });
  assert.deepEqual(Object.keys(errors).sort(), ["author", "body", "title"]);
});

test("sortThreads new / top / active", () => {
  const t = [
    { id: "a", createdAt: 1, score: 5, replies: [{ createdAt: 9 }] },
    { id: "b", createdAt: 3, score: 1, replies: [] },
    { id: "c", createdAt: 2, score: 5, replies: [] },
  ];
  const ids = (mode) => sortThreads(t, mode).map((x) => x.id);
  assert.deepEqual(ids("new"), ["b", "c", "a"]);
  assert.deepEqual(ids("top"), ["c", "a", "b"]);
  assert.deepEqual(ids("active"), ["a", "b", "c"]);
  assert.equal(t[0].id, "a", "input not reordered");
});

test("relativeTime", () => {
  const now = Date.UTC(2026, 10, 22, 12);
  assert.equal(relativeTime(now - 10_000, now), "just now");
  assert.equal(relativeTime(now - 5 * 60_000, now), "5 min ago");
  assert.equal(relativeTime(now - 3 * 3_600_000, now), "3 h ago");
  assert.equal(relativeTime(now - 2 * 86_400_000, now), "2 d ago");
  assert.match(relativeTime(now - 30 * 86_400_000, now), /2026/);
});

const EVENT = {
  id: "e1",
  title: "Study night; bring snacks",
  start: Date.UTC(2026, 11, 1, 23),
  location: "Library, room 2",
  description: "Line 1\nLine 2",
  capacity: 2,
  rsvps: { Ana: "going", Ben: "maybe" },
};

test("rsvpSummary and capacity", () => {
  assert.deepEqual(rsvpSummary(EVENT), { going: 1, maybe: 1, no: 0, spotsLeft: 1 });
  const { event: e2, error } = setRsvp(EVENT, "Cal", "going");
  assert.equal(error, null);
  assert.equal(rsvpSummary(e2).spotsLeft, 0);
  assert.ok(setRsvp(e2, "Dee", "going").error, "full");
  assert.equal(setRsvp(e2, " ana ", "going").error, null, "already going is fine");
  assert.equal(EVENT.rsvps.Cal, undefined, "no mutation");
});

test("splitEvents", () => {
  const now = Date.UTC(2026, 10, 22);
  const a = { ...EVENT, id: "a", start: now + 2e8 };
  const b = { ...EVENT, id: "b", start: now + 1e8 };
  const c = { ...EVENT, id: "c", start: now - 1e8 };
  const { upcoming, past } = splitEvents([a, b, c], now);
  assert.deepEqual(upcoming.map((e) => e.id), ["b", "a"]);
  assert.deepEqual(past.map((e) => e.id), ["c"]);
});

test("toICS", () => {
  const ics = toICS(EVENT, Date.UTC(2026, 10, 22));
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /DTSTART:20261201T230000Z\r\n/);
  assert.match(ics, /DTEND:20261202T000000Z\r\n/);
  assert.match(ics, /SUMMARY:Study night\\; bring snacks\r\n/);
  assert.match(ics, /LOCATION:Library\\, room 2\r\n/);
  assert.match(ics, /DESCRIPTION:Line 1\\nLine 2\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
});

test("journal crypto: round trip, fresh IV, wrong password fails", async () => {
  const salt = new Uint8Array(16).fill(7);
  const key = await deriveKey("correct horse", salt, 1000);
  const pages = [{ id: "p1", title: "Day 1", blocks: [{ type: "text", text: "secret" }] }];
  const a = await encryptJSON(key, pages);
  const b = await encryptJSON(key, pages);
  assert.notEqual(a.iv, b.iv);
  assert.ok(!a.data.includes("secret"));
  assert.deepEqual(await decryptJSON(key, a), pages);
  const wrong = await deriveKey("wrong horse", salt, 1000);
  await assert.rejects(() => decryptJSON(wrong, a));
});

test("markdownShortcut", () => {
  const cases = { "#": "h1", "##": "h2", "###": "h3", "-": "bullet", "*": "bullet", "1.": "number", "[]": "todo", ">": "quote", "```": "code", "---": "divider", $$: "math" };
  for (const [prefix, type] of Object.entries(cases)) assert.equal(markdownShortcut(prefix), type, prefix);
  assert.equal(markdownShortcut("hello"), null);
});

test("buildPageTree nests, orders, drops trashed, rescues orphans", () => {
  const tree = buildPageTree([
    { id: "b", parentId: null, order: 2 },
    { id: "a", parentId: null, order: 1 },
    { id: "a2", parentId: "a", order: 2 },
    { id: "a1", parentId: "a", order: 1 },
    { id: "t", parentId: null, order: 3, trashed: true },
    { id: "o", parentId: "gone", order: 4 },
  ]);
  assert.deepEqual(tree.map((n) => n.page.id), ["a", "b", "o"]);
  assert.deepEqual(tree[0].children.map((n) => n.page.id), ["a1", "a2"]);
});

test("searchPages: titles first, then body, no trash", () => {
  const pages = [
    { id: "1", title: "Groceries", blocks: [{ text: "eigenvalues later" }], updatedAt: 3 },
    { id: "2", title: "Eigenvalues notes", blocks: [], updatedAt: 1 },
    { id: "3", title: "Eigen trash", blocks: [], updatedAt: 9, trashed: true },
  ];
  assert.deepEqual(searchPages(pages, "EIGEN").map((p) => p.id), ["2", "1"]);
  assert.deepEqual(searchPages(pages, ""), []);
});
