// LaTeX Scratchpad page. Uses globals from KaTeX CDN scripts: renderMathInElement (auto-render).
import { toLatexDocument, SCAN_STORAGE_KEY } from "./utils.js";

const $ = (id) => document.getElementById(id);

/** Copy #latex-source into #latex-preview as text, then render $...$ / $$...$$ with KaTeX. */
function renderPreview() {
  const preview = $("latex-preview");
  preview.textContent = $("latex-source").value; // textContent, never innerHTML: the text is user input
  renderMathInElement(preview, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false, // a typo shows red in place instead of blanking the preview
  });
}

/** Put the last scan (localStorage[SCAN_STORAGE_KEY]) into the editor; say so if none. */
function loadLastScan() {
  let text = null;
  try {
    text = localStorage.getItem(SCAN_STORAGE_KEY);
  } catch {
    /* storage blocked: same as no scan */
  }
  if (!text) {
    $("latex-status").textContent = "No scan yet: scan some notes on the Notes Scanner first.";
    return;
  }
  $("latex-source").value = text;
  $("latex-status").textContent = "Loaded your last scan. Wrap math in $…$ to typeset it.";
  renderPreview();
}

/** Download toLatexDocument(source) as notes.tex. */
function downloadTex() {
  const blob = new Blob([toLatexDocument($("latex-source").value, "Notes")], { type: "application/x-tex" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "notes.tex" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000); // revoking at once can cancel the download in Firefox
  $("latex-status").textContent = "Saved notes.tex: it compiles with pdflatex or on Overleaf.";
}

let timer = null;
document.addEventListener("DOMContentLoaded", () => {
  $("latex-source").addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(renderPreview, 150);
  });
  $("load-scan").addEventListener("click", loadLastScan);
  $("download-tex").addEventListener("click", downloadTex);
  $("clear-latex").addEventListener("click", () => {
    $("latex-source").value = "";
    $("latex-status").textContent = "";
    renderPreview();
    $("latex-source").focus();
  });
  if (new URLSearchParams(location.search).get("from") === "scanner") loadLastScan();
  else renderPreview();
});
