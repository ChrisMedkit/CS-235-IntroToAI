# Christopia — TODO

Checked against the assignment spec and rubric in `assignment/` (5 criteria × 20 pts).
Every required feature is built; the points still at risk are in the write-ups, placeholder art and a
few visible TODOs. Work top to bottom: the earlier steps protect the most points.

## Where it stands (estimate)
| Criterion | Now | What holds it back |
|---|---|---|
| Content & structure | 18–20 | 13 tool card images are still gray "(placeholder)" boxes |
| Design & CSS | 20 | Consistent 98 + glass look, checked at 375 px and desktop |
| JavaScript feature | 20 | Many working tools, edge cases handled, 59 unit tests |
| Code quality | 20 | Prettier-formatted, semantic, alt text everywhere, contrast checked |
| AI workflow & reflection | 15–20 | Written; it should read as yours (Step 1) |
| Submission | ready | Prompt log and test report done, also as Word files |

## The path

### Step 1: Read the write-ups and make them yours — you
- [x] "Your decision" rows, warm-up and reflection drafted in [PROMPT_LOG.md](PROMPT_LOG.md) from what you chose and corrected in this project.
- [ ] **Read them and change anything that doesn't sound like you**, especially the reflection: it is graded as your thinking. If you edit the `.md`, ask Claude to remake the Word copy.
- [ ] If you used another LLM, add it to the LLM line at the top.

### Step 2: Test report — done
- [x] All six items run on all 18 pages and every tool, results and fixes written up in [TEST_REPORT.md](TEST_REPORT.md); `npm test`: 59 passed, 0 failed.
- [ ] *(optional)* Click through the live site yourself once after the final push.

### Step 3: Visible TODOs — done
- [x] No TODO text on any page; every image has real alt text.

### Step 4: Placeholder images (Content)
- [x] Your portrait (`images/me/me.jpg`) and the Home welcome image (`images/hero.jpg`) are your photos.
- [ ] *(optional, +polish)* The 13 tool card images: Claude can replace them with screenshots of each working tool.

### Step 5: Consistent formatting — done
- [x] Prettier 3.3.3 with your `.prettierrc` over all HTML, CSS and JS; tests and page checks re-run after.

### Step 6: Submit — you
- [ ] Final commit and push; open the live site once more.
- [ ] Submit: the repo link (https://github.com/ChrisMedkit/cs235-christopia), the Pages link (https://chrismedkit.github.io/cs235-christopia/), and the prompt log and test report (`PROMPT_LOG.docx`, `TEST_REPORT.docx`, plain-text Word copies of the `.md` files).

## Optional (nice, not graded)
- [ ] Friends in [js/friends.js](js/friends.js); the rest of the art in [ART_LIST.md](ART_LIST.md) (icons, buttons, stickers, desk objects); collage background; favicon.
- [ ] Your own splash phrases in `SPLASHES` in [js/script.js](js/script.js).

## Already met (no work needed)
18 pages (spec: 3+); the same nav on every page; 2+ images; one stylesheet and no inline styles; a shared
`js/script.js`; semantic header / nav / main / section / footer (the splash page is intentionally just a
title and an enter button, and still has `main`); responsive at 375 px and desktop; contrast checked
(4.5:1+); no console errors, broken links or missing files; commits after every step; GitHub Pages live.

## Later (after the class)
- [ ] Home server: move forum, events, guestbook and journal storage there (only `js/storage.js` changes), so posts are shared between visitors
- [ ] The planned services on Home's control panel: home server dashboard, smart-home controls (plus the empty bays)
- [ ] Fill or delete the empty art folders: `images/gifs/`, `blinkies/`, `stamps/`
