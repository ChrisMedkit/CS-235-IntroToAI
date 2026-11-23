// Stickers: PNGs, GIFs and SVGs scattered over the pages (characters, things from your life,
// doodles). One line per sticker; js/script.js places them. Nothing else to edit.
//
//   src     image path from the site root, e.g. "images/stickers/cat.png" (required)
//   page    which page: "home", "index" (the splash), "tools", "me",
//           "math/plotter", "social/forum", ... ; "*" for every page; or a list ["home", "me"]
//   x       distance from the left: "8%" (moves with the window width) or a number of px
//   right   instead of x: distance from the right edge, e.g. "4%"
//   y       px from the top of the page (stickers scroll with the page)
//   w       width in px (height follows the image)
//   r       tilt in degrees (optional, e.g. -8)
//   front   true = on top of windows (keep it on corners and empty spots, never over text);
//           default is behind windows, where it shows in the margins and empty desktop
//   phone   true = also show on phones (screens under 768 px); others hide there
//   still   a non-moving copy of an animated GIF/SVG, shown when the visitor asks for less motion
//   pixel   true = keep pixel art crisp when scaled
//   href    makes the sticker a link (then give it alt text)
//   alt     text for screen readers: "" for pure decoration (the default)
//
// Tip: wide screens have empty margins left and right of the windows (x under ~12% or right
// under ~12%); the splash and Tools desktop have lots of open space.

/** @type {{src: string, page: string|string[], x?: string|number, right?: string|number, y: number, w: number, r?: number, front?: boolean, phone?: boolean, still?: string, pixel?: boolean, href?: string, alt?: string}[]} */
export const STICKERS = [
  // Splash
  { src: "images/stickers/sparkle.svg", page: "index", x: "14%", y: 120, w: 56, r: -10, pixel: true, phone: true },
  { src: "images/stickers/floppy.svg", page: "index", right: "14%", y: 440, w: 96, r: 10, pixel: true },

  // Home: beside the centered title (empty space at that height)
  { src: "images/stickers/sparkle.svg", page: "home", x: "16%", y: 92, w: 44, r: 8, pixel: true, front: true },

  // Tools desktop: open desktop space below and between the folders
  { src: "images/stickers/floppy.svg", page: "tools", right: "8%", y: 470, w: 88, r: 8, pixel: true },
  { src: "images/stickers/cd.svg", page: "tools", x: "6%", y: 520, w: 110, r: -10 },

  // Lab: it's under construction, after all

];
