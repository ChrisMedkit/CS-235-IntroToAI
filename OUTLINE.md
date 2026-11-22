# Personal Interest Website with an LLM — CS235 (AI-Assisted Coding)
**Due:** not stated  ·  **Type:** Web (static HTML/CSS/JS)  ·  **Points:** 100 (5 criteria × 20)
See [DIAGRAM.md](DIAGRAM.md) for diagrams. Original spec: [assignment/](assignment/).

## Summary
Build a 3+ page website about a personal interest, using an LLM as the development partner from a blank folder to a finished site. Topic: **an 8-bit themed casino of mini games** (play money only). The grade is split evenly between content, design/CSS, the JavaScript feature, code quality, and the documented AI workflow (prompt log + reflection), plus a test report.

## Direction & class methods
- **Vision:** rubric "Exceeds" on all five criteria; file names match the spec exactly.
- **Process:** follow the spec's Steps 4–9 as milestones, one commit per step; light TODOs.
- **In-class methods & notation to follow:** the spec's own procedure: paste your site plan into prompts, read generated code line by line, change one thing at a time with focused follow-up prompts, record every significant exchange (including debugging) in `PROMPT_LOG.md`.
- **Constraints:** any LLM; images you own or have rights to; no copied text from other sites; shared external CSS and JS (no inline styles/scripts).

## Requirements
- [x] At least three pages: `index.html` (Home), `about.html` (About), `gallery.html` (Gallery)
- [x] Identical navigation menu on every page linking all pages
- [ ] At least two images (yours / licensed), every `<img>` has alt text
- [x] Consistent design: shared colors, fonts, layout (one `css/style.css`)
- [x] One interactive JS feature: **gallery lightbox / slideshow** in `js/script.js`
- [x] Responsive: desktop and phone width (stacks under 600px, no horizontal scroll at 375px)
- [x] Semantic HTML: `header`, `nav`, `main`, `section`, `footer`
- [ ] Meaningful class names, helpful comments, consistent formatting (Prettier on save)
- [x] Readable color contrast
- [ ] Prompt log for ≥ 3 significant features (feature, LLM used, prompt, what it produced, your decision) — `PROMPT_LOG.md`
- [ ] Reflection on corrections and ownership — end of `PROMPT_LOG.md`
- [x] Test report covering the 6 testing items — `TEST_REPORT.md`
- [ ] GitHub repo with a commit at the end of every step; submit repo link (+ optional GitHub Pages link), prompt log, test report

## Pages & features
| Page | Sections | Interactions |
|---|---|---|
| `index.html` Home | `#hero` (8-bit ASCII-art circus, first thing on screen), `#game-select` (horizontal scrolling gallery of game cards), `#intro` (your text) | nav; swipe/scroll the game cards (CSS scroll-snap, no JS needed) |
| `about.html` About | `#the-casino`, `#the-games` (rules for Horse Racing, Slots, Blackjack, Roulette) | nav |
| `gallery.html` Gallery | `#gallery` grid of 6 thumbnails, `#lightbox` dialog | click thumbnail → lightbox; prev/next, arrow keys, Esc / X / backdrop to close |

## Design
- Header bar on top, content in the middle, footer at the bottom; nav as a horizontal bar (stacked on phones).
- Colors (tokens in `:root`): dark arcade navy background, chip gold accent, neon pink hover. Check contrast.
- Fonts: a pixel font for headings only, system sans-serif for body text (pixel fonts are hard to read in paragraphs).
- `image-rendering: pixelated` keeps pixel art sharp; square corners.
- Home hero: ASCII art in a `<pre>` with `role="img"` + `aria-label` (screen readers would otherwise read every character). Monospace font; shrink the font size on phones (e.g. `clamp()`) so it fits at 375px without page scroll.
- Game select: a row of cards that scrolls sideways (`overflow-x: auto` + `scroll-snap-type: x mandatory`); each card links to the game's rules on About (`about.html#horse-racing` etc.).
- Breakpoint: 600px (from the spec's example prompt).

## Accessibility & responsiveness checklist
- [ ] Every `<img>` has a real description in `alt`
- [x] Nav shows current page (`aria-current="page"`) and visible `:focus-visible` styles
- [x] Thumbnails are `<button>`s, so Tab + Enter opens the lightbox; Esc closes it
- [x] Text/background contrast ≥ 4.5:1
- [x] No horizontal scroll at 375px; gallery is 1–2 columns on phones

## Plan
1. **Step 1–3:** gather text + at least 2 images (into `images/`), write the site plan below, warm-up prompt. Commit.
2. **Step 4:** prompt for `index.html` with the site plan; check paths and semantics; fill real content. Commit.
3. **Step 5:** prompt for `about.html` + `gallery.html` with the same header/nav; click every link. Commit.
4. **Step 6:** prompt for `css/style.css` from the Design section; iterate one change at a time; check the phone layout. Commit.
5. **Step 7:** prompt for the lightbox in `js/script.js` (`wrapIndex` first, then the DOM functions); run `npm test`; check the console. Log any debugging. Commit.
6. **Step 8:** work through `TEST_REPORT.md`, fix, re-test. Commit.
7. **Step 9:** deploy to GitHub Pages, finish prompt log + reflection, final commit and push, submit.

### Draft site plan (Step 3 — edit, then paste into prompts)
```
Topic: 8-Bit Casino, a retro pixel-art casino of mini games (play money only).
Games: Horse Racing, Slots, Blackjack, Roulette.
Home: first screen is an 8-bit ASCII-art circus; scroll down to a sideways-scrolling
  gallery of game cards to pick a game mode (each links to its rules); short intro.
About: what the casino is; rules of each of the 4 games.
Gallery: 6 pixel-art screenshots in a grid, click to open a lightbox with prev/next.
Design: dark navy background, gold accent, pink hover; pixel font for headings, sans-serif body.
Layout: header + horizontal nav on top, content in the middle, footer at the bottom; stacks under 600px.
Files: index.html, about.html, gallery.html, css/style.css, js/script.js, images/.
```

## Files
| File | Purpose |
|---|---|
| `index.html` | Home page |
| `about.html` | About page (two text sections) |
| `gallery.html` | Gallery grid + lightbox `<dialog>` |
| `css/style.css` | Shared stylesheet, design tokens in `:root` |
| `js/script.js` | Lightbox: `wrapIndex`, `showImage`, `openLightbox`, `closeLightbox`, `moveBy`, `initGallery` |
| `tests/script.test.js` | `npm test` checks for `wrapIndex` |
| `images/` | Your images (`home.png`, `about.png`, `game-1.png` … `game-6.png`, or rename in the HTML) |
| `PROMPT_LOG.md` | Prompt log + reflection (submitted) |
| `TEST_REPORT.md` | Test report (submitted) |
| `assignment/` | Original spec screenshots |

## Key concepts
- **Semantic landmarks:** `header`/`nav`/`main`/`footer` once per page; `section` for each themed block with a heading.
- **Consistency by copy:** with plain HTML, the nav is duplicated in each file, so any change must be made in all three (only `aria-current` moves).
- **Lightbox state:** one `currentIndex` plus a list of images; prev/next wrap around with modulo (JS `%` keeps the sign, so `-1 % 6 === -1`).
- **`<dialog>`:** `showModal()` adds a backdrop, traps focus and closes on Esc without extra code.
- **Mobile-first CSS:** base styles for phones, `@media (min-width: 600px)` adds the wide layout.
- **Classic script vs. module:** `type="module"` fails when the page is opened from `file://`, so `script.js` is a plain script.

## Testing
- Nav: every link on every page, including the logo.
- Game cards: each Home card jumps to the right game on About; the row scrolls sideways by swipe, trackpad and Tab key, with no page-wide horizontal scroll.
- ASCII hero: fits at 375px; a screen reader announces the label only.
- Images: all load (Network tab, no 404), all have alt text.
- Lightbox: open each thumbnail; next on the last → first; prev on the first → last; arrow keys; Esc, X button, backdrop click close it; keyboard-only (Tab + Enter) works.
- Responsive: desktop width, 375px phone, a tablet width.
- Console: no errors on all three pages (home/about must not break because they have no gallery).
- `npm test` passes.

## Questions / ambiguities
- Due date isn't in the screenshots.
- Rubric mentions a "reflection" but the submission checklist doesn't list it separately — put it in the prompt log (done here), or ask if it should be its own document.
- ASCII art counts as page content, not as an `<img>`, so the "two images" requirement still needs two real image files (planned: drawn/exported later).
- Images: you need at least two you own (your own pixel art or screenshots of mini games you made). Screenshots of commercial casino/arcade games likely don't count as "rights to use".
