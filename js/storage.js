// Storage for the Social pages. Today: this browser's localStorage. Later: swap these two
// functions for fetch() calls to the home server, and no page script has to change (it's
// already async for that reason).

const PREFIX = "christopia:";

/**
 * Load a collection (e.g. "forum", "events", "journal-vault").
 * @param {string} name
 * @param {unknown} fallback  returned when nothing is saved, storage is blocked, or JSON is corrupt
 * @returns {Promise<any>}
 */
export async function load(name, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback; // storage blocked (private mode) or corrupt JSON
  }
}

/**
 * Save a collection.
 * @param {string} name
 * @param {unknown} value  JSON-able
 * @returns {Promise<void>}
 * @throws when storage is full or blocked, so the page can say "Not saved" instead of losing work
 */
export async function save(name, value) {
  localStorage.setItem(PREFIX + name, JSON.stringify(value)); // throws if full or blocked: callers say "Not saved"
}
