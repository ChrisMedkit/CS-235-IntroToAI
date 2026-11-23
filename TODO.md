# Christopia — TODO

Everything left, in a sensible order. Every tool is built; what remains is **your** content, your art,
and the assignment write-ups. Search the project for `TODO` to find each spot.

## 1. Your words on the site
- [x] **Home**: tagline and welcome.txt
- [x] **Me**: about.txt and favorites.txt (now sticky notes on the desk)
- [x] **Social overview blurb**
- [x] **News ticker**: "TODO: your news here" removed
- [x] **Footer**: GitHub link to the repo on all 17 pages with a footer
- [ ] **Friends**: add friends to [js/friends.js](js/friends.js) (their buttons go in `images/buttons/`, with permission)
- [ ] *(optional)* **Splash phrases**: your own short lines in `SPLASHES` in [js/script.js](js/script.js)

## 2. Your art
Full checklist with sizes: [ART_LIST.md](ART_LIST.md).
- [ ] 13 tool card images (640 × 360)
- [ ] 9 desktop icons (48 × 48) + the folder icon (16 × 16)
- [ ] 3 88 × 31 buttons (make `christopia` your best; others copy it to link to you)
- [ ] 4 stickers in use (sparkle, CD, floppy; the CD is also the splash button), and any new ones you want
- [ ] 6 Me-desk objects + your portrait
- [ ] Home welcome image
- [ ] **Collage background** → `images/bg-collage.jpg` (README "Background" has the export steps)
- [ ] **Favicon** (the browser-tab icon; the site has none yet)
- [ ] **Alt text** for the two pictures of you/your welcome image: [home.html:86](home.html#L86), [me.html:80](me.html#L80)

## 3. Assignment write-ups
- [ ] **Warm-up question** (spec step 2.4): ask your LLM "What semantic elements should a personal website homepage include?" and note one thing you learned ([PROMPT_LOG.md:231](PROMPT_LOG.md#L231))
- [ ] **"Your decision" rows**: 23 of them, one per prompt-log entry (0 – 20): what you kept or changed, and why
- [ ] **Other LLMs**: add any you used besides Claude ([PROMPT_LOG.md:3](PROMPT_LOG.md#L3))
- [ ] **Empty "1/2/3. TODO feature" templates** at the bottom of the prompt log: delete them (entries 0 – 20 already cover far more than 3 features) or use them for your own prompts ([PROMPT_LOG.md:234](PROMPT_LOG.md#L234))
- [ ] **Reflection**: what the LLM did well, what you corrected, how you verified it, what you own ([PROMPT_LOG.md:261](PROMPT_LOG.md#L261))
- [ ] **Test report**: run the 6 items on the live site and fill in Result / Fix; paste the `npm test` summary (currently 59 passed, 0 failed) ([TEST_REPORT.md](TEST_REPORT.md))

## 4. Submit
- [ ] Final commit and push; check the live site once more
- [ ] Submit the repo link and the GitHub Pages link

## 5. Small cleanups Claude can do
- [x] The three test files no longer say the tests fail until the TODOs are done
- [ ] After your art is in: check every page again for layout shifts and broken images

## Later (after the class)
- [ ] Home server: move forum, events, guestbook and journal storage there (only `js/storage.js` changes), so posts are shared between visitors
- [ ] The planned services on Home's control panel: home server dashboard, smart-home controls (plus the empty bays)
- [ ] Fill or delete the empty art folders: `images/gifs/`, `blinkies/`, `stamps/`
