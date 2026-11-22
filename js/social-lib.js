// Pure logic for the Social section (no DOM), tested by tests/social-lib.test.js.
// Uses the Web Crypto API (globalThis.crypto.subtle), which browsers and Node 20+ both have.

/* ---------------- Forum ---------------- */

/**
 * Validate a new thread or reply before saving.
 * @param {{title?: string, body: string, author: string}} post  title only for threads
 * @param {{requireTitle?: boolean}} [options]
 * @returns {Record<string, string>}  field -> message; empty object when valid.
 *   Rules: trimmed author 1–40 chars; body 1–5000; title (when required) 1–120.
 */
export function validatePost(post, { requireTitle = false } = {}) {
  const errors = {};
  const check = (field, label, max) => {
    const length = String(post[field] ?? "").trim().length;
    if (length === 0) errors[field] = `${label} can't be empty.`;
    else if (length > max) errors[field] = `${label} is too long (${length} of ${max} characters).`;
  };
  check("author", "Name", 40);
  check("body", "Message", 5000);
  if (requireTitle) check("title", "Title", 120);
  return errors;
}

/**
 * Sort threads for the list. Returns a new array.
 * new: createdAt desc; top: score desc then createdAt desc; active: last reply (or createdAt) desc.
 * @param {{createdAt: number, score: number, replies: {createdAt: number}[]}[]} threads
 * @param {"new"|"top"|"active"} mode
 */
export function sortThreads(threads, mode) {
  // TODO (Plan Social step 1)
  void threads, mode;
  throw new Error("Not implemented");
}

/**
 * "just now", "5 min ago", "3 h ago", "2 d ago", then a date like "Nov 2, 2026".
 * @param {number} then  ms since epoch
 * @param {number} now   ms since epoch
 * @returns {string}
 */
export function relativeTime(then, now) {
  const seconds = Math.max(0, (now - then) / 1000); // a clock a little ahead still reads "just now"
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 7 * 86_400) return `${Math.floor(seconds / 86_400)} d ago`;
  return new Date(then).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ---------------- Events ---------------- */

/**
 * @typedef {Object} ChristopiaEvent
 * @property {string} id
 * @property {string} title
 * @property {number} start  ms since epoch
 * @property {number} [end]
 * @property {string} [location]
 * @property {string} [description]
 * @property {number|null} capacity  null = unlimited
 * @property {Record<string, "going"|"maybe"|"no">} rsvps  name -> status
 */

/** @returns {{going: number, maybe: number, no: number, spotsLeft: number|null}} */
export function rsvpSummary(event) {
  // TODO (Plan Social step 2)
  void event;
  throw new Error("Not implemented");
}

/**
 * Set someone's RSVP (no mutation). "going" is refused when the event is full, unless that
 * person is already going. Names are compared trimmed and case-insensitively.
 * @returns {{event: ChristopiaEvent, error: string|null}}
 */
export function setRsvp(event, name, status) {
  // TODO (Plan Social step 2)
  void event, name, status;
  throw new Error("Not implemented");
}

/**
 * Split into upcoming (end, or start if no end, is >= now; sorted soonest first) and past
 * (most recent first).
 * @returns {{upcoming: ChristopiaEvent[], past: ChristopiaEvent[]}}
 */
export function splitEvents(events, now) {
  // TODO (Plan Social step 2)
  void events, now;
  throw new Error("Not implemented");
}

/**
 * iCalendar text for "Add to calendar". CRLF line endings; BEGIN:VCALENDAR, VERSION:2.0,
 * PRODID, one VEVENT with UID, DTSTAMP, DTSTART, DTEND (start + 1 h if none), SUMMARY,
 * LOCATION, DESCRIPTION. Times in UTC as 20261122T180000Z. Escape \ ; , and newlines in text.
 * @param {ChristopiaEvent} event
 * @param {number} now  for DTSTAMP
 * @returns {string}
 */
export function toICS(event, now) {
  // TODO (Plan Social step 2)
  void event, now;
  throw new Error("Not implemented");
}

/* ---------------- Journal: encryption ---------------- */

export const PBKDF2_ITERATIONS = 600_000; // OWASP 2023 recommendation for PBKDF2-SHA256

/**
 * Derive an AES-GCM-256 key from the password. The password itself is never stored.
 * @param {string} password
 * @param {Uint8Array} salt  16 random bytes, stored next to the vault (not secret)
 * @param {number} [iterations=PBKDF2_ITERATIONS]  tests pass a small number to stay fast
 * @returns {Promise<CryptoKey>}  non-extractable
 */
export async function deriveKey(password, salt, iterations = PBKDF2_ITERATIONS) {
  // TODO (Plan Social step 3): crypto.subtle.importKey("raw", utf8(password), "PBKDF2", false,
  // ["deriveKey"]) then deriveKey({name: "PBKDF2", hash: "SHA-256", salt, iterations},
  // base, {name: "AES-GCM", length: 256}, false, ["encrypt", "decrypt"]).
  void password, salt, iterations;
  throw new Error("Not implemented");
}

/**
 * Encrypt any JSON-able value. A fresh random 12-byte IV every call (never reuse an IV).
 * @param {CryptoKey} key
 * @param {unknown} value
 * @returns {Promise<{iv: string, data: string}>}  base64 strings, safe for localStorage
 */
export async function encryptJSON(key, value) {
  // TODO (Plan Social step 3)
  void key, value;
  throw new Error("Not implemented");
}

/**
 * Decrypt what encryptJSON produced. A wrong key or tampered data makes AES-GCM throw;
 * let that propagate (the unlock form shows "Wrong password").
 * @param {CryptoKey} key
 * @param {{iv: string, data: string}} payload
 * @returns {Promise<unknown>}
 */
export async function decryptJSON(key, payload) {
  // TODO (Plan Social step 3)
  void key, payload;
  throw new Error("Not implemented");
}

/* ---------------- Journal: editor helpers ---------------- */

/**
 * Notion-style Markdown shortcut typed at the start of a block, before the space.
 * "#"→h1, "##"→h2, "###"→h3, "-" or "*"→bullet, "1."→number, "[]"→todo, ">"→quote,
 * "```"→code, "---"→divider, "$$"→math. Anything else → null.
 * @param {string} prefix
 * @returns {string|null}  block type
 */
export function markdownShortcut(prefix) {
  // TODO (Plan Social step 4)
  void prefix;
  throw new Error("Not implemented");
}

/**
 * Nest a flat page list for the sidebar. Children keep their `order`; pages whose parent is
 * missing (deleted) go to the top level; pages with `trashed: true` are left out.
 * @param {{id: string, parentId: string|null, order: number, trashed?: boolean}[]} pages
 * @returns {{page: object, children: any[]}[]}
 */
export function buildPageTree(pages) {
  // TODO (Plan Social step 4)
  void pages;
  throw new Error("Not implemented");
}

/**
 * Case-insensitive search over titles and block text; title matches first, then by updatedAt desc.
 * Trashed pages excluded. Empty query → [].
 * @param {{id: string, title: string, blocks: {text: string}[], updatedAt: number, trashed?: boolean}[]} pages
 * @param {string} query
 */
export function searchPages(pages, query) {
  // TODO (Plan Social step 4)
  void pages, query;
  throw new Error("Not implemented");
}
