# Christopia: Personal Interest Website with an LLM — CS235
**Due:** not stated  ·  **Type:** Web (static HTML/CSS/JS + CDN libraries)  ·  **Points:** 100 (5 criteria × 20)
See [DIAGRAM.md](DIAGRAM.md) for diagrams. Spec images: [assignment/](assignment/).

## Summary
Build a multi-page website on a topic you care about, using an LLM as a development partner, and document that use. Christopia is a hub of study tools for an applied math + CS major: a home page with a scrolling gallery of tools, a 2D/3D function plotter, a notes scanner (photo → typed text), a Matrix Lab, a LaTeX scratchpad, and a Hub page that lists live and planned tools (home server, smart home, ...). Graded on content, design/CSS, the JS features, code quality, and the prompt log + reflection.

## Direction & class methods
- **Vision:** Christopia as a growing personal tool hub, not a one-off assignment. Every tool lives in one registry (`js/tools.js`) so adding a tool = one entry + one page + one nav link. Theme comes later from you; all colors/fonts are tokens in `:root` so a re-theme touches one block.
- **Pages:** Home, Plotter, Scanner, Matrix Lab, LaTeX Scratchpad, Hub (you chose all three candidates for the open page).
- **Scanner:** static, in-browser OCR with Tesseract.js (works on GitHub Pages; images never leave the device). Weak on messy handwriting and math symbols; an AI backend on the home server is a later milestone, not part of this build.
- **Plotter libraries:** math.js (parse/evaluate expressions) + Plotly.js (2D lines, 3D surfaces). KaTeX for the LaTeX page. All pinned on a CDN.
- **Process:** the spec's Steps 4–9 in order, one milestone at a time, commit at the end of each step, detailed TODOs. Log every significant prompt in `PROMPT_LOG.md` as you go.
- **In-class methods & notation:** the spec's suggested structure (`css/style.css`, `js/script.js`, `images/`), semantic landmarks, one shared stylesheet, one shared script. Pure logic is split into `js/utils.js` so it can be unit-tested with `node --test` (no installs).
- **Constraints:** own or permitted images only; no copied text; alt text on every image; no console errors; works at 375 px.

## Requirements
- [ ] At least three pages: Home, Plotter, Scanner, Matrix Lab, LaTeX, Hub (6)
- [ ] Identical navigation menu on every page linking all pages
- [ ] At least two images, own or permitted (replace the `images/*.svg` placeholders)
- [ ] Consistent visual design: shared colors, fonts, layout (`css/style.css` tokens)
- [ ] At least one JS interactive feature (we have several: gallery, dark/light toggle, plotter, scanner, matrix, LaTeX, hub filter)
- [ ] Responsive on desktop and phone
- [ ] Semantic HTML: `header`, `nav`, `main`, `section`, `footer`
- [ ] Shared external CSS file, no inline styles
- [ ] Meaningful class names, helpful comments, consistent formatting (Prettier)
- [ ] Alt text on all images, readable contrast in both themes
- [ ] Shared JS file for interactive features (`js/script.js`, plus per-page modules)
- [ ] Commit to GitHub at the end of every step
- [ ] Prompt log for ≥ 3 significant features (Feature, LLM used, Your prompt, What it produced, Your decision) — `PROMPT_LOG.md`
- [ ] Test report covering the six testing items — `TEST_REPORT.md`
- [ ] Reflection (rubric: AI workflow & reflection)
- [ ] Submit: GitHub repo link, (optional) GitHub Pages link, prompt log, test report

## Pages & features
| Page / route | Sections / components | Interactions |
|---|---|---|
| `index.html` Home | `#hero`, `#tools` (sideways scroll-snap gallery), `#about` | gallery cards rendered from `TOOLS`; theme toggle |
| `plotter.html` | `#plot-controls` (mode, expression list, window), `#plot-area` | add/remove functions, 2D ↔ 3D, live redraw, rotate/zoom (Plotly) |
| `scanner.html` | `#scan-input` (file/camera, preview), `#scan-output` | OCR with progress, copy, download .txt, send to LaTeX |
| `matrix.html` | `#matrix-input`, `#matrix-output` (result + steps) | RREF with row-op steps, det, inverse, eigenvalues, transpose |
| `latex.html` | `#latex-editor`, `#latex-preview-section` | live KaTeX preview, load last scan, download .tex |
| `hub.html` | `#hub-intro`, `#hub-filters`, `#hub-tools` | filter All/Live/Planned |
| all pages | shared header/nav/footer | mobile menu toggle, current-page highlight, dark/light (saved) |

## Plan
Milestones follow the spec's steps; commit after each.
1. **Step 1–3 (content & plan):** pick the theme (you'll send it), write text for Home/About/Hub, gather ≥ 2 images into `images/`, fill the summaries in `js/tools.js`. Commit.
2. **Step 2.4 warm-up:** ask your LLM the warm-up question; note it in `PROMPT_LOG.md`.
3. **Step 4 (Home structure):** fill `#hero` / `#about` text, replace placeholder alt text. Commit.
4. **Step 4b (gallery):** `renderToolGallery()` in `script.js` builds cards from `TOOLS`. Commit.
5. **Step 5 (nav + pages):** `markActiveNav()`, `toggleNav()`; click every link on every page. Commit.
6. **Step 6–7 (CSS + theme):** design tokens from your theme, nav bar, buttons, hero, gallery cards, tool layouts; `applyTheme` / `toggleTheme` / `initTheme`. Check 375 px. Commit.
7. **Plotter:** (a) `sample2D`, (b) `sampleSurface` (tests pass), (c) add/remove rows, (d) `readWindow`, `compileExpression`, (e) `redraw` 2D then 3D, (f) debounce. Commit.
8. **Matrix Lab:** (a) `parseMatrix`, (b) `rref` with steps, (c) `formatNumber` (tests pass), (d) `matrixTable`, (e) `compute` for each op. Commit.
9. **Scanner:** (a) `cleanOcrText` (test), (b) preview, (c) `scan` + progress, (d) copy/download. Commit.
10. **LaTeX:** (a) `toLatexDocument` (test), (b) live preview, (c) scanner → LaTeX handoff, (d) download .tex. Commit.
11. **Hub:** (a) `filterTools` (test), (b) `renderHub`, (c) filter buttons. Commit.
12. **Step 8 (test & debug):** run every item in `TEST_REPORT.md`; fix; re-test. Commit.
13. **Step 9 (submit):** GitHub Pages deploy, finish prompt log + reflection, final push, submit links.

## Files
| File | Purpose |
|---|---|
| `index.html` | Home: hero, scrolling tool gallery, about |
| `plotter.html` / `js/plotter.js` | 2D/3D function plotter (math.js + Plotly) |
| `scanner.html` / `js/scanner.js` | Notes scanner (Tesseract.js) |
| `matrix.html` / `js/matrix.js` | Matrix Lab (own RREF + math.js) |
| `latex.html` / `js/latex.js` | LaTeX scratchpad (KaTeX) |
| `hub.html` / `js/hub.js` | Hub: all tools and planned services, filterable |
| `css/style.css` | The one shared stylesheet; theme tokens in `:root` |
| `js/script.js` | Shared script: theme, mobile nav, active link, home gallery |
| `js/tools.js` | Tool registry (single source for gallery + hub) |
| `js/utils.js` | Pure logic, unit tested |
| `tests/utils.test.js` | `npm test` (node:test) |
| `images/` | Placeholder SVGs; replace with your images |
| `PROMPT_LOG.md`, `TEST_REPORT.md`, `README.md` | Submission documents |

## Key concepts
- **Sampling a function:** a plot is just f evaluated on a grid; asymptotes show as huge jumps, so non-finite values become gaps (`null`).
- **Surfaces:** z = f(x, y) on an n × n grid; cost grows as n², so 3D uses fewer points per axis than 2D.
- **Gauss–Jordan elimination:** row swap, scale, replace; partial pivoting (largest |pivot|) reduces round-off; snap tiny values to 0.
- **OCR:** Tesseract recognizes printed glyphs line by line; handwriting and math notation need cleanup (or an AI model later).
- **XSS safety:** OCR text and LaTeX source are user input: put them in the page with `textContent`, never `innerHTML`.
- **ES modules:** each page loads `script.js` + its own module; CDN libraries are classic scripts that define globals (`math`, `Plotly`, `Tesseract`, `renderMathInElement`).
- **Progressive enhancement:** the home gallery has static fallback cards so the page still works if JS fails.

## Testing
- `npm test`: sampling (spacing, asymptotes, bad input), parseMatrix (fractions, ragged rows), rref (invertible, singular, augmented system), formatNumber, cleanOcrText, toLatexDocument, filterTools, registry sanity.
- Spec items (record in `TEST_REPORT.md`): nav on every page, images + alt, every JS feature in every state, 375 px + desktop, console clean, no 404s in Network.
- Edge cases: plotter with `1/x`, `tan(x)`, `sqrt(x)` (negative domain), bad syntax `sin(`; matrix non-square for det/inv, singular inverse, complex eigenvalues (`[[0,-1],[1,0]]`); scanner with no file, a huge photo, non-image; LaTeX with bad math `$\frac{$`; theme persists across pages and reloads; private window (localStorage blocked).

## Questions / ambiguities
- Due date isn't in the spec images.
- Does "at least two images" accept generated/diagram images (e.g. plot screenshots you made)? They are your own, so likely yes.
- Are CDN libraries (math.js, Plotly, Tesseract, KaTeX) fine, given the spec asks for "a shared JavaScript file"? `js/script.js` is still that shared file.
