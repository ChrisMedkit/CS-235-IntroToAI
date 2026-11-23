// Private Journal page: Notion-style block editor over an encrypted vault.
// Vault in storage.js ("journal-vault"): {salt: base64, iterations, check: {iv, data}, pages: {iv, data}}.
// `check` is encryptJSON(key, "christopia") so a wrong password fails fast and clearly.
// Decrypted pages: [{id, parentId, order, icon, title, blocks: [{id, type, text, html?, checked?, body?, open?}],
//                    favorite, trashed, createdAt, updatedAt}]
import { load, save } from "./storage.js";
import {
  deriveKey,
  encryptJSON,
  decryptJSON,
  markdownShortcut,
  buildPageTree,
  searchPages,
  relativeTime,
  PBKDF2_ITERATIONS,
} from "./social-lib.js";

const AUTO_LOCK_MS = 10 * 60 * 1000; // lock after 10 minutes without input
const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};
const ICONS = ["📄", "📓", "📐", "💻", "🧪", "🎮", "🎵", "⭐", "💡", "📅", "🌊", "🍄"];
const LABELS = {
  text: "Text", h1: "Heading 1", h2: "Heading 2", h3: "Heading 3", todo: "To-do", bullet: "Bulleted list item",
  number: "Numbered list item", toggle: "Toggle", quote: "Quote", callout: "Callout", code: "Code", math: "Math equation (LaTeX)",
};
const LIST_TYPES = new Set(["bullet", "number", "todo"]);
const PLAIN_TYPES = new Set(["code", "math"]); // stored as plain text, no formatting

// Key and pages exist only in memory while unlocked; lock() drops them.
let key = null;
let vault = null; // salt / iterations / check: not secret, kept to rewrite the vault on save
let pages = [];
let currentId = null;
let trashMode = false;
const expanded = new Set(); // page ids whose children show in the sidebar
let lastActivity = Date.now();

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
const current = () => pages.find((p) => p.id === currentId);
const newBlock = (type = "text", text = "") => ({ id: crypto.randomUUID(), type, text });

/* ---------------- Lock, unlock, save ---------------- */

/** Show #setup-form if there is no vault yet, else #unlock-form. */
async function showLockScreen() {
  const existing = await load("journal-vault", null);
  $("setup-form").hidden = !!existing;
  $("unlock-form").hidden = !existing;
  $("journal-app").hidden = true;
  $("journal-lock").hidden = false;
  $(existing ? "unlock-password" : "setup-password").focus();
}

/** Run a slow key derivation with the form's button disabled and a message. */
async function busy(form, message, work) {
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  $("lock-error").textContent = message;
  try {
    return await work();
  } finally {
    button.disabled = false;
  }
}

/** First run: passwords match + length >= 8; random salt; derive key; save an empty vault. */
async function setup(password, confirm) {
  if (password.length < 8) return void ($("lock-error").textContent = "Use at least 8 characters.");
  if (password !== confirm) return void ($("lock-error").textContent = "The two passwords don't match.");
  await busy($("setup-form"), "Creating your journal…", async () => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const k = await deriveKey(password, salt);
    const fresh = { salt: toBase64(salt), iterations: PBKDF2_ITERATIONS, check: await encryptJSON(k, "christopia") };
    pages = [welcomePage()];
    fresh.pages = await encryptJSON(k, pages);
    try {
      await save("journal-vault", fresh);
    } catch {
      pages = [];
      $("lock-error").textContent = "Not saved: this browser isn't letting the page store anything (private mode?).";
      return;
    }
    $("setup-form").reset();
    openApp(k, fresh);
  });
}

/** Derive the key, decrypt `check` (catch -> "Wrong password"), decrypt pages, open the app. */
async function unlock(password) {
  $("unlock-password").value = ""; // don't leave it in the DOM either way
  await busy($("unlock-form"), "Unlocking…", async () => {
    const stored = await load("journal-vault", null);
    if (!stored) return showLockScreen();
    const k = await deriveKey(password, fromBase64(stored.salt), stored.iterations ?? PBKDF2_ITERATIONS);
    try {
      await decryptJSON(k, stored.check);
    } catch {
      $("lock-error").textContent = "Wrong password.";
      $("unlock-password").focus();
      return;
    }
    try {
      const decrypted = await decryptJSON(k, stored.pages);
      pages = Array.isArray(decrypted) ? decrypted : [];
    } catch {
      $("lock-error").textContent = "Your password is right, but the saved pages are damaged and can't be read.";
      return;
    }
    openApp(k, stored);
  });
}

function openApp(k, v) {
  key = k;
  vault = v;
  lastActivity = Date.now();
  $("lock-error").textContent = "";
  $("journal-lock").hidden = true;
  $("journal-app").hidden = false;
  setSaveStatus("Saved");
  const first = pages.find((p) => !p.trashed) ?? addPage(null);
  openPage(first.id);
}

/** Drop key + pages from memory, clear the editor DOM, show the lock screen. */
async function lock() {
  if (!key) return;
  await flush(); // save the last edits while we still have the key
  key = null;
  vault = null;
  pages = [];
  currentId = null;
  expanded.clear();
  for (const id of ["blocks", "page-tree", "favorite-list", "breadcrumb"]) $(id).replaceChildren();
  $("page-title").value = "";
  $("page-search").value = "";
  closeSlashMenu();
  await showLockScreen();
}

let saveTimer = null;
let saving = Promise.resolve();
let dirty = false;

function setSaveStatus(text) {
  $("save-status").textContent = text;
}

/** Mark the open page edited and save ~500 ms after the last change. */
function touch() {
  const page = current();
  if (page) page.updatedAt = Date.now();
  $("page-meta").textContent = "Edited just now";
  dirty = true;
  setSaveStatus("Saving…");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 500);
}

/** Encrypt and save all pages now (queued so two saves never interleave). */
function flush() {
  clearTimeout(saveTimer);
  if (!dirty || !key) return saving;
  dirty = false;
  const [k, v, snapshot] = [key, vault, structuredClone(pages)];
  saving = saving.then(() => persist(k, v, snapshot));
  return saving;
}

/** Encrypt and save; #save-status "Saved" / "Not saved". */
async function persist(k, v, snapshot) {
  try {
    await save("journal-vault", { ...v, pages: await encryptJSON(k, snapshot) });
    if (!dirty) setSaveStatus("Saved");
  } catch {
    dirty = true; // try again on the next edit
    setSaveStatus("Not saved (storage full or blocked)");
  }
}

/* ---------------- Pages and sidebar ---------------- */

function welcomePage() {
  const now = Date.now();
  return {
    id: crypto.randomUUID(), parentId: null, order: 0, icon: "📓", title: "Welcome", favorite: true, trashed: false,
    createdAt: now, updatedAt: now,
    blocks: [
      newBlock("h2", "Your private journal"),
      newBlock("text", "Everything here is encrypted with your password before it's saved in this browser."),
      { ...newBlock("todo", "Type / on an empty line for the block menu"), checked: false },
      { ...newBlock("todo", "Type # and a space for a heading, - for a list, [] for a to-do"), checked: false },
      newBlock("math", "e^{i\\pi} + 1 = 0"),
      newBlock("text", ""),
    ],
  };
}

function addPage(parentId) {
  const siblings = pages.filter((p) => p.parentId === parentId);
  const now = Date.now();
  const page = {
    id: crypto.randomUUID(), parentId, order: Math.max(0, ...siblings.map((p) => p.order)) + 1, icon: "📄", title: "",
    blocks: [newBlock()], favorite: false, trashed: false, createdAt: now, updatedAt: now,
  };
  pages.push(page);
  if (parentId) expanded.add(parentId);
  return page;
}

/** The page and every page under it. */
function withDescendants(id) {
  const out = [id];
  for (let i = 0; i < out.length; i++) for (const p of pages) if (p.parentId === out[i]) out.push(p.id);
  return pages.filter((p) => out.includes(p.id));
}

function ancestors(page) {
  const chain = [];
  for (let p = page; p && chain.length < 50; p = pages.find((x) => x.id === p.parentId)) chain.unshift(p);
  return chain;
}

const pageName = (p) => `${p.icon} ${p.title || "Untitled"}`;

function pageButton(page) {
  const b = el("button", { type: "button", className: "page-link", textContent: pageName(page) });
  if (page.id === currentId) b.setAttribute("aria-current", "page");
  b.addEventListener("click", () => openPage(page.id));
  return b;
}

/** Sidebar: favorites list + nested tree from buildPageTree; search results replace the tree while #page-search has text. */
function renderTree() {
  const live = pages.filter((p) => !p.trashed);
  $("favorite-list").replaceChildren(...live.filter((p) => p.favorite).map((p) => el("li", {}, pageButton(p))));
  $("favorite-list").previousElementSibling.hidden = !live.some((p) => p.favorite);
  $("open-trash").setAttribute("aria-pressed", String(trashMode));
  const label = $("page-tree").previousElementSibling;
  const q = $("page-search").value;

  if (trashMode) {
    label.textContent = "Trash";
    const trashed = pages.filter((p) => p.trashed);
    $("page-tree").replaceChildren(
      ...trashed.map((p) => {
        const restore = el("button", { type: "button", textContent: "Restore" });
        restore.addEventListener("click", () => restorePage(p.id));
        const remove = el("button", { type: "button", textContent: "Delete forever" });
        remove.addEventListener("click", () => deleteForever(p.id));
        return el("li", { className: "trash-row" }, el("span", { textContent: pageName(p) }), restore, remove);
      }),
    );
    if (!trashed.length) $("page-tree").append(el("li", { className: "empty-state", textContent: "Trash is empty." }));
  } else if (q.trim()) {
    label.textContent = "Results";
    const hits = searchPages(live, q);
    $("page-tree").replaceChildren(...hits.map((p) => el("li", {}, pageButton(p))));
    if (!hits.length) $("page-tree").append(el("li", { className: "empty-state", textContent: "No pages match." }));
  } else {
    label.textContent = "Pages";
    const item = ({ page, children }) => {
      const row = el("div", { className: "tree-row" });
      if (children.length) {
        const open = expanded.has(page.id);
        const t = el("button", { type: "button", className: "tree-toggle", textContent: open ? "▾" : "▸" });
        t.setAttribute("aria-expanded", String(open));
        t.setAttribute("aria-label", `${open ? "Hide" : "Show"} pages inside ${page.title || "Untitled"}`);
        t.addEventListener("click", () => {
          if (open) expanded.delete(page.id);
          else expanded.add(page.id);
          renderTree();
        });
        row.append(t);
      } else row.append(el("span", { className: "tree-toggle" }));
      const add = el("button", { type: "button", className: "tree-add", textContent: "+" });
      add.setAttribute("aria-label", `New page inside ${page.title || "Untitled"}`);
      add.addEventListener("click", () => {
        const child = addPage(page.id);
        touch();
        openPage(child.id, { focusTitle: true });
      });
      row.append(pageButton(page), add);
      const li = el("li", {}, row);
      if (children.length && expanded.has(page.id)) li.append(el("ul", {}, ...children.map(item)));
      return li;
    };
    $("page-tree").replaceChildren(...buildPageTree(live).map(item));
  }
}

function trashPage(id) {
  for (const p of withDescendants(id)) p.trashed = true;
  touch();
  const next = pages.find((p) => !p.trashed) ?? addPage(null);
  openPage(next.id);
}

function restorePage(id) {
  const page = pages.find((p) => p.id === id);
  for (const p of withDescendants(id)) p.trashed = false;
  if (pages.find((p) => p.id === page.parentId)?.trashed) page.parentId = null; // parent still in trash
  trashMode = false;
  touch();
  openPage(id);
}

function deleteForever(id) {
  const doomed = withDescendants(id);
  const name = doomed[0].title || "Untitled";
  if (!confirm(`Delete "${name}"${doomed.length > 1 ? ` and the ${doomed.length - 1} pages inside it` : ""} forever? This can't be undone.`)) return;
  pages = pages.filter((p) => !doomed.includes(p));
  dirty = true;
  flush();
  renderTree();
}

/** Open a page: breadcrumb, icon, title, meta ("Edited 5 min ago"), blocks. */
function openPage(id, { focusTitle = false } = {}) {
  const page = pages.find((p) => p.id === id);
  if (!page) return;
  closeSlashMenu();
  currentId = id;
  for (const a of ancestors(page).slice(0, -1)) expanded.add(a.id);
  $("page-icon").textContent = page.icon;
  $("page-title").value = page.title;
  $("page-meta").textContent = `Edited ${relativeTime(page.updatedAt, Date.now())}`;
  $("favorite-toggle").setAttribute("aria-pressed", String(!!page.favorite));
  $("favorite-toggle").textContent = page.favorite ? "★ Favorite" : "☆ Favorite";
  renderBreadcrumb(page);
  renderBlocks(page);
  renderTree();
  if (focusTitle) $("page-title").focus();
}

function renderBreadcrumb(page) {
  const chain = ancestors(page);
  $("breadcrumb").replaceChildren(
    ...chain.map((p, i) => {
      if (i === chain.length - 1) return el("li", { textContent: pageName(p) });
      const b = el("button", { type: "button", className: "crumb", textContent: pageName(p) });
      b.addEventListener("click", () => openPage(p.id));
      return el("li", {}, b);
    }),
  );
}

/* ---------------- Blocks ---------------- */

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const KEEP = { B: "b", STRONG: "b", I: "i", EM: "i", U: "u" };

/** Only bold / italic / underline / line breaks survive; everything else becomes its text. */
function cleanHtml(html) {
  const t = document.createElement("template"); // inert: nothing in it loads or runs
  t.innerHTML = html;
  const walk = (node) =>
    [...node.childNodes]
      .map((n) => {
        if (n.nodeType === Node.TEXT_NODE) return escapeHtml(n.data);
        if (n.nodeType !== Node.ELEMENT_NODE) return "";
        if (n.tagName === "BR") return "<br>";
        const inner = walk(n);
        if (KEEP[n.tagName]) return `<${KEEP[n.tagName]}>${inner}</${KEEP[n.tagName]}>`;
        return n.tagName === "DIV" || n.tagName === "P" ? `<br>${inner}` : inner;
      })
      .join("");
  return walk(t.content).replace(/^<br>/, "");
}

/** One block from its row in the DOM. */
function readRow(row) {
  const b = { id: row.dataset.id, type: row.dataset.type };
  if (b.type === "divider") return b;
  const ed = row.querySelector(".block");
  if (PLAIN_TYPES.has(b.type)) b.text = ed.innerText.replace(/\n$/, "");
  else {
    b.html = cleanHtml(ed.innerHTML);
    b.text = ed.textContent;
  }
  if (b.type === "todo") b.checked = row.querySelector("input").checked;
  if (b.type === "toggle") {
    b.body = row.querySelector(".toggle-body").innerText.replace(/\n$/, "");
    b.open = row.querySelector(".toggle-arrow").getAttribute("aria-expanded") === "true";
  }
  return b;
}

/** Copy the editor into the open page's blocks. */
function syncFromDom() {
  const page = current();
  if (page) page.blocks = [...$("blocks").children].map(readRow);
}

function renderMath(row) {
  const out = row.querySelector(".math-out");
  const tex = row.querySelector(".block").innerText.trim();
  if (!tex) out.textContent = "Empty equation: click to write LaTeX";
  else katex.render(tex, out, { throwOnError: false, displayMode: true });
}

function blockRow(b) {
  const row = el("div", { className: "block-row" });
  Object.assign(row.dataset, { id: b.id, type: b.type });
  if (b.type === "divider") {
    row.append(el("hr"));
    return row;
  }
  const ed = el("div", { className: "block", contentEditable: "true" });
  ed.dataset.type = b.type;
  ed.dataset.placeholder = b.type === "text" ? "Type '/' for commands" : LABELS[b.type];
  ed.setAttribute("role", "textbox");
  ed.setAttribute("aria-multiline", "true");
  ed.setAttribute("aria-label", LABELS[b.type]);
  if (PLAIN_TYPES.has(b.type)) ed.textContent = b.text ?? "";
  else ed.innerHTML = cleanHtml(b.html ?? escapeHtml(b.text ?? ""));

  if (b.type === "bullet" || b.type === "number") row.append(el("span", { className: "marker" }));
  if (b.type === "todo") {
    const box = el("input", { type: "checkbox", id: `chk-${b.id}`, checked: !!b.checked });
    box.setAttribute("aria-label", "Done");
    row.append(box, el("label", { htmlFor: box.id }));
    row.classList.toggle("checked", !!b.checked);
  }
  if (b.type === "toggle") {
    const arrow = el("button", { type: "button", className: "toggle-arrow", textContent: b.open ? "▾" : "▸" });
    arrow.setAttribute("aria-expanded", String(!!b.open));
    arrow.setAttribute("aria-label", "Show or hide what's inside");
    const body = el("div", { className: "toggle-body", contentEditable: "true", hidden: !b.open, textContent: b.body ?? "" });
    body.dataset.placeholder = "Hidden content";
    body.setAttribute("role", "textbox");
    body.setAttribute("aria-multiline", "true");
    body.setAttribute("aria-label", "Toggle content");
    row.append(arrow, el("div", { className: "toggle-main" }, ed, body));
    return row;
  }
  row.append(ed);
  if (b.type === "math") {
    const out = el("div", { className: "math-out", tabIndex: 0 });
    out.setAttribute("role", "button");
    out.setAttribute("aria-label", "Edit equation");
    row.append(out);
    renderMath(row);
  }
  return row;
}

/**
 * Render blocks as contenteditable elements by type (h1-h3, todo with a checkbox, bullet, number,
 * toggle, quote, callout, code, math rendered with KaTeX, divider as <hr>).
 */
function renderBlocks(page) {
  if (!page.blocks.length) page.blocks.push(newBlock());
  $("blocks").replaceChildren(...page.blocks.map(blockRow));
}

const rowOf = (node) => node?.closest?.(".block-row");
const editorOf = (row) => row?.querySelector(".block");

/** Caret position as a character offset inside the element (0 when there's no caret in it). */
function caretOffset(ed) {
  const sel = getSelection();
  if (!sel.rangeCount || !ed.contains(sel.anchorNode)) return 0;
  const r = sel.getRangeAt(0).cloneRange();
  r.selectNodeContents(ed);
  r.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
  return r.toString().length;
}

function setCaret(ed, offset) {
  const walker = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
  const r = document.createRange();
  let node;
  let left = offset;
  while ((node = walker.nextNode())) {
    if (left <= node.length) {
      r.setStart(node, left);
      break;
    }
    left -= node.length;
  }
  if (node) r.collapse(true);
  else {
    r.selectNodeContents(ed); // no text yet: caret at the end
    r.collapse(false);
  }
  getSelection().removeAllRanges();
  getSelection().addRange(r);
}

/** Focus a block by id; a divider passes focus to the block after it. */
function focusBlock(id, offset = 0) {
  let row = [...$("blocks").children].find((r) => r.dataset.id === id);
  while (row?.dataset.type === "divider") row = row.nextElementSibling;
  const ed = editorOf(row);
  if (!ed) return;
  if (row.dataset.type === "math") row.classList.add("editing");
  ed.focus();
  setCaret(ed, offset === Infinity ? ed.textContent.length : offset);
}

/** Change one block's type in the model, re-render, and put the caret back in it (end by default). */
function setType(row, type, caret = Infinity) {
  syncFromDom();
  const page = current();
  const i = page.blocks.findIndex((b) => b.id === row.dataset.id);
  const b = page.blocks[i];
  page.blocks[i] = { ...newBlock(type), id: b.id, text: type === "divider" ? "" : b.text, html: b.html, checked: false };
  if (type === "divider") page.blocks.splice(i + 1, 0, newBlock());
  renderBlocks(page);
  focusBlock(type === "divider" ? page.blocks[i + 1].id : b.id, caret);
  touch();
}

/* ---------------- Slash menu ---------------- */

let slashRow = null;

function openSlashMenu(row) {
  slashRow = row;
  const menu = $("slash-menu");
  const box = row.getBoundingClientRect();
  const host = $("journal-editor").getBoundingClientRect();
  menu.style.top = `${box.bottom - host.top + 4}px`; // set from JS: the menu follows whichever block it opened on
  menu.style.left = `${Math.max(0, box.left - host.left)}px`;
  menu.hidden = false;
  selectOption(menu.querySelector("li"));
}

function closeSlashMenu() {
  $("slash-menu").hidden = true;
  slashRow = null;
}

function selectOption(li) {
  for (const o of $("slash-menu").children) o.setAttribute("aria-selected", String(o === li));
  li.scrollIntoView({ block: "nearest" });
}

function pickOption(li) {
  const row = slashRow;
  closeSlashMenu();
  if (row) setType(row, li.dataset.type);
}

/* ---------------- Editor keys ---------------- */

/**
 * Editor keys inside a block: Enter = new block below (same list type); Backspace at the start turns
 * a block into text, then joins it onto the one above; arrows move between blocks; while the slash
 * menu is open, arrows + Enter pick and Esc closes.
 */
function onBlockKeydown(e) {
  const ed = e.target.closest(".block");
  const row = rowOf(ed);
  if (!ed || !row) return;
  const type = row.dataset.type;

  if (!$("slash-menu").hidden) {
    const options = [...$("slash-menu").children];
    const at = options.findIndex((o) => o.getAttribute("aria-selected") === "true");
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      selectOption(options[(at + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length]);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      pickOption(options[at]);
      return;
    }
    closeSlashMenu(); // Esc or anything else
    if (e.key === "Escape") return;
  }

  const text = ed.textContent;
  const offset = caretOffset(ed);
  const collapsed = getSelection().isCollapsed;

  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    if (type === "code") return void document.execCommand("insertLineBreak");
    if (type === "math") return void focusBlock(row.nextElementSibling?.dataset.id ?? insertAfter(row, "text"));
    if (LIST_TYPES.has(type) && !text) return void setType(row, "text"); // Enter on an empty item ends the list
    splitBlock(ed, row);
  } else if (e.key === "Backspace" && collapsed && offset === 0) {
    if (type !== "text") {
      e.preventDefault();
      setType(row, "text", 0);
    } else if (row.previousElementSibling) {
      e.preventDefault();
      mergeIntoPrevious(row);
    }
  } else if (e.key === "ArrowUp" && offset === 0 && row.previousElementSibling) {
    e.preventDefault();
    focusUp(row);
  } else if (e.key === "ArrowDown" && offset === text.length && row.nextElementSibling) {
    e.preventDefault();
    focusBlock(row.nextElementSibling.dataset.id, 0);
  }
}

function focusUp(row) {
  let prev = row.previousElementSibling;
  while (prev?.dataset.type === "divider") prev = prev.previousElementSibling;
  if (prev) focusBlock(prev.dataset.id, Infinity);
}

/**
 * "/" on an empty line opens the block menu; a space right after a Markdown prefix converts the block.
 * Done on beforeinput, not keydown: phone keyboards report most keys as "Unidentified".
 */
function onBlockBeforeInput(e) {
  const ed = e.target.closest?.(".block");
  const row = rowOf(ed);
  if (!row || e.inputType !== "insertText") return;
  const type = row.dataset.type;
  const text = ed.textContent;
  if (e.data === "/" && !text && !PLAIN_TYPES.has(type)) {
    e.preventDefault();
    openSlashMenu(row);
  } else if (e.data === " " && getSelection().isCollapsed && caretOffset(ed) === text.length && type !== "code") {
    const shortcut = markdownShortcut(text);
    if (shortcut && shortcut !== type) {
      e.preventDefault();
      ed.textContent = "";
      setType(row, shortcut);
    }
  }
}

/** Insert an empty block after this row; returns its id. */
function insertAfter(row, type) {
  syncFromDom();
  const page = current();
  const i = page.blocks.findIndex((b) => b.id === row.dataset.id);
  const b = newBlock(type);
  page.blocks.splice(i + 1, 0, b);
  renderBlocks(page);
  touch();
  return b.id;
}

/** Enter: everything after the caret moves to a new block below (formatting kept). */
function splitBlock(ed, row) {
  const sel = getSelection();
  const r = sel.getRangeAt(0);
  r.deleteContents();
  const tail = document.createRange();
  tail.setStart(r.endContainer, r.endOffset);
  tail.setEnd(ed, ed.childNodes.length);
  const holder = el("div");
  holder.append(tail.extractContents());
  syncFromDom();
  const page = current();
  const i = page.blocks.findIndex((b) => b.id === row.dataset.id);
  const type = LIST_TYPES.has(row.dataset.type) ? row.dataset.type : "text";
  const b = { ...newBlock(type, holder.textContent), html: cleanHtml(holder.innerHTML) };
  if (type === "todo") b.checked = false;
  page.blocks.splice(i + 1, 0, b);
  renderBlocks(page);
  focusBlock(b.id, 0);
  touch();
}

/** Backspace at the start of a text block: join it onto the block above (or remove a divider above). */
function mergeIntoPrevious(row) {
  syncFromDom();
  const page = current();
  const i = page.blocks.findIndex((b) => b.id === row.dataset.id);
  const prev = page.blocks[i - 1];
  const cur = page.blocks[i];
  if (prev.type === "divider") {
    page.blocks.splice(i - 1, 1);
    renderBlocks(page);
    focusBlock(cur.id, 0);
  } else if (PLAIN_TYPES.has(prev.type) || prev.type === "toggle") {
    if (cur.text) return focusBlock(prev.id, Infinity); // don't pour formatted text into code / math
    page.blocks.splice(i, 1);
    renderBlocks(page);
    focusBlock(prev.id, Infinity);
  } else {
    const join = prev.text.length;
    prev.html = (prev.html ?? escapeHtml(prev.text)) + (cur.html ?? escapeHtml(cur.text));
    prev.text += cur.text;
    page.blocks.splice(i, 1);
    renderBlocks(page);
    focusBlock(prev.id, join);
  }
  touch();
}

/* ---------------- Wiring ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  $("setup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    setup($("setup-password").value, $("setup-confirm").value);
  });
  $("unlock-form").addEventListener("submit", (e) => {
    e.preventDefault();
    unlock($("unlock-password").value);
  });
  $("lock-now").addEventListener("click", lock);

  const blocks = $("blocks");
  blocks.addEventListener("keydown", onBlockKeydown);
  blocks.addEventListener("beforeinput", onBlockBeforeInput);
  blocks.addEventListener("input", (e) => {
    const row = rowOf(e.target);
    if (row?.dataset.type === "math") renderMath(row);
    const typed = e.target.closest(".block")?.textContent;
    // ``` and --- convert as soon as they're typed (no space needed).
    if ((typed === "```" || typed === "---") && row.dataset.type === "text") {
      e.target.textContent = "";
      setType(row, markdownShortcut(typed));
      return;
    }
    syncFromDom();
    touch();
  });
  blocks.addEventListener("paste", (e) => {
    e.preventDefault(); // plain text only: pasted web pages can't bring their HTML (or scripts) in
    document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
  });
  blocks.addEventListener("change", (e) => {
    if (e.target.type !== "checkbox") return;
    rowOf(e.target).classList.toggle("checked", e.target.checked);
    syncFromDom();
    touch();
  });
  blocks.addEventListener("click", (e) => {
    const arrow = e.target.closest(".toggle-arrow");
    if (arrow) {
      const open = arrow.getAttribute("aria-expanded") !== "true";
      arrow.setAttribute("aria-expanded", String(open));
      arrow.textContent = open ? "▾" : "▸";
      rowOf(arrow).querySelector(".toggle-body").hidden = !open;
      syncFromDom();
      touch();
    }
    const out = e.target.closest(".math-out");
    if (out) focusBlock(rowOf(out).dataset.id, Infinity);
  });
  blocks.addEventListener("keydown", (e) => {
    if (e.target.classList.contains("math-out") && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      focusBlock(rowOf(e.target).dataset.id, Infinity);
    }
  });
  blocks.addEventListener("focusout", (e) => {
    const row = rowOf(e.target);
    if (row?.dataset.type === "math" && !row.contains(e.relatedTarget)) row.classList.remove("editing");
  });

  $("slash-menu").addEventListener("mousedown", (e) => e.preventDefault()); // keep the caret in the block
  $("slash-menu").addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (li) pickOption(li);
  });

  $("page-title").addEventListener("input", () => {
    current().title = $("page-title").value;
    renderBreadcrumb(current());
    renderTree();
    touch();
  });
  $("page-title").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      focusBlock(current().blocks[0].id, 0);
    }
  });
  $("page-icon").addEventListener("click", () => {
    const page = current();
    page.icon = ICONS[(ICONS.indexOf(page.icon) + 1) % ICONS.length];
    $("page-icon").textContent = page.icon;
    renderBreadcrumb(page);
    renderTree();
    touch();
  });
  $("favorite-toggle").addEventListener("click", () => {
    current().favorite = !current().favorite;
    touch();
    openPage(currentId);
  });
  $("delete-page").addEventListener("click", () => trashPage(currentId));
  $("new-page").addEventListener("click", () => {
    trashMode = false;
    $("page-search").value = "";
    const page = addPage(null);
    touch();
    openPage(page.id, { focusTitle: true });
  });
  $("open-trash").addEventListener("click", () => {
    trashMode = !trashMode;
    renderTree();
  });
  $("page-search").addEventListener("input", () => {
    trashMode = false;
    renderTree();
  });

  // Shortcuts, auto-lock, and saving before the tab goes away.
  document.addEventListener("keydown", (e) => {
    if (!key || !(e.metaKey || e.ctrlKey)) return;
    if (e.key.toLowerCase() === "k") {
      e.preventDefault();
      $("page-search").focus();
    } else if (e.key.toLowerCase() === "l") {
      e.preventDefault();
      lock();
    }
  });
  for (const type of ["keydown", "pointerdown", "input"]) document.addEventListener(type, () => (lastActivity = Date.now()));
  setInterval(() => {
    if (key && Date.now() - lastActivity > AUTO_LOCK_MS) lock();
  }, 30_000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  addEventListener("beforeunload", (e) => {
    if (dirty) e.preventDefault(); // the encrypted save is async: ask before leaving mid-save
  });

  showLockScreen();
});
