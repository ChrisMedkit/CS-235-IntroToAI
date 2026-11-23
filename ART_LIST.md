# Christopia — Art list

Every picture on the site, so you can swap in your own. All of them are placeholder SVGs drawn for the site.

**How to swap one:** save your file under the **same name** (PNG, JPG, GIF, WebP or SVG all work) and
keep the **same shape** (aspect ratio). Then the layout won't shift. If the extension changes (`cd.svg` → `cd.png`),
tell Claude and the references get updated. Transparent PNGs work best for stickers, icons and desk objects.
Draw at 2× the listed size so it stays sharp on phones and Retina screens.

## 1. Tool card images: 640 × 360 (16:9)
The preview picture on each tool's card, in the Home "All tools" gallery (all 13) and on the Social
overview (forum, events, journal, friends). The file name is the tool's `id` in `js/tools.js`.

- [ ] `images/plotter.svg`: Function Plotter
- [ ] `images/matrix.svg`: Matrix Lab
- [ ] `images/latex.svg`: LaTeX Scratchpad
- [ ] `images/scanner.svg`: Notes Scanner
- [ ] `images/sorting.svg`: Sorting Visualizer
- [ ] `images/structures.svg`: Data Structures
- [ ] `images/graphs.svg`: Graphs & Pathfinding
- [ ] `images/bigo.svg`: Big-O Playground
- [ ] `images/regex.svg`: Regex Builder
- [ ] `images/forum.svg`: Forum
- [ ] `images/events.svg`: Events
- [ ] `images/journal.svg`: Private Journal
- [ ] `images/friends.svg`: Friends

## 2. Desktop icons: 48 × 48 (square)
The icons on the Tools desktop. Each Math/CS tool page's title bar also uses them at 16 × 16, so keep them bold and simple.
Pixel art suits the 98 look.

- [ ] `images/icons/plotter.svg`
- [ ] `images/icons/matrix.svg`
- [ ] `images/icons/latex.svg`
- [ ] `images/icons/scanner.svg`
- [ ] `images/icons/sorting.svg`
- [ ] `images/icons/structures.svg`
- [ ] `images/icons/graphs.svg`
- [ ] `images/icons/bigo.svg`
- [ ] `images/icons/regex.svg`
- [ ] `images/icons/folder.svg`: **16 × 16**, the little folder beside the Home launch-pad links and in the Tools window

## 3. 88 × 31 buttons (exactly 88 × 31)
(`made-with-claude.svg` is no longer shown anywhere; its file is still in `images/badges/` if you want it back.)
The classic web buttons in every page's footer and on the Home "Buttons" wall. `christopia.svg` is also
the button other people copy from the Friends page to link to you, so make that one your best.

- [ ] `images/badges/christopia.svg`: Christopia's own button
- [ ] `images/badges/math-inside.svg`: "Σ Math inside"
- [ ] `images/badges/any-browser.svg`: "Best viewed in any browser"
- [ ] *(optional)* more of your own: add to `images/badges/` and the Home Buttons wall

## 4. Stickers (any size, transparent background)
Float over pages; placement is in `js/stickers.js` (README "Add a sticker" explains `x`, `y`, `w`, tilt).

- [ ] `images/stickers/sparkle.svg`: 32 × 32, splash and Home (marked `pixel: true`, drawn crisp)
- [ ] `images/stickers/new-burst.svg`: 64 × 64 "NEW!" starburst, splash and Home
- [ ] `images/stickers/cd.svg`: 64 × 64, splash and Tools
- [ ] `images/stickers/floppy.svg`: 48 × 48, splash and Tools (also the "Lab" object on the Me desk)
- [ ] `images/stickers/under-construction.svg` + `under-construction-still.svg`: 120 × 72, Lab page.
      The first can be an animated GIF; the "still" is its first frame, shown when someone has reduced motion turned on.
- [ ] *(new)* add any number of your own stickers. Characters, doodles and photos of your things work best.

## 5. Me page: your desk and you
The desk objects are links. Photos of your real things, cut out as transparent PNGs, look great here.
Position, size and tilt live in `css/style.css` (`.desk-calculator { --x; --y; --w; --r }`).

- [ ] `images/me/calculator.svg`: 60 × 110, links to Tools
- [ ] `images/me/notebook.svg`: 96 × 120, links to the Journal
- [ ] `images/me/phone.svg`: 50 × 104, links to Social
- [ ] `images/me/headphones.svg`: 110 × 96, links to "Now playing" on Home
- [ ] `images/me/polaroid.svg`: 90 × 106, links to About me (a real photo inside a polaroid frame works well)
- [ ] `images/stickers/floppy.svg`: the Lab link (shared with the sticker above; give it its own file if you want them different)
- [ ] `images/me/me.svg`: 96 × 96, your photo or self-portrait in about.txt. **Needs alt text** (`me.html`).

## 6. Other illustrations
- [ ] `images/hero.svg`: 640 × 360, the picture in Home's welcome.txt. **Needs alt text** (`home.html`).
- [ ] `images/door.svg`: 48 × 78, shown at 120 × 195, the "Enter" door on the splash page
- [ ] `images/bg-collage.jpg`: **not made yet.** Your Photoshop collage, the background of every page
      except Math (README "Background" has the export steps). Until then the sky gradient shows.
- [ ] `images/real-analysis-bg.png`: 1572 × 1078, already yours (your Real Analysis portfolio, faded, on Math pages)
- [ ] *(missing)* **favicon**: the little icon in the browser tab. The site has none yet; a 32 × 32 or 64 × 64 PNG
      (or SVG) of your logo or a Christopia doodle.

## 7. Empty folders waiting for art
- `images/buttons/`: **friends'** 88 × 31 buttons (saved with their permission), listed in `js/friends.js`
- `images/blinkies/`: 150 × 20 blinkies (small animated banners)
- `images/stamps/`: 99 × 56 stamps
- `images/gifs/`: any animated GIFs

## 8. Drawn in code (no image file)
These can't be swapped by uploading, but each can change in a line or two:
- **Logo / chrome title** (CSS gradient text in the Rocket Pop font): could become your own logo image.
- **Splash phrases** under the logo ("Converges!", "Q.E.D.!"…): `SPLASHES` in `js/script.js`.
- **Me desk surface** (wood stripes in CSS): could be a photo of your real desk.
- **Sky gradient + bubbles**, **sparkle cursor trail**, **Start-menu side banner**, **hit counter**, **menu blip sounds**.
