# Christopia

A hub of study tools for applied math and computer science: a 2D/3D function plotter, a notes scanner, a Matrix Lab, a LaTeX scratchpad, and a Hub for planned tools (home server, smart home).

CS235 Project 1: Personal Interest Website with an LLM. See [OUTLINE.md](OUTLINE.md).

## Run
Static site, no build. Open `index.html` with VS Code Live Preview, or:

```bash
python3 -m http.server 8124
```

Tests (Node 18+, nothing to install): `npm test`

## Layout
- `index.html` (Home) and `hub.html` at the root.
- `math/`, `cs/`, `social/`: each has an `index.html` overview plus one page per tool.
- Shared: `css/style.css`, `js/script.js`, `fonts/`, `images/`. Pages in folders link up with `../`.

## Add a tool
1. Add an entry to `js/tools.js` (`href` is from the site root, `category` is its section).
2. Copy a page in that section folder (header, ticker, sub-nav, footer are already there) and add `js/<tool>.js`.
3. Add its link to the sub-nav on every page in that section, and a card on the section's `index.html`.

Live site: TODO (GitHub Pages URL)

## Background
- **Collage (Home, Hub, CS, Social):** browsers can't show `.psd` files. Export a flattened JPEG from
  Photoshop (File → Export → Export As → JPG, about 2560 px wide, quality ~70, aim under 1 MB) to
  `images/bg-collage.jpg`, or convert on the Mac without opening Photoshop:

  ```bash
  sips -s format jpeg -s formatOptions 70 -Z 2560 "path/to/collage.psd" --out images/bg-collage.jpg
  ```

  Then in `css/style.css` set `--bg-collage: url("../images/bg-collage.jpg");`.
- **Math pages (all of `math/`):** `images/real-analysis-bg.png` is pages 2–9 of the
  Real Analysis portfolio, tiled 4×2, ink only (transparent). CSS rotates it −30° at 9% opacity
  (`body.math-bg::before`); dark mode inverts the ink.

## Fonts
Self-hosted in `fonts/`, declared at the top of `css/style.css`:
- Rocket Pop + Rocket Pop Italic (Daniel Zadorozny / Iconian, via cufonfonts Y2K collection): free for personal use.
- Digit Lo-Fi (cufonfonts Y2K collection): no license listed on the download page.
- Minecraft (Craftron Gaming, dafont): 100% free.
