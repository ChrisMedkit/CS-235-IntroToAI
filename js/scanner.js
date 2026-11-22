// Notes Scanner page. Uses the Tesseract global from the CDN script (runs fully in the browser).
import { cleanOcrText, SCAN_STORAGE_KEY } from "./utils.js";

/** Show the chosen image in #scan-preview (URL.createObjectURL; revoke the old URL). */
function showPreview(file) {
  // TODO (Plan step 9b)
  void file;
}

/**
 * Run OCR on the image and fill #scan-text.
 * @param {File} file
 * @param {string} lang  Tesseract language code, e.g. "eng"
 */
async function scan(file, lang) {
  // TODO (Plan step 9c):
  // 1. Disable the Scan button, show #scan-progress.
  // 2. const { data } = await Tesseract.recognize(file, lang, { logger: updateProgress })
  // 3. text = cleanOcrText(data.text); put in #scan-text; save to localStorage[SCAN_STORAGE_KEY].
  // 4. try/catch: show a readable error in #scan-status; finally re-enable the button.
  void file, lang, cleanOcrText, SCAN_STORAGE_KEY;
}

/** Tesseract logger callback: m.status + m.progress (0..1) -> #scan-progress / #scan-status. */
function updateProgress(m) {
  // TODO (Plan step 9c)
  void m;
}

/** Copy #scan-text to the clipboard (navigator.clipboard.writeText), confirm in #scan-status. */
async function copyText() {
  // TODO (Plan step 9d)
}

/** Download #scan-text as notes.txt (Blob + temporary <a download>). */
function downloadText() {
  // TODO (Plan step 9d)
}

/** Save the current text and go to latex.html (the LaTeX page reads SCAN_STORAGE_KEY). */
function sendToLatex() {
  // TODO (Plan step 10c)
}

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("scan-file");
  fileInput?.addEventListener("change", () => showPreview(fileInput.files[0]));
  document.getElementById("scan-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (file) scan(file, document.getElementById("scan-lang").value);
  });
  document.getElementById("copy-text")?.addEventListener("click", copyText);
  document.getElementById("download-text")?.addEventListener("click", downloadText);
  document.getElementById("send-to-latex")?.addEventListener("click", sendToLatex);
  void updateProgress;
});
