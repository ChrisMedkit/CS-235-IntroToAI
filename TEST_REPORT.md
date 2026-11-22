# Test Report — 8-Bit Casino Website

Tested in: TODO (browser + version), date: TODO

| # | Item | What I tested | What happened | Fix made |
|---|---|---|---|---|
| 1 | Navigation | Every nav link + logo on Home, About, Gallery | | |
| 2 | Images | All images load; every `<img>` has alt text | | |
| 3 | JS feature (lightbox) | Open each thumbnail; next past last; prev before first; arrow keys; Esc / X / backdrop close; keyboard only | Clicking image 6 opened "(6 of 6)"; → and Next wrapped to "(1 of 6)"; ← and Previous wrapped back to 6; a click inside the frame kept it open; X, Esc and a backdrop click each closed it; focus returned to the thumbnail; Tab + Enter opened it with no mouse. No console errors on any page. | At first a click did nothing: the browser had cached the old stub `script.js`. Fixed with a hard reload (no code change). Changed the backdrop check so clicks on the dialog's padding don't close it. |
| 4 | Responsive layout | Desktop width; phone (F12 → device toolbar, e.g. iPhone SE 375px); tablet | | |
| 5 | Console | F12 → Console on all three pages, no errors | | |
| 6 | Links and paths | F12 → Network, reload each page, no 404s | | |
| 7 | Unit tests | `npm test` (wrapIndex) | 4 tests, 4 pass: in range, past last → 0, before first → 5, single image stays 0 | none needed |
