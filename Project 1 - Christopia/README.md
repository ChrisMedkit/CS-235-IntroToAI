# Christopia

An indie-web home for an applied math + CS major and their friends, dressed as a Windows 98 desktop: a Tools desktop (Math and CS tools), Social (forum, events, journal, friends + guestbook), a Me desk, and a Services control panel on Home for what's next.

**Live:** https://chrismedkit.github.io/CS-235-IntroToAI/Project%201%20-%20Christopia/

CS235 Project 1: Personal Interest Website with an LLM. See [OUTLINE.md](OUTLINE.md), [DIAGRAM.md](DIAGRAM.md), [REDESIGN_PLAN.md](REDESIGN_PLAN.md) and [ART_LIST.md](ART_LIST.md) (every picture on the site, to swap for your own).

## Run
Static site, no build. Open `index.html` (the splash) with VS Code Live Preview, or:

```bash
python3 -m http.server 8124
```

Tests (Node 18+, nothing to install): `npm test`

## Layout
- `index.html` (splash: big chrome title + a spinning CD-ROM "autorun" button), `home.html` (Home portal with the Services control panel), `tools.html` (the Tools desktop: Math and CS folder windows) and `me.html` (Me: the whole page is a desk with link objects and two sticky notes) at the root.
- `math/`, `cs/`: one page per tool; the Tools desktop is their overview, and each page has a 98 address bar (`C:\Tools\Math\Plotter`).
- `social/`: an `index.html` overview plus one page per tool, linked by a sub-nav.
- Shared: `css/style.css`, `js/script.js`, `fonts/`, `images/`. Pages in folders link up with `../`.

## Add a tool
1. Add an entry to `js/tools.js` (`href` is from the site root, `category` is `math`, `cs` or `social`).
   It then shows up by itself on the Tools desktop, the Home gallery and the Start-menu sitemap. A `planned` entry shows up instead as a service on Home's control panel.
2. Add `images/<id>.svg` (card image) and, for Math/CS tools, `images/icons/<id>.svg` (48×48 desktop icon).
   `npm test` fails if either is missing.
3. Copy a page in that folder (header, address bar or sub-nav, footer are already there), change its
   address-bar name, and add `js/<tool>.js`. Social tools also need a link in the Social sub-nav.

Every push to `main` updates the live site within a minute or two (GitHub Pages).

## Add a sticker, GIF or button
**Stickers** (characters, photos of your things, doodles, GIFs) float over the pages.
1. Put the image in `images/stickers/` (PNG with a transparent background, GIF, or SVG). Animated? Also save a still copy (first frame as a PNG).
2. Add one line to `js/stickers.js`, for example:
   ```js
   { src: "images/stickers/my-cat.png", page: "home", x: "6%", y: 600, w: 140, r: -8 },
   ```
   - `page`: `"home"`, `"index"` (splash), `"tools"`, `"me"`, `"cs/regex"`, … or `"*"` for every page.
   - `x` (or `right`) from the edge, `y` in px from the top of the page, `w` width in px, `r` tilt.
   - `front: true` puts it over the windows (use corners and empty spots, never over text); the default is behind them.
   - `phone: true` also shows it on phones; `still: "images/stickers/my-cat-still.png"` for GIFs; `pixel: true` for pixel art; `href` + `alt` to make it a link.
3. `npm test` checks the file exists and the entry is complete. Refresh the page and nudge `x`/`y` until it sits right.

**Friends (Social → Friends):** add one line per friend to `js/friends.js`:
`{ name: "Sam", url: "https://sam.neocities.org", button: "images/buttons/sam.gif", note: "pixel art" }`.
With a `button` (their 88×31, saved in `images/buttons/` with permission) they appear on the buttons wall;
without one they get a text link. `NEIGHBORS` in the same file lists sites that inspired Christopia.
The guestbook saves in each visitor's browser until the home server exists (only `js/storage.js` changes then).

**Your desk (Me page):** each object on the desk in `me.html` is a link. To use photos of your own things:
cut each one out (transparent PNG), save it in `images/me/`, and change that object's `src` in `me.html`
(keep its label text). Move or resize it with its rule in `css/style.css`: `.desk-calculator { --x: 7%; --y: 12%; --w: 10%; --r: -8deg; }`
(position from the desk's top-left, width as a share of the desk, tilt). On phones the objects line up in a grid automatically.

**88×31 buttons**: your own in `images/badges/` (footer), friends' in `images/buttons/` (Friends page); **blinkies** (150×20) in `images/blinkies/`; **stamps** (99×56) in `images/stamps/`. Credit art you didn't make, and download it rather than hotlinking someone else's site.

## Background
- **Collage (every page except Math):** browsers can't show `.psd` files. Export a flattened JPEG from
  Photoshop (File → Export → Export As → JPG, about 2560 px wide, quality ~70, aim under 1 MB) to
  `images/bg-collage.jpg`, or convert on the Mac without opening Photoshop:

  ```bash
  sips -s format jpeg -s formatOptions 70 -Z 2560 "path/to/collage.psd" --out images/bg-collage.jpg
  ```

  Then in `css/style.css` set `--bg-collage: url("../images/bg-collage.jpg");`.
- **Math pages (all of `math/`):** `images/real-analysis-bg.png` is pages 2–9 of the
  Real Analysis portfolio, tiled 4×2, ink only (transparent). CSS rotates it −30° at 9% opacity
  (`body.math-bg::before`) on plain paper.

## Look
Windows, buttons, inputs and scrollbars come from [98.css](https://github.com/jdan/98.css) 0.1.21 (MIT, pinned on unpkg, loaded before `css/style.css`). Wrap new content in its markup:

```html
<section class="window" aria-labelledby="my-heading">
  <div class="title-bar"><h2 class="title-bar-text" id="my-heading">My window</h2></div>
  <div class="window-body">…</div>
</section>
```

Radio buttons and checkboxes must be `<input id="x" …><label for="x">…</label>` (98.css draws the box on the label).

A tool page's main title bar carries its icon and a program name that screen readers skip:
`<h1 class="title-bar-text" id="…"><img src="../images/icons/plotter.svg" alt="" width="16" height="16" /> Function Plotter<span class="title-bar-program" aria-hidden="true"> - plotter.exe</span></h1>`.
Panels inside windows use 98's sunken look: `box-shadow: var(--bevel-in)` on a white background.

The glass and blue are overrides on top of 98.css, set by tokens at the top of `css/style.css`: `--sky` (page background), `--glass` (window face), `--title-bar`, `--gloss` (buttons), `--pressed`, `--select` and `--accent`. Change a token to recolor the whole site; keep white text on blue at 4.5:1 contrast or better.

## Fonts and credits
- [98.css](https://github.com/jdan/98.css) by Jordan Scales (MIT), including its Pixelated MS Sans Serif font, loaded from unpkg.

Self-hosted in `fonts/`, declared at the top of `css/style.css`:
- Rocket Pop + Rocket Pop Italic (Daniel Zadorozny / Iconian, via cufonfonts Y2K collection): free for personal use.
- Digit Lo-Fi (cufonfonts Y2K collection): no license listed on the download page.
- Minecraft (Craftron Gaming, dafont): 100% free.
- M PLUS Rounded 1c (Google Fonts, SIL Open Font License) for reading text.

The icons, stickers, desk objects and badges in `images/` were drawn for this site (SVG).
