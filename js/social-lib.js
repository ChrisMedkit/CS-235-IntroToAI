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
  const lastActivity = (t) => Math.max(t.createdAt, ...t.replies.map((r) => r.createdAt));
  const key = {
    new: (t) => [t.createdAt],
    top: (t) => [t.score, t.createdAt],
    active: (t) => [lastActivity(t)],
  }[mode];
  return [...threads].sort((a, b) => {
    const [ka, kb] = [key(a), key(b)];
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i];
    return 0;
  });
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
  return new Date(then).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

/** An event with no end time lasts one hour (the same rule for the lists and the calendar file). */
const endOf = (event) => event.end ?? event.start + 3_600_000;

/** @returns {{going: number, maybe: number, no: number, spotsLeft: number|null}} */
export function rsvpSummary(event) {
  const counts = { going: 0, maybe: 0, no: 0 };
  for (const status of Object.values(event.rsvps)) counts[status]++;
  return {
    ...counts,
    spotsLeft: event.capacity == null ? null : Math.max(0, event.capacity - counts.going),
  };
}

/**
 * Set someone's RSVP (no mutation). "going" is refused when the event is full, unless that
 * person is already going. Names are compared trimmed and case-insensitively.
 * @returns {{event: ChristopiaEvent, error: string|null}}
 */
export function setRsvp(event, name, status) {
  const clean = name.trim();
  if (!clean) return { event, error: "Type your name to RSVP." };
  if (!["going", "maybe", "no"].includes(status))
    return { event, error: "Pick going, maybe or can't go." };
  // Same person, any capitalization: replace their old answer (and keep the first spelling).
  const existing = Object.keys(event.rsvps).find(
    (n) => n.trim().toLowerCase() === clean.toLowerCase(),
  );
  const alreadyGoing = existing !== undefined && event.rsvps[existing] === "going";
  if (status === "going" && !alreadyGoing && rsvpSummary(event).spotsLeft === 0) {
    return { event, error: "Sorry, this event is full. You can still answer maybe." };
  }
  return {
    event: { ...event, rsvps: { ...event.rsvps, [existing ?? clean]: status } },
    error: null,
  };
}

/**
 * Split into upcoming (still going or not started; sorted soonest first) and past
 * (most recent first).
 * @returns {{upcoming: ChristopiaEvent[], past: ChristopiaEvent[]}}
 */
export function splitEvents(events, now) {
  const isUpcoming = (e) => endOf(e) >= now;
  return {
    upcoming: events.filter(isUpcoming).sort((a, b) => a.start - b.start),
    past: events.filter((e) => !isUpcoming(e)).sort((a, b) => b.start - a.start),
  };
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
  const stamp = (ms) =>
    new Date(ms)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const text = (v = "") =>
    String(v)
      .replace(/\\/g, "\\\\")
      .replace(/[;,]/g, (c) => `\\${c}`)
      .replace(/\r?\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Christopia//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@christopia`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(event.start)}`,
    `DTEND:${stamp(endOf(event))}`,
    `SUMMARY:${text(event.title)}`,
  ];
  if (event.location) lines.push(`LOCATION:${text(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${text(event.description)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  // shortcut: lines over 75 octets aren't folded; calendar apps accept them, but strict validators warn.
  return lines.join("\r\n") + "\r\n";
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
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Bytes → base64 text, one byte at a time: String.fromCharCode(...bytes) crashes past ~125 KB. */
export function toBase64(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export const fromBase64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

/**
 * Encrypt any JSON-able value. A fresh random 12-byte IV every call (never reuse an IV).
 * @param {CryptoKey} key
 * @param {unknown} value
 * @returns {Promise<{iv: string, data: string}>}  base64 strings, safe for localStorage
 */
export async function encryptJSON(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(value)),
  );
  return { iv: toBase64(iv), data: toBase64(data) };
}

/**
 * Decrypt what encryptJSON produced. A wrong key or tampered data makes AES-GCM throw;
 * let that propagate (the unlock form shows "Wrong password").
 * @param {CryptoKey} key
 * @param {{iv: string, data: string}} payload
 * @returns {Promise<unknown>}
 */
export async function decryptJSON(key, payload) {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.data),
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

/* ---------------- Journal: editor helpers ---------------- */

/**
 * Notion-style Markdown shortcut typed at the start of a block, before the space.
 * "#"→h1, "##"→h2, "###"→h3, "-" or "*"→bullet, "1."→number, "[]"→todo, ">"→quote,
 * "```"→code, "---"→divider, "$$"→math. Anything else → null.
 * @param {string} prefix
 * @returns {string|null}  block type
 */
const SHORTCUTS = {
  "#": "h1",
  "##": "h2",
  "###": "h3",
  "-": "bullet",
  "*": "bullet",
  "1.": "number",
  "[]": "todo",
  ">": "quote",
  "```": "code",
  "---": "divider",
  $$: "math",
};

export function markdownShortcut(prefix) {
  return Object.hasOwn(SHORTCUTS, prefix) ? SHORTCUTS[prefix] : null;
}

/**
 * Nest a flat page list for the sidebar. Children keep their `order`; pages whose parent is
 * missing (deleted) go to the top level; pages with `trashed: true` are left out.
 * @param {{id: string, parentId: string|null, order: number, trashed?: boolean}[]} pages
 * @returns {{page: object, children: any[]}[]}
 */
export function buildPageTree(pages) {
  const live = pages.filter((p) => !p.trashed);
  const ids = new Set(live.map((p) => p.id));
  const byOrder = (a, b) => a.order - b.order;
  const childrenOf = (id) =>
    live
      .filter((p) =>
        id === null ? p.parentId === null || !ids.has(p.parentId) : p.parentId === id,
      )
      .sort(byOrder)
      .map((page) => ({ page, children: childrenOf(page.id) }));
  return childrenOf(null);
}

/**
 * Case-insensitive search over titles and block text; title matches first, then by updatedAt desc.
 * Trashed pages excluded. Empty query → [].
 * @param {{id: string, title: string, blocks: {text: string}[], updatedAt: number, trashed?: boolean}[]} pages
 * @param {string} query
 */
export function searchPages(pages, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const inTitle = (p) => p.title.toLowerCase().includes(q);
  const inBody = (p) =>
    p.blocks.some((b) =>
      String(b.text ?? "")
        .toLowerCase()
        .includes(q),
    );
  return pages
    .filter((p) => !p.trashed && (inTitle(p) || inBody(p)))
    .sort((a, b) => inTitle(b) - inTitle(a) || b.updatedAt - a.updatedAt);
}
