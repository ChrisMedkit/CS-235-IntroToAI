# Test Report — Christopia

For each item: what you tested, what happened, and any fixes. Test the **live site**
(https://chrismedkit.github.io/cs235-christopia/) and note the browser you used.

The 19 pages: `index` (splash), `home`, `tools`, `me`, `lab`; `math/` plotter, matrix, latex, scanner;
`cs/` sorting, data-structures, graphs, big-o, regex; `social/` index, forum, events, journal, friends.

| # | Item | What I tested | Result | Fix |
|---|---|---|---|---|
| 1 | Navigation | On all 19 pages: every top-nav link, the Start menu sitemap and Random page, the address bar (Math/CS) or sub-nav (Social) links, and that the current page is marked in the nav. The splash door leads to Home. | TODO | |
| 2 | Images | Every image loads (icons, card images, desk objects, stickers, 88×31 buttons, door). Every `<img>` has alt text, or `alt=""` when it's decoration next to a text label. | TODO | |
| 3 | JavaScript features | **Shared:** Start menu (Esc closes it), phone Menu button, sound toggle, hit counter, stickers, dragging Tools windows. **Math:** plotter 2D, 3D, `1/x`, a typo like `sinx`; matrix RREF steps, a singular inverse, a non-square determinant, complex eigenvalues; scanner with a photo of your notes, then "Open in LaTeX editor"; LaTeX preview with broken math like `$\frac{$`. **CS:** each visualizer runs; regex `(a+)+$` stops after 1 s. **Social:** forum post, reply and vote; event RSVP until full, then download the .ics; journal setup, wrong password, lock and reload keeps pages, `/` menu, Markdown shortcuts, trash and restore; guestbook sign. | TODO | |
| 4 | Responsive layout | Desktop width and a phone (DevTools device toolbar, 375 px): no sideways scrolling, the Menu button works, tool pages stack, the Me desk becomes a grid, the journal sidebar sits above the editor. | TODO | |
| 5 | Console | No errors on any page (F12 → Console), including while using each tool. | TODO | |
| 6 | Links and paths | No 404s in the Network tab on any page (fonts, CDN libraries, images). | TODO | |

Unit tests: `npm test` → TODO: paste the pass/fail summary.
