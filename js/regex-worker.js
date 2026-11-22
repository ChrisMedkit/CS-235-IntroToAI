// Runs regex matching off the main thread, so a pattern that backtracks "forever" (like (a+)+$
// on a long string of a's) can be stopped by terminating this worker instead of freezing the tab.
import { findMatches } from "./cs-lib.js";

self.onmessage = ({ data }) => {
  const { id, pattern, flags, text, replacement } = data;
  try {
    const matches = findMatches(pattern, flags, text);
    // Uses the user's own flags, so without g only the first match is replaced (worth seeing).
    const replaced = text.replace(new RegExp(pattern, flags), replacement);
    self.postMessage({ id, matches, replaced });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
