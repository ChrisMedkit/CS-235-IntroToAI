// Private Journal page: Notion-style block editor over an encrypted vault.
// Vault in storage.js ("journal-vault"): {salt: base64, check: {iv, data}, pages: {iv, data}}.
// `check` is encryptJSON(key, "christopia") so a wrong password fails fast and clearly.
// Decrypted pages: [{id, parentId, order, icon, title, blocks: [{id, type, text, checked?}],
//                    favorite, trashed, createdAt, updatedAt}]
import { load, save } from "./storage.js";
import {
  deriveKey,
  encryptJSON,
  decryptJSON,
  markdownShortcut,
  buildPageTree,
  searchPages,
} from "./social-lib.js";

const AUTO_LOCK_MS = 10 * 60 * 1000; // lock after 10 minutes without input

// Key and pages exist only in memory while unlocked; lock() drops them.
let key = null;
let pages = [];
let currentId = null;

/** Show #setup-form if there is no vault yet, else #unlock-form. */
async function showLockScreen() {
  // TODO (Plan Social step 3b)
  void load;
}

/** First run: passwords match + length >= 8; random salt; derive key; save an empty vault. */
async function setup(password, confirm) {
  // TODO (Plan Social step 3b): crypto.getRandomValues(new Uint8Array(16)) for the salt.
  void password, confirm, deriveKey, encryptJSON;
}

/** Derive the key, decrypt `check` (catch -> "Wrong password"), decrypt pages, open the app. */
async function unlock(password) {
  // TODO (Plan Social step 3b): clear the password field either way.
  void password, decryptJSON;
}

/** Drop key + pages from memory, clear the editor DOM, show the lock screen. */
function lock() {
  key = null;
  pages = [];
  currentId = null;
  // TODO (Plan Social step 3c): empty #blocks/#page-tree, hide #journal-app, show #journal-lock.
}

/** Encrypt and save all pages; debounce ~500 ms after edits; #save-status "Saving…" / "Saved" / "Not saved". */
async function persist() {
  // TODO (Plan Social step 3c)
  void key, save;
}

/** Sidebar: favorites list + nested tree from buildPageTree; search results replace the tree while #page-search has text. */
function renderTree() {
  // TODO (Plan Social step 4b)
  void pages, buildPageTree, searchPages;
}

/** Open a page: breadcrumb, icon, title, meta ("Edited 5 min ago"), blocks. */
function openPage(id) {
  // TODO (Plan Social step 4c)
  void id, currentId;
}

/**
 * Render blocks as contenteditable elements by type (h1-h3, todo with a checkbox, bullet, number,
 * toggle as <details>, quote, callout, code as <pre>, math rendered with katex.render on blur,
 * divider as <hr>). Text via textContent.
 */
function renderBlocks(page) {
  // TODO (Plan Social step 4c)
  void page;
}

/**
 * Editor keys inside a block: Enter = new block below (same list type); Backspace at start of an
 * empty block = delete it / turn into text; "/" opens #slash-menu (arrow keys + Enter pick, Esc
 * closes); space after a Markdown prefix converts via markdownShortcut; ⌘/Ctrl+B / I format.
 */
function onBlockKeydown(e) {
  // TODO (Plan Social step 4d)
  void e, markdownShortcut;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("setup-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    setup(document.getElementById("setup-password").value, document.getElementById("setup-confirm").value);
  });
  document.getElementById("unlock-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    unlock(document.getElementById("unlock-password").value);
  });
  document.getElementById("lock-now")?.addEventListener("click", lock);
  document.getElementById("blocks")?.addEventListener("keydown", onBlockKeydown);
  document.getElementById("page-search")?.addEventListener("input", renderTree);
  // TODO (Plan Social step 3c): auto-lock timer reset on input; lock on ⌘/Ctrl+L.
  // TODO (Plan Social step 4): New page, favorite, trash, icon picker, title input -> persist().
  void AUTO_LOCK_MS, persist, openPage, renderBlocks;
  showLockScreen();
});
