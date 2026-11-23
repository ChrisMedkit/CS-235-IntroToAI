# Test Report — Christopia

Tested on November 22, 2026, in Chrome (the browser built into the Claude desktop app), on a local copy
of the site served from this folder: the same files that are pushed to GitHub Pages
(https://chrismedkit.github.io/cs235-christopia/). Every page was checked at desktop (1280 px) and phone
(375 px) width.

The 18 pages: `index` (splash), `home`, `tools`, `me`; `math/` plotter, matrix, latex, scanner;
`cs/` sorting, data-structures, graphs, big-o, regex; `social/` index, forum, events, journal, friends.

## 1. Navigation
- **What I tested:** On all 18 pages, every link in the top nav, the Start menu sitemap, the Home launch pad, the Math/CS address bars and the Social sub-nav (420 links in all). Also that each page marks its own section as current, that the splash page's CD-ROM button opens Home, and that the Me desk objects and sticky-note links work.
- **Result:** Pass. All 420 links load a real page; each page highlights the right section (Home, Tools, Social or Me).
- **Fixes:** Earlier, the address bar on tool pages picked the wrong page name, and removing the Lab page left "Lab" links on every page; both fixed and re-checked.

## 2. Images
- **What I tested:** That every image loads (107 images across the 18 pages: icons, card images, desk objects, stickers, 88×31 buttons, my two photos) and that every `<img>` has an `alt` attribute: a description, or `alt=""` when it is decoration next to a text label.
- **Result:** Pass. No broken images; no image without alt text.
- **Fixes:** My portrait and welcome image had "TODO" alt text; they are now my real photos with real descriptions. Photos were drawn with pixel-art scaling, which made my portrait look jagged; turned that off.

## 3. JavaScript features
- **What I tested:** Every interactive feature in its normal and error states.
  - Shared: Start menu opens and Esc closes it; Sound toggles on and off; hit counter counts; Home's services panel shows 2 planned services and 4 empty bays; the tool gallery shows all 13 tools; the Tools desktop shows 9 icons.
  - Math: plotter draws `1/x` with a break at the asymptote, shows "f1: Undefined symbol sinx" for a typo, and switches to a 3D surface; Matrix Lab gives RREF with 11 steps, says a singular matrix has no inverse, refuses a determinant of a 2×3 matrix, finds complex eigenvalues (±i) and names a bad entry ("x is not a number"); LaTeX preview renders math and keeps going past broken math like `\frac{1}{`; scanner does nothing without a file and read a test image exactly at 96% confidence.
  - CS: sorting finished 30 values (435 comparisons); the stack pushes 7 and 3 (size 2); A* found a path through a maze; Big-O benchmark fitted O(n) as expected; regex counted 3 matches, showed a syntax error for `(a+`, and stopped `(a+)+$` after 1 second.
  - Social: forum rejects an empty post, posts a thread and a reply, shows `<b>` as plain text, and one vote toggles 1 → 0; events reject an empty form and say "Sorry, this event is full" past capacity; journal rejects a short password and a wrong one, keeps pages through lock and unlock, and stores them encrypted; guestbook rejects an empty entry and a `javascript:` website, then signs.
- **Result:** Pass. Every feature behaved as expected in every state tested.
- **Fixes:** `1/x` and `tan(x)` drew a fake vertical line through each asymptote; Markdown shortcuts in the journal did not fire on phone keyboards; replying right after posting a thread failed; a large journal could not be saved and locking would then lose the edits. All fixed and re-tested.

## 4. Responsive layout
- **What I tested:** All 18 pages at 1280 px and 375 px: no sideways scrolling; on phones the Menu button opens and closes the nav (also with Esc), tool pages stack, the Me sticky notes and desk objects stack, and the journal sidebar sits above the editor.
- **Result:** Pass. No sideways scrolling on any page at either width; the Menu works on all 17 pages that have one.
- **Fixes:** Earlier, the Scanner page scrolled 26 px sideways on phones and the journal page title was clipped by 98.css; both fixed. Two colors were below 4.5:1 contrast (the rack's status text and the desk hint); both darkened.

## 5. Console
- **What I tested:** The browser console on all 18 pages while loading and while using every tool above.
- **Result:** Pass. No errors.
- **Fixes:** Dragging a Tools window with a simulated pointer threw a `setPointerCapture` error; now caught.

## 6. Links and paths
- **What I tested:** Every local file each page loads (52 stylesheets, scripts and images) and every internal link, checked for 404s.
- **Result:** Pass. Nothing missing; no 404s.
- **Fixes:** The GitHub link I first put in the footer returned 404; every footer now links to the project repo.

## Unit tests
`npm test` → **59 passed, 0 failed** (math helpers, CS algorithms, social logic including journal encryption, storage, and checks that every tool and sticker file exists).
