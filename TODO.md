# Christopia — TODO

Checked against the assignment spec and rubric in `assignment/` (5 criteria × 20 pts).
Every required feature is built; the points still at risk are in the write-ups, placeholder art and a
few visible TODOs. Work top to bottom: the earlier steps protect the most points.

## Where it stands (estimate)
| Criterion | Now | What holds it back |
|---|---|---|
| Content & structure | 16–18 | 14 images are gray "(placeholder)" boxes |
| Design & CSS | 20 | Consistent 98 + glass look, checked at 375 px and desktop |
| JavaScript feature | 20 | Many working tools, edge cases handled, 59 unit tests |
| Code quality | 15–20 | formatting is inconsistent (`.prettierrc` exists but most files aren't formatted) |
| AI workflow & reflection | ~10 | Every "Your decision" row, the warm-up and the reflection are still TODO |
| Submission | missing | Test report results are empty (it's a required deliverable) |

## The path

### Step 1: Prompt log (AI workflow, up to +10 pts) — you
- [ ] **"Your decision"** for each entry in [PROMPT_LOG.md](PROMPT_LOG.md): what you accepted, rejected or changed, and why. Real examples you can use: you rejected the door and asked for a button; you rejected dark mode in the redesign; you rewrote the welcome text yourself; you picked the CD-ROM, sticky notes and server rack from options; you chose the repo link over your own GitHub link after it 404'd.
- [x] **Renumber**: the audit entry is now 6.
- [x] **Empty "TODO feature" templates** deleted (6 real entries already beat the "at least 3").
- [x] **LLM line** (line 3): the TODO is removed; add any other LLM you used.
- [ ] **Warm-up** (spec step 2.4): ask an LLM "What semantic elements should a personal website homepage include?" and write one thing you learned. Asking Claude here counts.
- [ ] **Reflection** (the rubric's "Exceeds" asks for "corrections made and ownership"): what the LLM did well, what you had to correct, how you checked its work (tests, browser checks, the audit), and what you now own and understand. Name specifics: the journal save bug the audit found, the contrast fixes, the GitHub link that 404'd.

### Step 2: Test report (required deliverable) — you, Claude can help
- [ ] Run the 6 items in [TEST_REPORT.md](TEST_REPORT.md) on the **live** site and fill in Result / Fix. The "Fix" column can cite real fixes from the prompt log (contrast, journal title clipping, `1/x` asymptotes, the reply name bug).
- [ ] Paste the `npm test` summary (59 passed, 0 failed).
- Claude can run the automated checks (every link, console, 375 px) on the live site and hand you the numbers; you still click through the nav and tools yourself.

### Step 3: Visible TODOs (Content + Code quality) — done
- [x] Alt text for the welcome image ([home.html:90](home.html#L90)) and your portrait ([me.html:53](me.html#L53)) now describe the placeholders honestly; rewrite them when your real pictures go in (Step 4).
- [x] Friends page empty state now just says "No friends listed yet." ([social/friends.html:59](social/friends.html#L59)).

### Step 4: Replace the placeholder images (Content, up to +4 pts) — you, then Claude
The rubric's "Exceeds" wants "complete, polished content"; 14 gray boxes that say "placeholder" read as unfinished.
- [ ] **Minimum:** the Home welcome image (`images/hero.svg`) and your portrait (`images/me/me.svg`), the two that sit beside your own words.
- [ ] **Better:** the 13 tool card images too. Screenshots of each working tool work well and need no drawing (Claude can take them).
- [ ] Then Claude swaps them in, fixes alt text, and re-checks every page. Sizes are in [ART_LIST.md](ART_LIST.md).

### Step 5: Consistent formatting (Code quality) — Claude, with your OK
- [ ] Run Prettier (the formatter your editor already uses, `.prettierrc`) over every HTML, CSS and JS file, so all files look like the ones you saved. Needs a one-time download of Prettier from npm; nothing changes in how the site works. Re-run the tests and the page checks after.

### Step 6: Submit — you
- [ ] Final commit and push; open the live site once more.
- [ ] Submit: the repo link (https://github.com/ChrisMedkit/cs235-christopia), the Pages link (https://chrismedkit.github.io/cs235-christopia/), the prompt log and the test report.

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
