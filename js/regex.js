// Regex Builder page.
import { explainRegex, findMatches, escapeRegex, PRESETS } from "./cs-lib.js";

/** Insert a building-block token at the cursor in #regex-pattern; for "()" style tokens put the cursor inside. */
function insertToken(token) {
  // TODO (Plan CS step 5b): setRangeText(token, start, end, "end"), then update().
  void token;
}

/**
 * Re-run everything after any input: explanation, matches, highlight, table, replace preview.
 * Show SyntaxError messages in #regex-error instead of throwing.
 */
function update() {
  // TODO (Plan CS step 5c): call explainRegex, findMatches; renderHighlight; fill the table and
  // #regex-count; replace preview with text.replace(new RegExp(p, flags), replacement).
  void explainRegex, findMatches;
}

/** Test string with <mark> around each match, built from text nodes (never innerHTML). */
function renderHighlight(text, matches) {
  // TODO (Plan CS step 5c)
  void text, matches;
}

/** Copy `/pattern/flags` as a JS literal (escape "/" in the pattern) to the clipboard. */
async function copyAsJs() {
  // TODO (Plan CS step 5d)
  void escapeRegex;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".token-palette")?.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-token]");
    if (button) insertToken(button.dataset.token);
  });
  document.getElementById("regex-preset")?.addEventListener("change", (e) => {
    const preset = PRESETS[e.target.value];
    if (!preset) return;
    document.getElementById("regex-pattern").value = preset.pattern;
    document.getElementById("regex-flags").value = preset.flags;
    update();
  });
  for (const id of ["regex-pattern", "regex-flags", "regex-text", "regex-replace"]) {
    document.getElementById(id)?.addEventListener("input", update);
  }
  document.getElementById("regex-copy")?.addEventListener("click", copyAsJs);
  void renderHighlight;
  update();
});
