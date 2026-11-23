# Christopia: Personal Interest Website with an LLM — CS235
**Due:** not stated  ·  **Type:** Web (static HTML/CSS/JS + CDN libraries)  ·  **Points:** 100 (5 criteria × 20)
See [DIAGRAM.md](DIAGRAM.md) for diagrams, [REDESIGN_PLAN.md](REDESIGN_PLAN.md) for the indie-web redesign, spec images in [assignment/](assignment/). Live: https://chrismedkit.github.io/cs235-christopia/

## Summary
Build a multi-page website on a topic you care about, using an LLM as a development partner, and document that use. Christopia is an indie-web home on the internet for an applied math + CS major and their friends: a splash page with a door, a Home portal, a **Tools** desktop (Math folder: plotter, Matrix Lab, LaTeX, notes scanner; CS folder: sorting, data structures, graphs & pathfinding, Big-O, regex builder), **Social** (forum, events, encrypted journal, friends + guestbook), **Me** (a desk of links and about windows) and a **Lab** for planned things (home server, smart home). Everything sits in Windows 98-style windows (98.css) with maximalist extras around them. Graded on content, design/CSS, the JS features, code quality, and the prompt log + reflection.

## Direction & class methods
- **Vision:** a growing personal hub and a "union" for web wanderers and real-life friends, in the Neocities / indie-web tradition: hand-made images, one personality per page, buttons, a guestbook, updates. *Simpler is better* for the content (plain windows), maximalist around it (collage, stickers, GIFs).
- **One place to add things:** `js/tools.js` (tools: they appear on the Tools desktop, Home gallery and Start menu by themselves; `planned` ones become services on Home's control panel), `js/stickers.js` (stickers), `js/friends.js` (friends). See README.
- **Pages (19):** Splash, Home, Tools, Me, Lab at the root; `math/` Plotter, Matrix Lab, LaTeX, Scanner; `cs/` Sorting, Data Structures, Graphs, Big-O, Regex; `social/` index + Forum, Events, Journal, Friends. Top nav: Home, Tools, Social, Me, Lab; Math/CS pages have a 98 address bar, Social pages a sub-nav; the current page is marked with `aria-current`.
- **Social data:** saved in each visitor's browser (localStorage) behind `js/storage.js`, so it runs on GitHub Pages; swapping that one module for the home server later makes the guestbook, forum and events shared.
- **Journal security:** real encryption, not a hidden page: PBKDF2-SHA256 (600k iterations) turns the password into an AES-GCM-256 key; pages are stored encrypted; the password and key are never stored; auto-lock after 10 min. Forgotten password = unrecoverable journal.
- **Scanner:** in-browser OCR with Tesseract.js (images never leave the device). Weak on messy handwriting and math symbols; an AI backend on the home server is a later milestone.
- **Libraries (pinned CDN):** 98.css (windows), math.js + Plotly.js (plotter, Big-O charts), KaTeX (LaTeX, journal math), Tesseract.js (scanner).
- **Process:** small steps, one commit each; every significant prompt goes in `PROMPT_LOG.md` as it happens.
- **In-class methods & notation:** the spec's structure (`css/style.css`, `js/script.js`, `images/`), semantic landmarks, one shared stylesheet, one shared script; pure logic in `js/utils.js`, `js/cs-lib.js`, `js/social-lib.js`, `js/storage.js`, unit-tested with `node --test` (no installs).
- **Constraints:** own or permitted images only (credit others); no copied text; alt text on every image; no inline styles; no console errors; works at 375 px.

## Requirements
- [ ] At least three pages (19)
- [ ] Identical navigation menu on every page linking all pages
- [ ] At least two images, own or permitted (replace the `images/*.svg` placeholders and add your photos)
- [ ] Consistent visual design: shared colors, fonts, layout (98.css + `css/style.css` tokens)
- [ ] At least one JS interactive feature (many: galleries, menus, Start menu, Tools desktop, Services panel, every tool)
- [ ] Responsive on desktop and phone
- [ ] Semantic HTML: `header`, `nav`, `main`, `section`, `footer`
- [ ] Shared external CSS file, no inline styles
- [ ] Meaningful class names, helpful comments, consistent formatting (Prettier)
- [ ] Alt text on all images, readable contrast
- [ ] Shared JS file for interactive features (`js/script.js`, plus per-page modules)
- [ ] Commit to GitHub at the end of every step
- [ ] Prompt log for ≥ 3 significant features (Feature, LLM used, Your prompt, What it produced, Your decision) — `PROMPT_LOG.md`
- [ ] Test report covering the six testing items — `TEST_REPORT.md`
- [ ] Reflection (rubric: AI workflow & reflection)
- [ ] Submit: GitHub repo link, GitHub Pages link, prompt log, test report

## Pages & features
| Page | Windows / parts | Interactions | Status |
|---|---|---|---|
| `index.html` Splash | CSS chrome `h1`, subtitle, CD-ROM autorun link to Home | title floats and shines; the CD spins, faster on hover/focus (both off with reduced motion) | ✅ |
| `home.html` Home | chrome title + tagline; portal: Launch pad \| welcome.txt + All tools gallery \| Services control panel | gallery cards and services (planned entries + empty bays) from `TOOLS`; 3 columns ≥ 1000 px | ✅ |
| `tools.html` Tools | Math and CS folder windows: icon grids + status bars | icons from `TOOLS`; drag windows by the title bar (wide mouse screens, positions saved); click brings to front; `#math` / `#cs`; stacked on phones | ✅ |
| `me.html` Me | the whole page is a desk: brass nameplate, about.txt and favorites.txt as sticky notes, objects (calculator → Tools, notebook → Journal, phone → Social, headphones → Spotify, floppy → Services, photo → About) | objects lift + labels on hover/focus (always on touch); notes \| objects \| notes ≥ 1100 px, stacked on phones | ✅ |
| `math/plotter.html` | controls (mode, expression list, window), graph | add/remove functions, 2D ↔ 3D, live redraw (Plotly) | ✅ |
| `math/matrix.html` | input, result + steps | RREF with row-op steps, det, inverse, eigenvalues, transpose | ✅ |
| `math/latex.html` | editor, preview | live KaTeX preview, load last scan, download .tex | ✅ |
| `math/scanner.html` | upload/camera + preview, typed text | OCR with progress, copy, download, send to LaTeX | ✅ |
| `cs/sorting.html` | controls + stats, bars + pseudocode | 6 algorithms, step / play / pause / reset, counters, highlighted line | ✅ |
| `cs/data-structures.html` | structure, value, ops, log; SVG stage | stack, queue, linked list, BST, min-heap, hash table; path highlighting | ✅ |
| `cs/graphs.html` | algorithm, draw tool, speed, stats; grid | draw walls/weights, move start/end, BFS/DFS/Dijkstra/A*, random maze | ✅ |
| `cs/big-o.html` | growth curves, benchmark form + table; charts | toggle curves, log/linear, time real algorithms, fit a complexity class | ✅ |
| `cs/regex.html` | pattern + flags, presets, blocks, explanation; test, matches, replace | click-to-insert tokens, live matches, replace preview, copy as JS, 1 s runaway guard | ✅ |
| `social/index.html` | intro, Social gallery | cards from `TOOLS` | ✅ |
| `social/forum.html` | board (filter, sort, search, threads, new thread), thread view | post threads/replies, vote | ✅ |
| `social/events.html` | new event form, upcoming/past | RSVP with capacity, .ics download | ✅ |
| `social/journal.html` | lock screen; sidebar + block editor | encrypted vault, nested pages, `/` menu, Markdown shortcuts, KaTeX math, auto-lock | ✅ |
| `social/friends.html` | Friends (buttons wall, links, neighbors), link_to_me.txt, guestbook.exe | friends from `js/friends.js`; copy button HTML; sign the guestbook (validated, text-only, http(s) links only) | ✅ |
| every page | header (logo, nav), ticker, footer (hit counter, badges), taskbar | mobile Menu; Start menu (sitemap tree, Random page, Sound); task button + clock; Esc / click-outside closes menus; sparkles; stickers | ✅ |

## Design
- **Mood:** Windows 98 web desktop meets Neocities, in frosted glass and sky blue. Every section is a [98.css](https://jdan.github.io/98.css/) window (title bar + body) with a hard drop shadow, but the window face is translucent glass (`--glass` + `backdrop-filter` blur), title bars are a glossy ocean-blue gradient (`--title-bar`) and buttons have an Aqua-style gloss (`--gloss`). The page sits on a bubbly sky gradient (`--sky`) or your collage; the taskbar and Start menu sit at the bottom. Light theme only: 98.css hard-codes its colors, and dark mode was dropped by choice. Text on blue stays at 4.5:1 contrast or better.
- **Typography:** 98.css's 11 px pixel font for window chrome, buttons, labels and menus; M PLUS Rounded 1c (Google Fonts) for paragraphs; monospace for code. Page titles are title bars at 2× pixel size (22 px) with the tool's icon and a `.exe` program name (hidden from screen readers). Rocket Pop for the logo and the chrome title, Rocket Pop Italic for headings inside windows, Digit Lo-Fi for the hit counter and ticker, Minecraft for the splash text (self-hosted in `fonts/`; see README for licenses).
- **Chrome title:** CSS only: chrome gradient clipped to the text, a sweeping shine, a navy 3D edge from stacked `drop-shadow` filters, a slow float.
- **Backgrounds:** splash, Home, Tools, CS and Social (Me is a wood desk) show your collage once exported to `images/bg-collage.jpg` (sky until then). Math pages show the Real Analysis portfolio (8 pages tiled, rotated −30°, 9% opacity) on plain paper.
- **Panels:** work areas (sorting bars, structure canvas, graph grid, regex highlight, charts, forum/event cards, guestbook entries) are white sunken 98 panels; selections are ocean blue (`--select`); charts use a white plot and the 16-color VGA palette.
- **Maximalist extras:** splash text on the big title of the splash page and Home (random phrase), news ticker, sparkle cursor trail, synthesized menu blips (off by default; Sound in the Start menu), hit counter, 88×31 badges, stickers (behind or in front of windows; `js/stickers.js`), the Me desk. All motion stops under `prefers-reduced-motion`; animated stickers swap to a still copy.
- **Breakpoints:** mobile first. 600 px: the Me desk becomes a grid below it. 768 px: inline nav, two-column tool pages. 900 px + mouse: draggable Tools windows. 1000 px: three-column Home portal.

## Plan
Done (one commit each, see `PROMPT_LOG.md`):
- ✅ Site shell: shared header/nav, tool registry, galleries (`renderToolGallery`), mobile Menu, Home's Services panel (`filterTools`, `renderServices`).
- ✅ CS tools: sorting, data structures, graphs & pathfinding, Big-O playground, regex builder (all in `js/cs-lib.js` with tests).
- ✅ Math tools: function plotter (2D + 3D, asymptote breaks), Matrix Lab (RREF with steps, det, inverse, eigenvalues, transpose), Notes Scanner (Tesseract OCR), LaTeX scratchpad (KaTeX preview, scan handoff, .tex download); logic in `js/utils.js` with tests.
- ✅ Social tools: forum (categories, sort, search, replies, one vote per browser), events (RSVP with capacity, past events, .ics download), private journal (PBKDF2 + AES-GCM vault, auto-lock, nested pages, favorites, trash, search, block editor with `/` menu and Markdown shortcuts, KaTeX math); logic in `js/social-lib.js` with tests.
- ✅ Indie-web redesign steps 1–8 (`REDESIGN_PLAN.md`): 98.css windows, taskbar + Start menu, Tools desktop, splash + Home portal, sticker layer, Me page, Friends + guestbook (with `storage.js`, `validatePost`, `relativeTime`), tool page polish.

Still to do:
1. **Your content:** desk photos, the welcome-image and portrait alt text, friends in `js/friends.js`, your collage (`images/bg-collage.jpg`), real images replacing `images/*.svg` placeholders and their alt text (checklist: `ART_LIST.md`), a favicon. Commit.
2. **Warm-up (spec step 2.4):** ask your LLM the warm-up question; note it in `PROMPT_LOG.md`.
3. **Redesign step 10 / spec step 8:** run every item in `TEST_REPORT.md`; fix; re-test. Commit.
4. **Spec step 9 (submit):** finish prompt log "Your decision" rows + reflection, final push, submit the repo and live links.

## Files
| File | Purpose |
|---|---|
| `index.html` | Splash page (title + CD-ROM autorun button) |
| `home.html` | Home portal |
| `tools.html` / `js/desktop.js` | Tools desktop: folder windows, icons from `tools.js`, dragging |
| `me.html`, `images/me/` | Me page: desk of links (drawings to swap for your photos), about, favorites |
| `math/*.html` / `js/plotter.js`, `matrix.js`, `latex.js`, `scanner.js` | Math tools |
| `cs/sorting.html` / `js/sorting.js` | Sorting visualizer |
| `cs/data-structures.html` / `js/structures.js` | Data structure visualizer (SVG) |
| `cs/graphs.html` / `js/graphs.js` | Grid pathfinding |
| `cs/big-o.html` / `js/bigo.js` | Growth curves + benchmark (Plotly) |
| `cs/regex.html` / `js/regex.js`, `js/regex-worker.js` | Regex builder (matching in a worker with a 1 s limit) |
| `social/index.html` | Social overview |
| `social/forum.html`, `events.html`, `journal.html` / `js/forum.js`, `events.js`, `journal.js` | Social tools |
| `social/friends.html` / `js/friends-page.js` | Friends wall, button code, guestbook |
| `css/style.css` | The one shared stylesheet (loads after 98.css): tokens, `@font-face`, layout, tool visuals |
| `js/script.js` | Shared script: taskbar + Start menu, menus, galleries, stickers, splash text, sparkles, sounds, hit counter |
| `js/tools.js` | Tool registry (data) |
| `js/stickers.js` | Sticker list (data) |
| `js/friends.js` | Friends and neighbors (data) |
| `js/utils.js`, `js/cs-lib.js`, `js/social-lib.js`, `js/storage.js` | Pure logic (math, CS, social, saving), unit tested |
| `tests/*.test.js` | `npm test` (node:test) |
| `fonts/` | Rocket Pop, Rocket Pop Italic, Digit Lo-Fi, Minecraft |
| `images/` | Card placeholders, `icons/` (desktop + folder), `stickers/`, `me/`, `badges/`, `buttons/`, `gifs/`, `blinkies/`, `stamps/`, Real Analysis mosaic |
| `REDESIGN_PLAN.md`, `PROMPT_LOG.md`, `TEST_REPORT.md`, `README.md` | Plan and submission documents |

## Key concepts
- **Sampling a function:** a plot is f evaluated on a grid; asymptotes show as huge jumps, so non-finite values become gaps (`null`).
- **Gauss–Jordan elimination:** row swap, scale, replace; partial pivoting reduces round-off; snap tiny values to 0.
- **Recording steps, then animating:** each visualizer computes the full list of steps first (pure, testable), and the page only replays them.
- **Dijkstra vs A\*:** both use a priority queue on cost so far; A\* adds an admissible heuristic (Manhattan distance), so it explores fewer cells for the same optimal path.
- **Fitting complexity:** for each class f, pick c in t ≈ c·f(n) to minimize the relative error; the smallest error wins. Repeat timings, take medians, warm up the JIT, and use a wide range of n.
- **Catastrophic backtracking:** nested quantifiers like `(a+)+$` take exponential time; a regex can't be interrupted, so matching runs in a Web Worker that is terminated after 1 s.
- **Client-side encryption:** PBKDF2 makes guessing slow; AES-GCM hides and authenticates the data; IVs never repeat for one key.
- **XSS safety:** anything a visitor types (guestbook, forum, OCR text, LaTeX source) goes into the page with `textContent`, never `innerHTML`; only `http(s)` URLs become links.
- **Stacking contexts:** `z-index` only compares elements in the same stacking context; page content sits at 1, between the sticker layers (0 and 5), under the header (10) and taskbar (40). `pointer-events: none` lets clicks fall through decoration.
- **Progressive enhancement:** galleries and desktop icons have static fallbacks; dragging, sounds and stickers are extras the page works without.

## Testing
- `npm test`: math helpers (sampling, `parseMatrix`, `rref`, `formatNumber`, `cleanOcrText`, `toLatexDocument`, `filterTools`); `cs-lib` (every sort replays to sorted, BST/heap/hash, BFS/DFS/Dijkstra/A* on random grids, mazes, complexity fit, regex explain/match/escape, presets); `social-lib` (validation, thread sorting, relative time, RSVPs, .ics, encryption, Markdown shortcuts, page tree, search); `storage` (round trip, fallbacks, full storage); registry and sticker files exist.
- Spec items (record in `TEST_REPORT.md`): nav on every page, images + alt, every JS feature in every state, 375 px + desktop, console clean, no 404s in Network.
- Edge cases: plotter `1/x`, `tan(x)`, `sqrt(x)`, `sin(`; matrix non-square, singular, complex eigenvalues; scanner no file / huge photo; LaTeX `$\frac{$`; private window (storage blocked: guestbook says "Not saved"); regex `(a+)+$` on a long string; sorting 120 bars at max speed; Tools windows dragged to the edges; stickers at 375 px; journal wrong password and reload while unlocked.

## Questions / ambiguities
- Due date isn't in the spec images.
- Does "at least two images" accept your own drawings and photos of your things? They are your own, so likely yes.
- CDN libraries (98.css, math.js, Plotly, Tesseract, KaTeX) alongside the required shared `js/script.js` and `css/style.css`: worth a quick check with the instructor.
