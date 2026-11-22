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
