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
