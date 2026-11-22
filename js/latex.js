// LaTeX Scratchpad page. Uses globals from KaTeX CDN scripts: renderMathInElement (auto-render).
import { toLatexDocument, SCAN_STORAGE_KEY } from "./utils.js";

/** Copy #latex-source into #latex-preview as text, then render $...$ / $$...$$ with KaTeX. */
function renderPreview() {
  // TODO (Plan step 10b):
  // preview.textContent = source.value  (textContent, never innerHTML: the text is user input)
  // renderMathInElement(preview, { delimiters: [$$ display, $ inline], throwOnError: false })
}

/** Put the last scan (localStorage[SCAN_STORAGE_KEY]) into the editor; say so if none. */
function loadLastScan() {
  // TODO (Plan step 10c)
  void SCAN_STORAGE_KEY;
}

/** Download toLatexDocument(source) as notes.tex. */
function downloadTex() {
  // TODO (Plan step 10d)
  void toLatexDocument;
}

document.addEventListener("DOMContentLoaded", () => {
  // TODO (Plan step 10b): debounce so long documents don't re-render on every key.
  document.getElementById("latex-source")?.addEventListener("input", renderPreview);
  document.getElementById("load-scan")?.addEventListener("click", loadLastScan);
  document.getElementById("download-tex")?.addEventListener("click", downloadTex);
  document.getElementById("clear-latex")?.addEventListener("click", () => {
    document.getElementById("latex-source").value = "";
    renderPreview();
  });
  // TODO: if the URL has ?from=scanner, call loadLastScan() first.
  renderPreview();
});
