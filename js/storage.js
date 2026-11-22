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
  // TODO (Plan Social step 1): JSON.parse(localStorage.getItem(PREFIX + name)) in try/catch.
  void PREFIX, name;
  return fallback;
}

/**
 * Save a collection.
 * @param {string} name
 * @param {unknown} value  JSON-able
 * @returns {Promise<void>}
 * @throws when storage is full or blocked, so the page can say "Not saved" instead of losing work
 */
export async function save(name, value) {
  // TODO (Plan Social step 1): localStorage.setItem(PREFIX + name, JSON.stringify(value)).
  void name, value;
}
