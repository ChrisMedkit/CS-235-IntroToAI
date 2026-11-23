// Notes Scanner page. Uses the Tesseract global from the CDN script (runs fully in the browser).
import { cleanOcrText, SCAN_STORAGE_KEY } from "./utils.js";
import { download } from "./dom.js";

const $ = (id) => document.getElementById(id);
let previewUrl = null;

/** Show the chosen image in #scan-preview (URL.createObjectURL; revoke the old URL). */
function showPreview(file) {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = file ? URL.createObjectURL(file) : null;
  $("scan-preview").hidden = !file;
  if (file) $("scan-image").src = previewUrl;
}

/** Save the text for the LaTeX page; false if this browser won't store it. */
function saveScan(text) {
  try {
    localStorage.setItem(SCAN_STORAGE_KEY, text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Run OCR on the image and fill #scan-text.
 * @param {File} file
 * @param {string} lang  Tesseract language code, e.g. "eng"
 */
async function scan(file, lang) {
  const button = $("scan-form").querySelector('[type="submit"]');
  button.disabled = true;
  Object.assign($("scan-progress"), { hidden: false, value: 0 });
  $("scan-status").textContent = "Starting…";
  try {
    const { data } = await Tesseract.recognize(file, lang, { logger: updateProgress });
    const text = cleanOcrText(data.text);
    $("scan-text").value = text;
    const saved = saveScan(text);
    $("scan-status").textContent = !text
      ? "No text found. Try a sharper, brighter photo taken straight on."
      : `Done (${Math.round(data.confidence)}% confidence). Check it over: OCR misreads messy handwriting and math symbols.` +
        (saved ? "" : " (This browser won't save it for the LaTeX page.)");
  } catch (err) {
    $("scan-status").textContent = `Scan failed: ${err?.message ?? err}. Check your connection (the first scan downloads the language data) and try again.`;
  } finally {
    button.disabled = false;
    $("scan-progress").hidden = true;
  }
}

/** Tesseract logger callback: m.status + m.progress (0..1) -> #scan-progress / #scan-status. */
function updateProgress(m) {
  $("scan-progress").value = m.progress ?? 0;
  const status = m.status.charAt(0).toUpperCase() + m.status.slice(1);
  $("scan-status").textContent = `${status}… ${Math.round((m.progress ?? 0) * 100)}%`;
}

/** Copy #scan-text to the clipboard (navigator.clipboard.writeText), confirm in #scan-status. */
async function copyText() {
  try {
    await navigator.clipboard.writeText($("scan-text").value);
    $("scan-status").textContent = "Copied to the clipboard.";
  } catch {
    $("scan-text").select(); // clipboard blocked: select it so ⌘C / Ctrl+C works
    $("scan-status").textContent = "Couldn't copy automatically; it's selected, so press Ctrl+C (⌘C on a Mac).";
  }
}

/** Download #scan-text as notes.txt. */
const downloadText = () => download("notes.txt", $("scan-text").value, "text/plain");

/** Save the current text and go to latex.html (the LaTeX page reads SCAN_STORAGE_KEY). */
function sendToLatex() {
  if (!saveScan($("scan-text").value)) {
    $("scan-status").textContent = "This browser won't store the text; copy it and paste it into the LaTeX page instead.";
    return;
  }
  location.href = "latex.html?from=scanner";
}

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = $("scan-file");
  fileInput.addEventListener("change", () => showPreview(fileInput.files[0]));
  $("scan-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (file) scan(file, $("scan-lang").value);
  });
  $("copy-text").addEventListener("click", copyText);
  $("download-text").addEventListener("click", downloadText);
  $("send-to-latex").addEventListener("click", sendToLatex);
});
