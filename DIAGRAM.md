# Christopia — Diagrams
See [OUTLINE.md](OUTLINE.md)

## Plan
```mermaid
flowchart TD
  subgraph M1["Milestone 1: content and structure"]
    S1["Step 1: theme, text, images, tools.js"] --> S2["Step 2: LLM warm-up (PROMPT_LOG.md)"]
    S2 --> S3["Step 3: Home hero + about (index.html)"]
    S3 --> S4["Step 4: tool gallery (script.js)"]
    S4 --> S5["Step 5: nav on all pages (script.js)"]
    S5 --> S6["Step 6: CSS + dark/light (style.css, script.js)"]
  end
  subgraph M2["Milestone 2: tools"]
    S7["Step 7: Plotter (plotter.js, utils.js)"] --> S8["Step 8: Matrix Lab (matrix.js, utils.js)"]
    S8 --> S9["Step 9: Scanner (scanner.js, utils.js)"]
    S9 --> S10["Step 10: LaTeX (latex.js, utils.js)"]
    S10 --> S11["Step 11: Hub (hub.js, utils.js)"]
  end
  subgraph M3["Milestone 3: finish"]
    S12["Step 12: test + debug (TEST_REPORT.md)"] --> S13["Step 13: Pages deploy, log, reflection, submit"]
  end
  S6 --> S7
  S11 --> S12
```
The plan steps in order, grouped into three milestones; commit after each step.

## Sitemap
```mermaid
flowchart TD
  NAV["Shared nav (every page)"]
  NAV --> H["index.html: Home"]
  NAV --> P["plotter.html: Plotter"]
  NAV --> S["scanner.html: Scanner"]
  NAV --> M["matrix.html: Matrix Lab"]
  NAV --> L["latex.html: LaTeX"]
  NAV --> HB["hub.html: Hub"]
  H -- "gallery cards" --> P & S & M & L & HB
  HB -- "live tool cards" --> P & S & M & L
  S -- "Open in LaTeX editor (localStorage)" --> L
```
Every page links to every other through the nav; the gallery and Hub also link to tools, and the Scanner hands text to the LaTeX page.

## Home page wireframe
```mermaid
flowchart TD
  subgraph PAGE["index.html"]
    direction TB
    subgraph HEADER["header.site-header"]
      direction LR
      B["Christopia brand"] --- NT["Menu (mobile)"] --- NV["nav: Home, Plotter, Scanner, Matrix Lab, LaTeX, Hub"] --- TT["Dark mode toggle"]
    end
    subgraph MAIN["main"]
      direction TB
      HERO["section#hero: h1, tagline, image, Browse button"]
      GAL["section#tools: ul.tool-gallery, cards scroll sideways"]
      AB["section#about"]
      HERO --> GAL --> AB
    end
    FOOT["footer.site-footer"]
    HEADER --> MAIN --> FOOT
  end
```
Layout of the home page from top to bottom; the tool gallery scrolls horizontally with scroll-snap.

## Code structure
```mermaid
flowchart LR
  subgraph shared["shared"]
    SC["script.js<br>applyTheme, toggleTheme, initTheme<br>toggleNav, markActiveNav<br>renderToolGallery"]
    TL["tools.js<br>TOOLS"]
    U["utils.js<br>sample2D, sampleSurface<br>parseMatrix, rref, formatNumber<br>cleanOcrText, toLatexDocument<br>filterTools"]
  end
  PL["plotter.js<br>addExpressionRow, removeExpressionRow<br>readWindow, compileExpression, redraw"]
  SN["scanner.js<br>showPreview, scan, updateProgress<br>copyText, downloadText, sendToLatex"]
  MX["matrix.js<br>matrixTable, compute"]
  LX["latex.js<br>renderPreview, loadLastScan, downloadTex"]
  HJ["hub.js<br>renderHub, onFilter"]
  T["tests/utils.test.js"]
  SC --> TL
  SC --> U
  HJ --> TL
  PL & SN & MX & LX & HJ --> U
  T --> U & TL
  PL -. "math, Plotly (CDN)" .-> X1(("CDN"))
  MX -. "math (CDN)" .-> X1
  SN -. "Tesseract (CDN)" .-> X1
  LX -. "KaTeX (CDN)" .-> X1
```
Files and their functions; arrows are imports, dotted arrows are globals from pinned CDN scripts.

## Scanner flow
```mermaid
flowchart TD
  A["Choose photo (file or camera)"] --> B["showPreview"]
  B --> C{"Scan pressed?"}
  C -- yes --> D["scan: Tesseract.recognize with updateProgress"]
  D --> E{"OCR ok?"}
  E -- no --> F["show error in #scan-status"]
  E -- yes --> G["cleanOcrText"]
  G --> H["#scan-text + localStorage lastScan"]
  H --> I["Copy / Download .txt"]
  H --> J["sendToLatex: latex.html loads lastScan"]
```
What happens from choosing a photo to typed text and the handoff to the LaTeX page.

## Plotter flow
```mermaid
flowchart TD
  A["input event (debounced)"] --> B["readWindow"]
  B --> C{"min < max?"}
  C -- no --> E1["#plot-error"]
  C -- yes --> D{"mode"}
  D -- 2D --> F["compileExpression per row, sample2D"]
  D -- 3D --> G["compileExpression per row, sampleSurface"]
  F --> H["Plotly.react #plot"]
  G --> H
  F -. "syntax error" .-> E1
  G -. "syntax error" .-> E1
```
How an edit becomes a redrawn graph.

## Requirements → code
```mermaid
flowchart LR
  R1["3+ pages"] --> C1["6 html pages"]
  R2["Consistent nav"] --> C2["header in each page, markActiveNav"]
  R3["2+ images with alt"] --> C3["images/, hero + cards"]
  R4["Consistent design"] --> C4["style.css tokens"]
  R5["JS feature"] --> C5["toggleTheme, renderToolGallery, tools"]
  R6["Responsive"] --> C6["media query, toggleNav"]
  R7["Tool logic correct"] --> C7["utils.js"]
  C7 --> T1["tests/utils.test.js"]
  C5 --> T2["TEST_REPORT.md item 3"]
  C1 & C2 --> T3["TEST_REPORT.md items 1, 6"]
  C6 --> T4["TEST_REPORT.md item 4"]
  C3 --> T5["TEST_REPORT.md item 2"]
  R8["Prompt log + reflection"] --> C8["PROMPT_LOG.md"]
```
Each spec requirement, the code that satisfies it, and the test or report item that checks it.
