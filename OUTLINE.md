# Christopia: Personal Interest Website with an LLM — CS235
**Due:** not stated  ·  **Type:** Web (static HTML/CSS/JS + CDN libraries)  ·  **Points:** 100 (5 criteria × 20)
See [DIAGRAM.md](DIAGRAM.md) for diagrams. Spec images: [assignment/](assignment/).

## Summary
Build a multi-page website on a topic you care about, using an LLM as a development partner, and document that use. Christopia is a hub of study tools for an applied math + CS major: a home page with a scrolling gallery of tools and three sections, each with an overview page and sub-pages: **Math** (2D/3D plotter, Matrix Lab, LaTeX scratchpad, notes scanner), **CS** (sorting, data structures, graphs & pathfinding, Big-O, regex builder) and **Social** (forum, event RSVPs, password-locked Notion-style journal), plus a Hub page for planned tools (home server, smart home, ...). Graded on content, design/CSS, the JS features, code quality, and the prompt log + reflection.

## Direction & class methods
- **Vision:** Christopia as a growing personal tool hub, not a one-off assignment. Every tool lives in one registry (`js/tools.js`) so adding a tool = one entry + one page in its section folder + one sub-nav link. Theme: see *Design* below; all colors/fonts are tokens in `:root` so a re-theme touches one block.
- **Pages (17):** Home, Hub; `math/` index + Plotter, Matrix Lab, LaTeX, Scanner; `cs/` index + Sorting, Data Structures, Graphs, Big-O, Regex; `social/` index + Forum, Events, Journal. Top nav = Home, Math, CS, Social, Hub; each section page also has a sub-nav bar. The current page is marked with `aria-current` in the HTML.
- **Social data:** saved in this browser (localStorage) behind `js/storage.js` (async `load`/`save`), so it runs on GitHub Pages now; swap that module for the home server later without touching the pages. Only you see your own posts until then.
- **Journal security:** real encryption, not a hidden page: PBKDF2-SHA256 (600k iterations) turns the password into an AES-GCM-256 key; pages are stored encrypted; the password and key are never stored; auto-lock after 10 min. Forgotten password = unrecoverable journal.
- **Scanner:** static, in-browser OCR with Tesseract.js (works on GitHub Pages; images never leave the device). Weak on messy handwriting and math symbols; an AI backend on the home server is a later milestone, not part of this build.
- **Plotter libraries:** math.js (parse/evaluate expressions) + Plotly.js (2D lines, 3D surfaces). KaTeX for the LaTeX page. All pinned on a CDN.
- **Process:** the spec's Steps 4–9 in order, one milestone at a time, commit at the end of each step, detailed TODOs. Log every significant prompt in `PROMPT_LOG.md` as you go.
- **In-class methods & notation:** the spec's suggested structure (`css/style.css`, `js/script.js`, `images/`), semantic landmarks, one shared stylesheet, one shared script. Pure logic is split into `js/utils.js` so it can be unit-tested with `node --test` (no installs).
- **Constraints:** own or permitted images only; no copied text; alt text on every image; no console errors; works at 375 px.

## Requirements
- [ ] At least three pages (17: Home, Hub, 3 section overviews, 12 tool pages)
- [ ] Identical navigation menu on every page linking all pages
- [ ] At least two images, own or permitted (replace the `images/*.svg` placeholders)
- [ ] Consistent visual design: shared colors, fonts, layout (`css/style.css` tokens)
- [ ] At least one JS interactive feature (we have many: gallery, dark/light toggle, every tool page)
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
| `index.html` Home | `#hero`, `#sections` (Math/CS/Social/Hub tiles), `#tools` (sideways scroll-snap gallery), `#about` | gallery cards rendered from `TOOLS`; theme toggle |
| `math/`, `cs/`, `social/` `index.html` | `#section-intro`, `#section-tools` (gallery filtered by `data-section`) | same gallery code, one section |
| `math/plotter.html` | `#plot-controls` (mode, expression list, window), `#plot-area` | add/remove functions, 2D ↔ 3D, live redraw, rotate/zoom (Plotly) |
| `math/matrix.html` | `#matrix-input`, `#matrix-output` (result + steps) | RREF with row-op steps, det, inverse, eigenvalues, transpose |
| `math/latex.html` | `#latex-editor`, `#latex-preview-section` | live KaTeX preview, load last scan, download .tex |
| `math/scanner.html` | `#scan-input` (file/camera, preview), `#scan-output` | OCR with progress, copy, download .txt, send to LaTeX |
| `cs/sorting.html` | `#sort-controls` (algorithm, size, speed, stats), `#sort-stage` (bars, pseudocode) | step / play / reset; 6 algorithms; highlighted pseudocode line |
| `cs/data-structures.html` | `#ds-controls` (structure, value, ops, log), `#ds-stage` (SVG) | stack, queue, linked list, BST, min-heap, hash table: insert/remove/search animated |
| `cs/graphs.html` | `#graph-controls` (algorithm, draw tool, speed, stats), `#graph-stage` (grid, legend) | draw walls/weights, move start/end, BFS/DFS/Dijkstra/A*, random maze |
| `cs/big-o.html` | `#bigo-controls` (curves, n, benchmark form, results table), `#bigo-stage` (Plotly) | toggle growth curves; time real algorithms and fit a complexity class |
| `cs/regex.html` | `#regex-builder` (pattern + flags, presets, building blocks, explanation), `#regex-test` (string, highlight, matches, replace) | click-to-insert tokens, live explanation + matches, replace preview, copy as JS |
| `social/forum.html` | `#forum-board` (filter, sort, search, thread list, new thread), `#thread-view` | post threads/replies, vote, filter/sort/search |
| `social/events.html` | `#event-create` (form), `#event-list-section` (your name, upcoming, past) | create events, RSVP Going/Maybe/Can't (capacity), download .ics |
| `social/journal.html` | `#journal-lock` (setup / unlock), `#journal-app` (sidebar: search, favorites, page tree, trash; editor: breadcrumb, icon, title, blocks, slash menu) | encrypted vault; nested pages; `/` block menu; Markdown shortcuts; to-dos, toggles, callouts, code, KaTeX math; autosave; auto-lock |
| `hub.html` | `#hub-intro`, `#hub-filters`, `#hub-tools` | filter All/Live/Planned |
| all pages | shared header/nav/ticker/sub-nav/footer | mobile menu toggle, dark/light (saved), sound, splash, sparkles, hit counter |

## Design
- **Mood:** 2000s/2010s Nintendo era + early internet, modernized: glossy console-menu UI (white rounded tiles, aqua glow, pill buttons with a top shine), rounded body font (M PLUS Rounded 1c, Google Fonts). Original artwork only in the UI: no Nintendo logos, characters or sounds.
- **Fonts** (self-hosted in `fonts/`): Rocket Pop for the logo and page titles (`h1`), Rocket Pop Italic for section headings (`h2`), Digit Lo-Fi for the hit counter and ticker (all from the cufonfonts Y2K collection, free for personal use; Digit Lo-Fi lists no license), Minecraft (Craftron Gaming, dafont, 100% free) for the splash text. Body text, buttons, forms and stat numbers stay in readable fonts.
- **Backgrounds:** Home, Hub, CS and Social pages show your maximalist MLG-style collage (export the PSD to `images/bg-collage.jpg`, see README *Background*; sky-and-bubbles gradient until then). Every Math page (overview, Plotter, Matrix Lab, LaTeX, Scanner) shows the Real Analysis portfolio (8 pages tiled, rotated −30°, 9% opacity, `images/real-analysis-bg.png`).
- **Readability:** every section is a frosted-glass panel (translucent + backdrop blur).
- **Extras:** splash text by the logo (random short phrase, pulsing), news ticker under the header (pauses on hover), sparkle cursor trail, synthesized menu blips (muted by default, Sound toggle remembered), retro hit counter (this browser only) and 88×31 badges in the footer. All animation stops under `prefers-reduced-motion`.
- **Dark mode:** night version of the same tokens; math mosaic ink inverts.
- **Breakpoints:** mobile first; 768 px puts nav inline and tool pages into two columns.

## Plan
Milestones follow the spec's steps; commit after each.
1. **Step 1–3 (content & plan):** pick the theme (you'll send it), write text for Home/About/Hub, gather ≥ 2 images into `images/`, fill the summaries in `js/tools.js`. Commit.
2. **Step 2.4 warm-up:** ask your LLM the warm-up question; note it in `PROMPT_LOG.md`.
3. **Step 4 (Home structure):** fill `#hero` / `#about` text, replace placeholder alt text. Commit.
4. **Step 4b (gallery):** `renderToolGallery()` in `script.js` builds cards from `TOOLS`. Commit.
5. **Step 5 (nav + pages):** `toggleNav()` (mobile Menu); click every link, top nav and sub-nav, on every page. Commit.
6. **Step 6–7 (CSS + theme):** design tokens from your theme, nav bar, buttons, hero, gallery cards, tool layouts; `applyTheme` / `toggleTheme` / `initTheme`. Check 375 px. Commit.
7. **Plotter:** (a) `sample2D`, (b) `sampleSurface` (tests pass), (c) add/remove rows, (d) `readWindow`, `compileExpression`, (e) `redraw` 2D then 3D, (f) debounce. Commit.
8. **Matrix Lab:** (a) `parseMatrix`, (b) `rref` with steps, (c) `formatNumber` (tests pass), (d) `matrixTable`, (e) `compute` for each op. Commit.
9. **Scanner:** (a) `cleanOcrText` (test), (b) preview, (c) `scan` + progress, (d) copy/download. Commit.
10. **LaTeX:** (a) `toLatexDocument` (test), (b) live preview, (c) scanner → LaTeX handoff, (d) download .tex. Commit.
11. **Hub:** (a) `filterTools` (test), (b) `renderHub`, (c) filter buttons. Commit.
12. **CS** (`js/cs-lib.js` + tests, then page scripts):
    1. Sorting: `sortSteps` + `applyStep` + `PSEUDOCODE` (tests), then bars, pseudocode, step/play in `sorting.js`.
    2. Data structures: `bstInsert/Delete/Search`, `treeLayout`, `heapPush/Pop`, `hashIndex` (tests), then `renderOps`, `run`, `draw` in `structures.js`.
    3. Graphs: `gridSearch`, `generateMaze` (tests), then `buildGrid`, `paint`, `run`, `clearPath` in `graphs.js`.
    4. Big-O: `fitComplexity` (test), then `drawCurves`, `benchmark`, `showResults` in `bigo.js`.
    5. Regex: `explainRegex`, `findMatches`, `escapeRegex` (tests), then `insertToken`, `update`, `renderHighlight`, `copyAsJs` in `regex.js`.
13. **Social** (`js/storage.js`, `js/social-lib.js` + tests, then page scripts):
    1. Forum: `load`/`save`, `validatePost`, `sortThreads`, `relativeTime`, then `forum.js`.
    2. Events: `rsvpSummary`, `setRsvp`, `splitEvents`, `toICS`, then `events.js`.
    3. Journal vault: `deriveKey`, `encryptJSON`, `decryptJSON` (tests), then setup / unlock / lock / persist / auto-lock in `journal.js`.
    4. Journal editor: `markdownShortcut`, `buildPageTree`, `searchPages`, then sidebar, blocks, slash menu, keyboard in `journal.js`.
14. **Step 8 (test & debug):** run every item in `TEST_REPORT.md`; fix; re-test. Commit.
15. **Step 9 (submit):** GitHub Pages deploy, finish prompt log + reflection, final push, submit links.

## Files
| File | Purpose |
|---|---|
| `index.html` | Home: hero, section tiles, scrolling tool gallery, about |
| `math/`, `cs/`, `social/` `index.html` | Section overviews (tool cards) |
| `math/plotter.html` / `js/plotter.js` | 2D/3D function plotter (math.js + Plotly) |
| `math/matrix.html` / `js/matrix.js` | Matrix Lab (own RREF + math.js) |
| `math/latex.html` / `js/latex.js` | LaTeX scratchpad (KaTeX) |
| `math/scanner.html` / `js/scanner.js` | Notes scanner (Tesseract.js) |
| `cs/sorting.html` / `js/sorting.js` | Sorting visualizer |
| `cs/data-structures.html` / `js/structures.js` | Data structure visualizer (SVG) |
| `cs/graphs.html` / `js/graphs.js` | Grid pathfinding |
| `cs/big-o.html` / `js/bigo.js` | Growth curves + benchmark (Plotly) |
| `cs/regex.html` / `js/regex.js` | Regex builder and tester |
| `social/forum.html` / `js/forum.js` | Forum |
| `social/events.html` / `js/events.js` | Events + RSVP + .ics |
| `social/journal.html` / `js/journal.js` | Encrypted Notion-style journal (KaTeX for math blocks) |
| `hub.html` / `js/hub.js` | Hub: all tools and planned services, filterable |
| `css/style.css` | The one shared stylesheet; theme tokens + `@font-face` |
| `fonts/` | Rocket Pop, Rocket Pop Italic, Digit Lo-Fi, Minecraft |
| `js/script.js` | Shared script: theme, mobile nav, galleries, splash, sparkles, sounds, hit counter |
| `js/tools.js` | Tool registry (single source for galleries + hub) |
| `js/utils.js`, `js/cs-lib.js`, `js/social-lib.js` | Pure logic (math, CS, social), unit tested |
| `js/storage.js` | Load/save for Social pages (localStorage now, server later) |
| `tests/*.test.js` | `npm test` (node:test) |
| `images/` | Placeholder SVGs, badges, Real Analysis mosaic; your collage goes here |
| `PROMPT_LOG.md`, `TEST_REPORT.md`, `README.md` | Submission documents |

## Key concepts
- **Sampling a function:** a plot is just f evaluated on a grid; asymptotes show as huge jumps, so non-finite values become gaps (`null`).
- **Surfaces:** z = f(x, y) on an n × n grid; cost grows as n², so 3D uses fewer points per axis than 2D.
- **Gauss–Jordan elimination:** row swap, scale, replace; partial pivoting (largest |pivot|) reduces round-off; snap tiny values to 0.
- **OCR:** Tesseract recognizes printed glyphs line by line; handwriting and math notation need cleanup (or an AI model later).
- **XSS safety:** OCR text and LaTeX source are user input: put them in the page with `textContent`, never `innerHTML`.
- **ES modules:** each page loads `script.js` + its own module; CDN libraries are classic scripts that define globals (`math`, `Plotly`, `Tesseract`, `renderMathInElement`).
- **Recording steps, then animating:** each visualizer computes the full list of steps first (pure, testable), and the page only replays them; that's what makes Step/Play/Reset easy.
- **Dijkstra vs A\*:** both use a priority queue on cost so far; A\* adds an admissible heuristic (Manhattan distance on a 4-way grid), so it explores fewer cells for the same optimal path.
- **Fitting complexity:** for each class f, the best c in t ≈ c·f(n) is Σtf/Σf²; the class with the smallest relative error wins. Timings are noisy, so use medians and big enough n.
- **Client-side encryption:** PBKDF2 makes guessing passwords slow; AES-GCM both hides and authenticates the data (a wrong key fails instead of returning garbage); IVs must never repeat for one key.
- **Progressive enhancement:** the home gallery has static fallback cards so the page still works if JS fails.

## Testing
- `npm test`: sampling (spacing, asymptotes, bad input), parseMatrix (fractions, ragged rows), rref (invertible, singular, augmented system), formatNumber, cleanOcrText, toLatexDocument, filterTools, registry sanity; `cs-lib` (every sort replays to sorted, BST/heap/hash, BFS/Dijkstra/A* paths and costs, maze, complexity fit, regex explain/match/escape, presets); `social-lib` (post validation, thread sorting, relative time, RSVP capacity, event split, .ics, encryption round trip + wrong password, Markdown shortcuts, page tree, search).
- Spec items (record in `TEST_REPORT.md`): nav on every page, images + alt, every JS feature in every state, 375 px + desktop, console clean, no 404s in Network.
- Edge cases: plotter with `1/x`, `tan(x)`, `sqrt(x)` (negative domain), bad syntax `sin(`; matrix non-square for det/inv, singular inverse, complex eigenvalues (`[[0,-1],[1,0]]`); scanner with no file, a huge photo, non-image; LaTeX with bad math `$\frac{$`; theme persists across pages and reloads; private window (localStorage blocked); regex `(a+)+$` on a long string of a's (catastrophic backtracking); sorting with 120 bars at max speed; journal wrong password, reload while unlocked (must lock), very long page.

## Questions / ambiguities
- Due date isn't in the spec images.
- Is the site's size (17 pages) fine, or should the graded build be trimmed to the finished tools? Unfinished pages can be hidden from the nav before submitting.
- Does "at least two images" accept generated/diagram images (e.g. plot screenshots you made)? They are your own, so likely yes.
- Are CDN libraries (math.js, Plotly, Tesseract, KaTeX) fine, given the spec asks for "a shared JavaScript file"? `js/script.js` is still that shared file.
