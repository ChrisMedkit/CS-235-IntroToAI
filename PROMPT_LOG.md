# Prompt Log — Christopia

LLM(s) used: Claude Code (Claude Opus 5.5), chat-based agent in the Claude desktop app. TODO: add any other LLM you use.

Record at least three significant features (page structure, navigation, CSS, responsive layout, JS feature; debugging exchanges count).

## 0. Project scaffold
| Field | Entry |
|---|---|
| Feature | Folder structure, six page skeletons with a shared nav, outline, diagrams |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | `/assignment` "use the images from the cs235 llm website assignment this time to create a homework scanning website ... main page with a description of the tools and links to the tools on a scrolling gallery, a second page with 2d/3d function plotting tools similar to Desmos, a third page to scan in notes and receive a typed up version ... and finally a third page for you to decide what to do with. I want this website to be called christopia ..." Then answered: Tesseract.js scanner, all three extra pages (Matrix Lab, LaTeX, Hub), detailed TODOs, math.js + Plotly. |
| What it produced | `index/plotter/scanner/matrix/latex/hub.html` with identical header/nav/footer, `css/style.css` with theme tokens, `js/script.js` (shared), one module per tool, `js/tools.js` registry, `js/utils.js` stubs + `tests/utils.test.js`, `OUTLINE.md`, `DIAGRAM.md` |
| Your decision | TODO: what you kept or changed, and why |

## 0b. Theme and backgrounds (Step 6, early)
| Field | Entry |
|---|---|
| Feature | Site theme, collage + Real Analysis backgrounds, early-internet extras |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "2000's, Nintendo, Wii sports resort, Super Mario sunshine, early internet modernized, type of theme. I want to be able to have a background ... a photo shop file ... maximalist, MLG inspired 2000s/2010s collage ... For the math related pages I want the background to be my attached real analysis portfolio rotated diagonally and faded to just barely visible. Before executing, ask questions about the theme(s)". Answers: glossy console menu UI, frosted-glass panels, tiled portfolio pages, sparkle trail, hit counter + 88x31 badges, menu sounds, news ticker, plus a Minecraft-style splash text banner. |
| What it produced | Rewrote `css/style.css` (glossy tokens, pill buttons, channel-tile cards, frosted panels, dark mode, ticker/splash/sparkle styles); rendered the portfolio PDF pages to a transparent ink mosaic (`images/real-analysis-bg.png`); added splash, ticker, Sound toggle and badge footer to all 6 pages; `initSplash`, `initSparkles`, `initSounds` (Web Audio blips), `initHitCounter` in `js/script.js`; README steps to convert the PSD with `sips`. Checked in the browser at desktop and 375 px, light and dark, no console errors; fixed a header overlap, the hero grid, and a 26 px overflow on the Scanner page. |
| Your decision | TODO: what you kept or changed, and why |

## 0c. Fonts, sections, CS and Social pages
| Field | Entry |
|---|---|
| Feature | Y2K + Minecraft fonts; Math/CS/Social sections with sub-pages; CS visualizers; forum, events, private journal |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "use y2k fonts from this website around the website: (cufonfonts Y2K collection) For the minecraft banner use a minecraft font: (dafont) Group together the math tools into one main math page with subpages. Add a algorithm and data structure visualization page and group together these computer science pages similar to the math pages. I also want to add another page ... called "social" ... sub page for a forum/discussion, event rsvp page, and a password locked private journal page. Make this journal page similar to popular note taking app ..." Answers: Rocket Pop + Digit Lo-Fi; social data in this browser for now; Notion-style journal; CS pages = sorting, data structures, graphs, Big-O, plus a regex builder. |
| What it produced | Checked font licenses, downloaded Rocket Pop, Digit Lo-Fi and Minecraft into `fonts/` with `@font-face`; moved the math pages into `math/` and built `cs/` and `social/` (17 pages, top nav + sub-nav, `aria-current` in the HTML); page layouts and CSS for every new tool; `js/cs-lib.js`, `js/social-lib.js`, `js/storage.js` stubs with 44 tests; one stub script per page; updated outline, diagrams, README. Checked all pages: no broken links, labels on every input, no console errors, no sideways scroll at 375 px. Switched the stat numbers off Digit Lo-Fi after seeing it unreadable at small size. |
| Your decision | TODO: what you kept or changed, and why |

## 1. Dark/light toggle and mobile menu (Steps 5 and 7)
| Field | Entry |
|---|---|
| Feature | Dark/light mode toggle (the spec's JS feature), mobile Menu, and a bottom-of-screen Options menu holding Dark mode + Sound |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Implement the dark mode toggle and mobile menu. Have dark mode and the sound toggle be part of a different menu towards the bottom of the screen." |
| What it produced | `applyTheme`, `toggleTheme`, `initTheme` (saved choice in localStorage, else the OS `prefers-color-scheme`; storage errors caught); one `setExpanded`/`initMenus` pair drives both the Menu button and the new Options button through `aria-expanded`/`aria-controls`, with Esc and click-outside to close. Moved the two toggles out of the header on all 17 pages into a fixed bottom-right Options panel styled as on/off switches (label stays the same, `aria-pressed` carries the state). CSS: stacked full-width mobile nav, `color-scheme` per theme, lighter graph walls in dark mode. Tested in the browser: toggle on/off, saved across pages, Esc returns focus, phone width, no console errors. Debug: the stacked links stayed narrow because the shared pill rule came later with equal specificity; fixed with `#site-nav li a`. |
| Your decision | TODO: what you kept or changed, and why |

## 2. Tool gallery from the registry (Step 4b)
| Field | Entry |
|---|---|
| Feature | Home and section galleries rendered from `js/tools.js` |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "implement the tool gallery rendering from tools.js" |
| What it produced | `renderToolGallery()` in `js/script.js`: filters `TOOLS` to live tools (and to the list's `data-section` on Math/CS/Social), builds each card with `createElement` + `textContent` (no `innerHTML`), prefixes links and images with `body[data-root]` so the same code works from section folders, lazy-loads card images, and swaps the static fallback cards with `replaceChildren`. Checked in the browser: Home 12 cards, Math 4, CS 5, Social 3, every link and image returns 200, no console errors. Updated the "Add a tool" steps (static cards are now only a no-JS fallback). |
| Your decision | TODO: what you kept or changed, and why |

## 3. Hub page rendering and filters (Plan step 11)
| Field | Entry |
|---|---|
| Feature | Hub cards from `js/tools.js` with All / Live / Planned filters |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "implement the hub page rendering and filters" |
| What it produced | `filterTools` in `js/utils.js` (one line; its unit test now passes); `renderHub` in `js/hub.js` builds cards with `textContent` (name, summary, Live/Planned and section badges), links only tools that have a page (the link's `::after` makes the whole card clickable), shows an empty state, and updates a `role="status"` line ("Showing 12 of 14 tools") so screen readers hear the result; `onFilter` keeps exactly one button `aria-pressed`. CSS: glossy hub cards, dashed planned cards, badge colors for light and dark. Checked in the browser: All 14, Live 12, Planned 2, all links 200, no console errors. Changed after seeing it: the pressed filter was only a thin border, so pressed group buttons now use the solid aqua style. |
| Your decision | TODO: what you kept or changed, and why |

## 4. Sorting visualizer (Plan CS step 1)
| Field | Entry |
|---|---|
| Feature | Sorting visualizer: bubble, insertion, selection, merge, quick (Lomuto), heap |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "implement the sorting visualizer" |
| What it produced | `sortSteps` in `js/cs-lib.js` runs each algorithm on a copy and records compare / swap / write / sorted steps, each pointing at a line of `PSEUDOCODE`; `applyStep` replays one. Tests: every algorithm on 22 arrays (random with duplicates, empty, one element) replays to sorted, each index is marked sorted exactly once, every step's line exists, unknown names throw. `js/sorting.js`: bars (yellow = compared, red = swapped, green = in place), highlighted pseudocode line, comparison and swap counters, Big-O label, Step describes each move in words, Play/Pause, Reset replays the same array, New array / size reshuffle. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) At full speed bubble sort on 40 bars took 9 s, because browser timers can't fire much faster than ~60/s; fixed by running several steps per frame (speed now ~1 to ~2200 steps/s; 120 bars sort in 0.6–4.9 s). (2) "O(n log n)" wrapped in its stat box; `white-space: nowrap`. (3) 120 bars overflowed a 375 px phone (2 px minimum width + 2 px gaps); bars may now shrink and gaps are 1 px. |

## 5. Data structures visualizer (Plan CS step 2)
| Field | Entry |
|---|---|
| Feature | Stack, queue, linked list, BST, min-heap and hash table (chaining), drawn in SVG |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "implement the data structures visualizer" |
| What it produced | `js/cs-lib.js`: immutable BST insert/delete/search (delete reports the 0/1/2-children case, two children use the in-order successor), `treeLayout` (x = in-order rank, y = depth), min-heap push/pop recording swaps, djb2 `hashIndex`. Tests added for duplicates, each delete case, deleting the root, a missing value, and 40 random heap pushes/pops against a sort. `js/structures.js`: buttons relabel per structure (Push/Pop/Peek, Enqueue/Dequeue/Front, ...), input validation (numbers for BST/heap, size limits), a plain-English log of every operation, Big-O of the last operation, size and height (load factor for the hash table); search paths pulse yellow in order and the target turns blue; the heap is drawn as a tree and as its array. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) A new test failed: inserting a duplicate still copied every node on the path, so the "unchanged" tree was a new object; now a node is copied only if its subtree changed (same fix for deleting a missing value). (2) The drawings used an 800-wide viewBox scaled into a ~330 px panel, so text shrank to ~6 px; they now draw at real size inside a box that scrolls sideways only when the structure is wide, and BST spacing was tightened so a 10-node tree fits. |

## 6. Graphs & pathfinding visualizer (Plan CS step 3)
| Field | Entry |
|---|---|
| Feature | BFS, DFS, Dijkstra and A* on a grid you draw, plus random mazes |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "implement the graphs and pathfinding visualizer" |
| What it produced | `gridSearch` in `js/cs-lib.js` (BFS queue, DFS stack, Dijkstra/A* with a scanned priority list, Manhattan heuristic, ties broken toward the goal) returning the visit order, path and cost; `generateMaze` (recursive backtracker). Tests: 30 random weighted grids where every path is continuous and avoids walls, all algorithms agree on reachability, BFS has the fewest moves, A* matches Dijkstra's cost; start = end; a 21x41 maze with every open cell reachable. `js/graphs.js`: drag to draw walls/weights (dragging from a wall erases), move start/end, keyboard drawing with arrow keys + Enter/Space and a single Tab stop, Run/Pause/Resume, Step, Clear path/all, Random maze, visited/length/cost stats and a summary line. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) Weighted cells disappeared under the visited color; cell colors now use `background-color` so the weight dot stays. (2) Dark-mode walls looked like visited cells; darker gray. (3) On a 375 px phone the 41-column grid had 6 px cells, too small to tap; phones now get a 21x21 grid (13 px cells). |

## 7. Big-O playground (Plan CS step 4)
| Field | Entry |
|---|---|
| Feature | Growth-curve chart and a benchmark that times real algorithms and guesses their complexity |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "implement the big-o playground" |
| What it produced | `fitComplexity` in `js/cs-lib.js` fits t ≈ c·f(n) for 1, log n, n, n log n, n², n³ by relative error and returns the best class and constant (tests: each class recognized exactly and with ±10% noise, zero times ignored, < 2 points → null). `js/bigo.js`: Plotly growth curves with checkboxes, an n slider and a log/linear toggle (linear zooms to the polynomial curves so 2ⁿ and n! shoot off the top; overflowing values leave gaps); benchmark of linear/binary search, bubble/insertion/merge/quick sort and `Array.prototype.sort` (repeat until ≥ 25 ms, median of 3, size limits so the tab can't freeze), results table with doubling ratios, best-fit sentence, and a measured-vs-fit chart; charts recolor when Dark mode is toggled. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) Merge, quick and built-in sort fit O(n) over sizes 10,000–160,000: n and n log n differ by only ~1.3× over that range, less than timer noise. Each algorithm now fills in its own default sizes (a 1000× range for n log n), and all three then fit O(n log n). (2) Bubble sort's first ratio was ×11 because the warm-up ran on a tiny array; the warm-up now runs at the first real size. (3) Binary search fits O(1): log n grows too slowly to see past loop overhead; the page says so instead of hiding it. |

## 8. Regex builder (Plan CS step 5)
| Field | Entry |
|---|---|
| Feature | Regex builder: building blocks, plain-English explanation, live matches, replace preview, copy as JS |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "implement the regex builder" |
| What it produced | `js/cs-lib.js`: `explainRegex` tokenizer (escapes, sets incl. negated and ranges, numbered/named/non-capturing groups, lookarounds, anchors, alternation, greedy and lazy quantifiers; a quantifier after text splits off just the last character), `findMatches` (always global, steps over empty matches, emoji-safe in u mode, limit 1000), `escapeRegex`. `js/regex.js`: click-to-insert blocks (groups wrap the selection; set placeholders are selected for typing over), presets, flags help, explanation list, highlighted matches built from text nodes (empty matches shown as thin bars), match table with groups, replace preview with `$1`, copy as a `/.../flags` literal with slashes escaped. Matching runs in `js/regex-worker.js` and is stopped after 1 s. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) An operator-precedence bug (`!last.quantifiable === false`) would have explained `ab+` as plain text; caught on review, rewritten as `last.quantifiable !== false`. (2) Typing `(a+)+$` with a string of a's would freeze the tab (catastrophic backtracking); matching moved into a Web Worker that is terminated after 1 s, and the page recovers on the next pattern. (3) A long match like an email pushed the match table 3 px past a phone screen; table cells may now wrap anywhere. |

## 9. Indie-web redesign plan, then step 1: 98.css windows
| Field | Entry |
|---|---|
| Feature | Redesign plan (REDESIGN_PLAN.md) from four Neocities / web-desktop reference sites, then step 1: 98.css windows on every page and dark mode removed |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Work out a plan to carry out the following thematic changes … indie web / Neocities … Using 98.css reshape the current website … combining [math and cs] into one tools page. Add a new section, me/about … simpler is better" (with four reference sites and three questions), then my seven choices (Lab, no dark mode, splash page, draggable Tools windows, local guestbook, CSS chrome title, keep Social), then "Yes, start step 1". |
| What it produced | Studied the four sites (splash door, portal columns, web desktop, scene navigation), wrote the plan with answers to my three questions; then a one-off script wrapped every page section in `.window` / `.title-bar` / `.window-body` markup, converted 26 radios/checkboxes to 98.css's `input + label for` pattern, added the pinned 98.css link, and removed the Dark mode switch; deleted the theme functions, storage key and Plotly re-theme observer; rebuilt `style.css` on 98.css (teal desktop, hard shadows, 2× pixel page titles, menu-bar header, 98 tabs sub-nav, tooltip-yellow notices). |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) 98.css hides radios/checkboxes unless the label follows the input, so every wrapped `<label><input>` would have vanished; converted (one checkbox with `id` before `type` was missed by the script and fixed by hand after an audit). (2) 98.css makes every button at least 75×23 px, which would have broken the graph grid's 861 cells; small buttons opt out. (3) 98.css puts the whole window in its 11 px pixel font; window bodies get the readable font back. (4) The old hero rules grabbed the new title bar into a 2-column grid; they now target the window body. Audited all 17 pages at 1100 px and 375 px (no sideways scroll, every radio drawn, square grid cells, no tiny text) and ran every tool. |

## 10. Redesign step 2: taskbar, Start menu, Lab
| Field | Entry |
|---|---|
| Feature | Windows-98 taskbar with a Start menu; new top nav (Home, Tools, Social, Me, Lab); Hub renamed Lab |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Yes, start step 2" (step 2 of REDESIGN_PLAN.md) |
| What it produced | `hub.html` → `lab.html` and `js/hub.js` → `js/lab.js` (git mv, history kept); new nav on all pages with the right `aria-current` (math and CS pages count as Tools); the old Options menu removed; small "under construction" `tools.html` and `me.html` so no nav link is broken before steps 3 and 6. `initTaskbar` in `js/script.js` builds the taskbar on every page: Start button + menu (vertical "Christopia98" stripe, a 98 tree-view sitemap generated from `SITE` + `TOOLS`, Random page, Sound as a checkable item), a task button with the page title, and a clock. It reuses the existing `setExpanded`/`initMenus` for open/close, Esc and click-outside. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | My first Random-page filter compared path endings and treated every `index.html` alike; replaced it with a comparison of resolved URLs. Checked: Sound toggles and saves, Esc returns focus to Start, 12 random jumps never land on the current page, all 19 pages have one current nav item, no broken links, no sideways scroll at 375 px, no console errors. |

## 11. Redesign step 3: Tools desktop
| Field | Entry |
|---|---|
| Feature | `tools.html` as a web desktop: draggable Math and CS folder windows of tool icons; Math/CS overview pages replaced; address-bar breadcrumbs |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Yes, start step 3" (step 3 of REDESIGN_PLAN.md) |
| What it produced | Nine 98-style 48×48 program icons + a folder icon (`images/icons/`); `tools.html` with two folder windows (icon grid in a white sunken view, 98 status bar with an object count); `js/desktop.js` renders icons from `TOOLS`, drags windows by the title bar on wide mouse screens (clamped inside the desktop, positions saved per browser), brings the clicked/focused window to front with 98 inactive title bars, and opens `tools.html#cs` with CS in front; phones and keyboards get stacked windows. Deleted `math/index.html` and `cs/index.html`; Math/CS pages got a 98 "Address C:\Tools\Math\Matrix Lab" bar; Home tiles point at `tools.html#math` / `#cs`. New test: every live tool's page, card image and desktop icon exist. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) My script took the current page name from the first `aria-current` link, which was the top nav's "Tools", so every address bar said Tools; fixed from the names in `tools.js`. (2) `git rm` refused to delete the old overview pages because of uncommitted edits; forced, since they were being removed. (3) A synthetic drag test showed `setPointerCapture` throws when there's no live pointer; guarded so an unusual pointer can't break dragging. Verified a real mouse drag, saved positions after reload, clamping at the edges, `#cs`, icon links, address bars, 17 pages at 1100 and 375 px with no broken links. |

## 12. Redesign step 4: splash page and Home portal
| Field | Entry |
|---|---|
| Feature | `index.html` becomes a splash page (CSS chrome title + enter door); Home moves to `home.html` as a 3-column portal |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Yes, start step 4" (step 4 of REDESIGN_PLAN.md; my earlier choices: splash page yes, CSS-only chrome title) |
| What it produced | Splash: Rocket Pop title with a chrome gradient clipped to the text, a sweeping shine layer, a navy 3D edge made of stacked `drop-shadow` filters (they follow the clipped letters, unlike `text-shadow`), a slow float; motion only with `prefers-reduced-motion: no-preference`; Minecraft splash text on the title's corner; a pixel door (`images/door.svg`) that swings open on hover/focus and links to Home. Home: smaller chrome title + tagline, portal with Launch pad, Buttons wall, welcome.txt, the All tools gallery, a Now box and an Updates log (three real entries). Every Home link and the logo now go to `home.html`; the Start menu's Home too; ticker text refreshed; old hero and section-tile CSS deleted. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) The gallery's indentation changed when step 1 wrapped it in a window, so my extraction pattern missed it; nothing was written, fixed and re-ran. (2) I first closed the 768 px media block too early when adding the 1000 px portal rule, which would have moved the journal's two-column layout to 1000 px; caught on review and moved. Checked 18 pages at 1280 and 375 px: no sideways scroll, one current nav item, Start-menu Home → home.html, no broken links. |

## 13. Redesign step 5: sticker layer
| Field | Entry |
|---|---|
| Feature | A system for scattering stickers, GIFs and photos over any page, plus folders for buttons, blinkies and stamps |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Yes, start step 5" (step 5 of REDESIGN_PLAN.md, answering my question about putting PNGs and GIFs anywhere to fill whitespace) |
| What it produced | `js/stickers.js`: one line per sticker (`src`, `page`, `x`/`right`, `y`, `w`, `r`, `front`, `phone`, `still`, `pixel`, `href`, `alt`); `initStickers` in `js/script.js` works out the page key from the URL and places matching stickers in a layer behind the windows or one in front; animated stickers get a `<picture>` that swaps to the still copy under `prefers-reduced-motion`; lazy loading. CSS stacking order (behind 0 → content 1 → front 5 → header 10 → taskbar 40), `pointer-events: none` except link stickers, `overflow: hidden` so stickers can't cause sideways scroll, phones show only `phone: true`. Five original starter stickers (sparkle, floppy, CD, NEW! burst, blinking under-construction sign + still copy) placed on the splash, Home, Tools and Lab; empty `gifs/ buttons/ blinkies/ stamps/` folders; README how-to; test that every sticker file exists and entries are complete. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | A first screenshot showed only two of four splash stickers; checking the DOM showed all four placed and loaded at the right spots, so it was a screenshot taken mid-load (a retake showed all four). Verified: clicks pass through stickers to the window under them, phones show only `phone: true` stickers, no page scrolls sideways at 1280 or 375 px. Not verified: the reduced-motion swap itself (the test browser can't emulate that setting); the `<picture>` markup is in place. |

## 14. Redesign step 6: Me page
| Field | Entry |
|---|---|
| Feature | `me.html`: a desk scene whose objects are links (inspired by caramelfevers' table), plus about.txt and favorites.txt windows |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Yes, start step 6" (step 6 of REDESIGN_PLAN.md) |
| What it produced | Original drawings of a graphing calculator, spiral notebook, phone, headphones and a polaroid (`images/me/`), plus the floppy sticker, laid on a CSS-drawn wood desk. Each is a link with a sticky-note label ("Tools", "Journal", "Social", "Now playing", "Lab", "About me") that shows on hover/focus and always on touch screens; screen readers hear "Calculator: Tools" etc. Objects lift on hover (no motion with reduced motion). On phones the desk becomes a labeled 3-column grid. about.txt (photo placeholder, facts, why Christopia) and favorites.txt; personal details left as TODOs except my major. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) I first positioned the objects with `style="--x…"` attributes, which breaks the spec's "external CSS rather than inline styles"; moved them to `.desk-*` classes in `style.css` (no page has an inline style now). (2) Labels on phones were underlined like plain links; removed. Checked: hover and keyboard focus show labels, every object link works, phone grid, 18 pages clean at 1280 and 375 px. |

## 15. Redesign step 7: Friends page and guestbook
| Field | Entry |
|---|---|
| Feature | `social/friends.html`: friends' 88×31 buttons and links, neighbor sites, Christopia's own button with copy-paste HTML, and a guestbook |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Yes, start step 7" (step 7 of REDESIGN_PLAN.md; my earlier choice: guestbook local for now) |
| What it produced | Implemented the stubs the guestbook needs: `load`/`save` in `js/storage.js` (fallback on missing/corrupt data, throws when storage is full so the page says "Not saved"; new `tests/storage.test.js`), `validatePost` and `relativeTime` in `js/social-lib.js` (their tests now pass). `js/friends.js` holds the friends list (empty, with an example) and the four reference sites as neighbors; `js/friends-page.js` draws the wall, builds the button code from the site's real address, copies it, and runs the guestbook (validation, optional website, newest first, 200 max, text only). Friends added to the Social sub-nav on every Social page and to `tools.js` (so it's in the galleries, Start menu and Lab). |
| Your decision | TODO: what you kept or changed, and why; whether to keep the neighbor links |
| Debugging | Caught before running: reading `form.name` returns the form's own name attribute, not the "name" input, so every signature would have been rejected as nameless; the fields are now read by id. Tested with real typing: empty form errors, signing, reload keeps entries, `<b>` stays text, a `javascript:` website is refused, real websites link with `rel="noopener ugc"`; 19 pages clean at 1280 and 375 px. |

## 16. Redesign step 8: tool pages polish
| Field | Entry |
|---|---|
| Feature | Make every tool page match the 98 look and re-check every tool |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Yes, start step 8" (step 8 of REDESIGN_PLAN.md) |
| What it produced | Title bars on all 13 tool pages got the tool's icon (Math/CS) and a program name (`Sorting - sorting.exe`) in an `aria-hidden` span, so the heading still reads "Sorting". Leftover glossy styling converted: thick rounded grey borders on the sorting bars, structure canvas, graph grid, regex highlight and forum/event cards became 98 sunken panels; gallery and Lab cards became raised 98 panels; the frosted-glass footer and journal app became plain 98 panels; the hit counter sits sunken in the footer; the current pseudocode line is a navy selection. Big-O charts: white plot area, light grid, 16-color VGA palette. Removed six theme tokens nothing used any more. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | Re-ran sorting, data structures, graphs (maze + BFS), Big-O and regex in the browser after the changes; checked all 19 pages (including the stub tools) at 1280 and 375 px: no sideways scroll, no broken links or images, no runtime errors. |

## 17. Redesign step 9: docs and diagrams
| Field | Entry |
|---|---|
| Feature | Bring the project docs up to date with the redesigned site |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Yes, start step 9" (step 9 of REDESIGN_PLAN.md) |
| What it produced | `DIAGRAM.md` rewritten: a done / still-to-do plan, a 19-page sitemap, splash + Home wireframes, a new tool-page layout, sticker layers, code structure with the data files and the regex worker, a new regex time-limit sequence, plotter and journal diagrams marked "to build", requirements → code. `OUTLINE.md` rewritten: indie-web summary and direction, 19 pages with a status column (✅ / stub), the 98.css design, the done list and an 11-step to-do plan, files, key concepts, testing. README: new intro, live link, collage pages, 98.css and font credits. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | Checked all 13 Mermaid blocks parse with Mermaid itself, and that every relative link and file path in the docs exists. |

## Warm-up (Step 2.4)
TODO: ask "What semantic elements should a personal website homepage include?" and note one thing you learned.

## 1. TODO feature
| Field | Entry |
|---|---|
| Feature | |
| LLM used | |
| Your prompt | |
| What it produced | |
| Your decision | |

## 2. TODO feature
| Field | Entry |
|---|---|
| Feature | |
| LLM used | |
| Your prompt | |
| What it produced | |
| Your decision | |

## 3. TODO feature
| Field | Entry |
|---|---|
| Feature | |
| LLM used | |
| Your prompt | |
| What it produced | |
| Your decision | |

## Reflection
TODO: what the LLM did well, what you had to correct, how you verified it, and what you own in the final code.
