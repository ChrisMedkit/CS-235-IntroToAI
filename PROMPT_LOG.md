# Prompt Log — Christopia

LLM(s) used: Claude Code (Claude Opus 5.5), chat-based agent in the Claude desktop app. TODO: add any other LLM you use.

Record at least three significant features (page structure, navigation, CSS, responsive layout, JS feature; debugging exchanges count).

## 1. Project scaffold
| Field | Entry |
|---|---|
| Feature | Folder structure, six page skeletons with a shared nav, outline, diagrams |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | `/assignment` "use the images from the cs235 llm website assignment this time to create a homework scanning website ... main page with a description of the tools and links to the tools on a scrolling gallery, a second page with 2d/3d function plotting tools similar to Desmos, a third page to scan in notes and receive a typed up version ... and finally a third page for you to decide what to do with. I want this website to be called christopia ..." Then answered: Tesseract.js scanner, all three extra pages (Matrix Lab, LaTeX, Hub), detailed TODOs, math.js + Plotly. |
| What it produced | `index/plotter/scanner/matrix/latex/hub.html` with identical header/nav/footer, `css/style.css` with theme tokens, `js/script.js` (shared), one module per tool, `js/tools.js` registry, `js/utils.js` stubs + `tests/utils.test.js`, `OUTLINE.md`, `DIAGRAM.md` |
| Your decision | TODO: what you kept or changed, and why |

## 2. Theme and backgrounds (Step 6, early)
| Field | Entry |
|---|---|
| Feature | Site theme, collage + Real Analysis backgrounds, early-internet extras |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "2000's, Nintendo, Wii sports resort, Super Mario sunshine, early internet modernized, type of theme. I want to be able to have a background ... a photo shop file ... maximalist, MLG inspired 2000s/2010s collage ... For the math related pages I want the background to be my attached real analysis portfolio rotated diagonally and faded to just barely visible. Before executing, ask questions about the theme(s)". Answers: glossy console menu UI, frosted-glass panels, tiled portfolio pages, sparkle trail, hit counter + 88x31 badges, menu sounds, news ticker, plus a Minecraft-style splash text banner. |
| What it produced | Rewrote `css/style.css` (glossy tokens, pill buttons, channel-tile cards, frosted panels, dark mode, ticker/splash/sparkle styles); rendered the portfolio PDF pages to a transparent ink mosaic (`images/real-analysis-bg.png`); added splash, ticker, Sound toggle and badge footer to all 6 pages; `initSplash`, `initSparkles`, `initSounds` (Web Audio blips), `initHitCounter` in `js/script.js`; README steps to convert the PSD with `sips`. Checked in the browser at desktop and 375 px, light and dark, no console errors; fixed a header overlap, the hero grid, and a 26 px overflow on the Scanner page. |
| Your decision | TODO: what you kept or changed, and why |

## 3. Fonts, sections, CS and Social pages
| Field | Entry |
|---|---|
| Feature | Y2K + Minecraft fonts; Math/CS/Social sections with sub-pages; CS visualizers; forum, events, private journal |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "use y2k fonts from this website around the website: (cufonfonts Y2K collection) For the minecraft banner use a minecraft font: (dafont) Group together the math tools into one main math page with subpages. Add a algorithm and data structure visualization page and group together these computer science pages similar to the math pages. I also want to add another page ... called "social" ... sub page for a forum/discussion, event rsvp page, and a password locked private journal page. Make this journal page similar to popular note taking app ..." Answers: Rocket Pop + Digit Lo-Fi; social data in this browser for now; Notion-style journal; CS pages = sorting, data structures, graphs, Big-O, plus a regex builder. |
| What it produced | Checked font licenses, downloaded Rocket Pop, Digit Lo-Fi and Minecraft into `fonts/` with `@font-face`; moved the math pages into `math/` and built `cs/` and `social/` (17 pages, top nav + sub-nav, `aria-current` in the HTML); page layouts and CSS for every new tool; `js/cs-lib.js`, `js/social-lib.js`, `js/storage.js` stubs with 44 tests; one stub script per page; updated outline, diagrams, README. Checked all pages: no broken links, labels on every input, no console errors, no sideways scroll at 375 px. Switched the stat numbers off Digit Lo-Fi after seeing it unreadable at small size. |
| Your decision | TODO: what you kept or changed, and why |



## 4. Indie-web redesign plan, then step 1: 98.css windows
| Field | Entry |
|---|---|
| Feature | Redesign plan (REDESIGN_PLAN.md) from four Neocities / web-desktop reference sites, then step 1: 98.css windows on every page and dark mode removed |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Work out a plan to carry out the following thematic changes … indie web / Neocities … Using 98.css reshape the current website … combining [math and cs] into one tools page. Add a new section, me/about … simpler is better" (with four reference sites and three questions), then my seven choices (Lab, no dark mode, splash page, draggable Tools windows, local guestbook, CSS chrome title, keep Social), then "Yes, start step 1". |
| What it produced | Studied the four sites (splash door, portal columns, web desktop, scene navigation), wrote the plan with answers to my three questions; then a one-off script wrapped every page section in `.window` / `.title-bar` / `.window-body` markup, converted 26 radios/checkboxes to 98.css's `input + label for` pattern, added the pinned 98.css link, and removed the Dark mode switch; deleted the theme functions, storage key and Plotly re-theme observer; rebuilt `style.css` on 98.css (teal desktop, hard shadows, 2× pixel page titles, menu-bar header, 98 tabs sub-nav, tooltip-yellow notices). |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | (1) 98.css hides radios/checkboxes unless the label follows the input, so every wrapped `<label><input>` would have vanished; converted (one checkbox with `id` before `type` was missed by the script and fixed by hand after an audit). (2) 98.css makes every button at least 75×23 px, which would have broken the graph grid's 861 cells; small buttons opt out. (3) 98.css puts the whole window in its 11 px pixel font; window bodies get the readable font back. (4) The old hero rules grabbed the new title bar into a 2-column grid; they now target the window body. Audited all 17 pages at 1100 px and 375 px (no sideways scroll, every radio drawn, square grid cells, no tiny text) and ran every tool. |



## 5. Your content, a CD-ROM splash, Home control panel, Me desk, Lab removed
| Field | Entry |
|---|---|
| Feature | Fill in the remaining site TODOs from my answers; replace the splash door; simplify Home; turn Me into a full desk; replace the Lab |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Help me fix the todo list items ... Give me options for how to complete these with the ability to write in my own answer. After that, remove the following items. index.html - door, I just want a fun button ... new sticker ... home.html - buttons section ... now section ... change me.html - make the whole page the "desk" and have about.txt and favorites.txt be sticky notes on the desk. change lab.html - needs a format change; Give me options" (answers: my own Into / Currently / favorites, "Hang out with me" blurb, CD-ROM autorun button, a server-rack control panel on Home replacing Now and Updates showing only services that aren't tools plus blank coming-soon slots, remove the Lab page, keep the desk objects, classic yellow sticky notes, headphones to my Spotify) |
| What it produced | Me: the whole page is a wood desk with a brass nameplate; about.txt and favorites.txt are tilted yellow sticky notes with my answers; objects stay as links (headphones → Spotify, floppy → Services). Splash: a spinning CD-ROM "Click to run Christopia.exe" button instead of the door (`door.svg` deleted). NEW stickers removed. Home: Buttons, Now and Updates removed; a Services control panel (server rack) renders the `planned` entries from `js/tools.js` plus 4 empty bays (`renderServices`, reusing `filterTools`). Lab page, `js/lab.js` and its styles removed; Lab taken out of the nav on 17 pages, the Start menu and the launch pad. Social blurb rewritten. Docs updated to 18 pages. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | Contrast check: the rack's amber status text (4.36:1) and the white desk hint on light wood (3.3:1) were under 4.5:1; darkened the rack units and put the hint on a paper tag. Audited all 18 pages at 1280 px and 375 px: no sideways scroll, no broken images, no broken links. |

## 22. Fixes from a whole-repo audit
| Field | Entry |
|---|---|
| Feature | Fix the six findings of a code audit (`/ponytail:ponytail-audit`) |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | "Fix all six" |
| What it produced | (1) The journal's base64 conversion crashed once the encrypted journal passed ~125 KB, so big journals could never save; now a byte-by-byte loop in one shared `toBase64`, with a 200 KB test. (2) Locking no longer drops the pages from memory when the last save failed; it stays open and says why. (3) An event with no end time now counts as one hour long in both the Upcoming/Past lists and the .ics file (it used to jump to Past the minute it started). (4) `el()` (copied in 5 files) and the file-download code (3 files) now live once in `js/dom.js`. (5) Removed `escapeRegex`, which only its own test used. (6) Unexported an internal constant and fixed a stale comment. |
| Your decision | TODO: what you kept or changed, and why |
| Debugging | The new 200 KB test fails on the old code and passes on the new. In the browser: all 18 pages load with no errors; the .ics, .tex and .txt downloads have the right names, types and contents; a throwaway journal with storage made to fail stays unlocked with the message, then locks once storage works. |

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
