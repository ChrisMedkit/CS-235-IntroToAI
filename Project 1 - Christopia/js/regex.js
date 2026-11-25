// Regex Builder page. Explanation runs here (cheap); matching runs in regex-worker.js with a
// time limit, because some patterns take exponential time and would freeze the page.
import { explainRegex, PRESETS } from "./cs-lib.js";

const TIMEOUT_MS = 1000;
const TABLE_ROWS = 200; // the table lists the first 200 matches; the count and highlight show all
const LIMIT = 1000; // findMatches' default cap

const $ = (id) => document.getElementById(id);

/* ---------------- Building blocks ---------------- */

/** Group blocks wrap the selected text; set blocks select their placeholder so you can type over it. */
const WRAP = {
  "()": ["(", ")"],
  "(?:)": ["(?:", ")"],
  "(?<name>)": ["(?<name>", ")"],
  "(?=)": ["(?=", ")"],
  "(?!)": ["(?!", ")"],
};
const PLACEHOLDER = { "[abc]": "abc", "[^abc]": "abc", "[a-z]": "a-z", "(?<name>)": "name" };

/** Insert a building block at the cursor in #regex-pattern (or around the selection, for groups). */
function insertToken(token) {
  const input = $("regex-pattern");
  const { selectionStart: start, selectionEnd: end, value } = input;
  input.focus();
  if (WRAP[token]) {
    const [open, close] = WRAP[token];
    const selected = value.slice(start, end);
    input.setRangeText(open + selected + close, start, end, "end");
    // Empty group: put the cursor inside it.
    if (!selected) input.setSelectionRange(start + open.length, start + open.length);
  } else {
    input.setRangeText(token, start, end, "end");
  }
  const placeholder = PLACEHOLDER[token];
  if (placeholder) {
    const at = start + token.indexOf(placeholder);
    input.setSelectionRange(at, at + placeholder.length);
  }
  update();
}

/* ---------------- Rendering ---------------- */

function renderExplanation(pattern) {
  const list = $("regex-explain");
  const tokens = pattern ? explainRegex(pattern) : [];
  if (!tokens.length) {
    list.replaceChildren(
      Object.assign(document.createElement("li"), {
        textContent: "Type a pattern or click a building block.",
      }),
    );
    return;
  }
  list.replaceChildren(
    ...tokens.map(({ token, meaning }) => {
      const li = document.createElement("li");
      li.append(
        Object.assign(document.createElement("code"), { textContent: token }),
        ` ${meaning}`,
      );
      return li;
    }),
  );
}

/** Test string with <mark> around each match, built from text nodes (never innerHTML). */
function renderHighlight(text, matches) {
  const nodes = [];
  let pos = 0;
  for (const { match, index } of matches) {
    if (index > pos) nodes.push(document.createTextNode(text.slice(pos, index)));
    if (match === "") {
      // An empty match is a position, not text: show it as a thin bar.
      nodes.push(
        Object.assign(document.createElement("span"), {
          className: "empty-match",
          title: `empty match at index ${index}`,
        }),
      );
    } else {
      nodes.push(Object.assign(document.createElement("mark"), { textContent: match }));
    }
    pos = Math.max(pos, index + match.length);
  }
  nodes.push(document.createTextNode(text.slice(pos)));
  $("regex-highlight").replaceChildren(...nodes);
}

function renderTable(matches) {
  const cell = (content) => {
    const td = document.createElement("td");
    td.append(content);
    return td;
  };
  const code = (text) => Object.assign(document.createElement("code"), { textContent: text });
  const rows = matches.slice(0, TABLE_ROWS).map(({ match, index, groups }, i) => {
    const tr = document.createElement("tr");
    const groupText = groups.length
      ? groups.map((g, k) => `$${k + 1} = ${g === undefined ? "(no match)" : `"${g}"`}`).join(", ")
      : "-";
    tr.append(
      cell(String(i + 1)),
      cell(match === "" ? "(empty)" : code(match)),
      cell(String(index)),
      cell(groupText),
    );
    return tr;
  });
  if (matches.length > TABLE_ROWS) {
    const tr = document.createElement("tr");
    const td = cell(`…and ${matches.length - TABLE_ROWS} more (all are highlighted above).`);
    td.colSpan = 4;
    tr.append(td);
    rows.push(tr);
  }
  $("regex-matches").tBodies[0].replaceChildren(...rows);
}

function showResults(text, matches, replaced) {
  $("regex-count").textContent =
    matches.length >= LIMIT ? `${LIMIT}+ (stopped counting)` : matches.length;
  renderHighlight(text, matches);
  renderTable(matches);
  $("regex-replaced").textContent = replaced;
}

/* ---------------- Matching in a worker, with a time limit ---------------- */

let worker = null;
let inFlight = null; // {id, text, timer} of the request the worker is busy with
let nextId = 0;
let debounce = null;

function startWorker() {
  worker = new Worker(new URL("./regex-worker.js", import.meta.url), { type: "module" });
  worker.onmessage = ({ data }) => {
    if (!inFlight || data.id !== inFlight.id) return; // an answer to an older request
    clearTimeout(inFlight.timer);
    const { text } = inFlight;
    inFlight = null;
    if (data.error) {
      $("regex-error").textContent = data.error;
      showResults(text, [], "");
    } else {
      showResults(text, data.matches, data.replaced);
    }
  };
}

/** Restart the worker: the only way to stop a regex that is still running. */
function killWorker() {
  clearTimeout(inFlight?.timer);
  inFlight = null;
  worker.terminate();
  startWorker();
}

function runMatch(pattern, flags, text, replacement) {
  if (inFlight) killWorker(); // still busy with an old pattern: don't let it delay this one
  const id = ++nextId;
  const timer = setTimeout(() => {
    killWorker();
    $("regex-error").textContent =
      `Stopped after ${TIMEOUT_MS / 1000} s: this pattern backtracks too much on this text ` +
      "(nested quantifiers like (a+)+ are the usual cause). Make it more specific.";
    showResults(text, [], "");
  }, TIMEOUT_MS);
  inFlight = { id, text, timer };
  worker.postMessage({ id, pattern, flags, text, replacement });
}

/** Re-run everything after any input. Syntax errors show at once; matching waits for a typing pause. */
function update() {
  const pattern = $("regex-pattern").value;
  const flags = $("regex-flags").value.trim();
  const text = $("regex-text").value;
  const replacement = $("regex-replace").value;
  $("regex-error").textContent = "";
  renderExplanation(pattern);
  clearTimeout(debounce);
  if (!pattern) {
    if (inFlight) killWorker();
    showResults(text, [], text);
    return;
  }
  try {
    new RegExp(pattern, flags); // compiling is fast and safe; only matching can run away
  } catch (error) {
    if (inFlight) killWorker();
    $("regex-error").textContent = error.message;
    showResults(text, [], "");
    return;
  }
  debounce = setTimeout(() => runMatch(pattern, flags, text, replacement), 120);
}

/* ---------------- Copy ---------------- */

/** The pattern as a JS literal: escape any "/" that isn't already escaped. */
function asLiteral(pattern, flags) {
  let body = "";
  let escaped = false;
  for (const ch of pattern) {
    if (escaped) escaped = false;
    else if (ch === "\\") escaped = true;
    else if (ch === "/") {
      body += "\\/";
      continue;
    }
    body += ch;
  }
  return `/${body || "(?:)"}/${flags}`;
}

async function copyAsJs() {
  const button = $("regex-copy");
  const literal = asLiteral($("regex-pattern").value, $("regex-flags").value.trim());
  try {
    await navigator.clipboard.writeText(literal);
    button.textContent = "Copied!";
  } catch {
    button.textContent = "Couldn't copy";
    $("regex-error").textContent = `Copy this yourself: ${literal}`;
  }
  setTimeout(() => (button.textContent = "Copy as JavaScript"), 1500);
}

document.addEventListener("DOMContentLoaded", () => {
  startWorker();
  document.querySelector(".token-palette").addEventListener("click", (e) => {
    const button = e.target.closest("button[data-token]");
    if (button) insertToken(button.dataset.token);
  });
  $("regex-preset").addEventListener("change", (e) => {
    const preset = PRESETS[e.target.value];
    if (!preset) return;
    $("regex-pattern").value = preset.pattern;
    $("regex-flags").value = preset.flags;
    update();
  });
  for (const id of ["regex-pattern", "regex-flags", "regex-text", "regex-replace"]) {
    $(id).addEventListener("input", update);
  }
  $("regex-copy").addEventListener("click", copyAsJs);
  update();
});
