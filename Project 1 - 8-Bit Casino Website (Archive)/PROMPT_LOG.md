# Prompt Log — Longshot Website (originally "8-Bit Casino")

LLM(s) used: Claude Code (Claude Opus 5.5), chat-based agent in the Claude desktop app. It wrote files and ran tests and a browser in my project folder, one assignment step per request. TODO: add any other LLM you used (e.g. for the warm-up).

Record at least three significant features (page structure, navigation, CSS, responsive layout, JS feature; debugging exchanges count).

## 0. Project scaffold
| Field | Entry |
|---|---|
| Feature | Folder structure, empty page skeletons with TODOs, outline |
| LLM used | Claude Code (Claude Opus 5.5, agent in the desktop app) |
| Your prompt | `/assignment` with screenshots of the assignment spec |
| What it produced | `index.html`, `about.html`, `gallery.html` skeletons with a shared nav, empty `css/style.css` and `js/script.js` stubs, `OUTLINE.md`, `DIAGRAM.md` |
| Your decision | TODO: what you kept or changed, and why |

## 0b. Site plan (Step 3)
| Field | Entry |
|---|---|
| Feature | Site plan: games list and Home page layout |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | Answered its planning questions: games = Horse Racing, Slots, Blackjack, Roulette. "Home page should have an 8 bit ascii circus as the first thing a user sees when loading the site. Scroll down and there should be a scrolling gallery to select game mode." |
| What it produced | Updated the site plan in `OUTLINE.md`; changed the Home skeleton to a `<pre>` ASCII hero and a sideways-scrolling `#game-select` row of 4 cards linking to each game's rules on About (`about.html#slots` etc.); suggested CSS scroll-snap instead of JavaScript for the scroller, and `role="img"` + `aria-label` on the ASCII art |
| Your decision | TODO: what you kept or changed, and why |

## Warm-up (Step 2.4)
TODO: ask your LLM "What semantic elements should a personal website homepage include?" and note one thing you learned from the answer.

## 1. Home page structure (Step 4)
| Field | Entry |
|---|---|
| Feature | `index.html`: the Home page |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | "Yes, start Step 4" (with the site plan from `OUTLINE.md` as context: ASCII circus hero first, then a sideways-scrolling game-select gallery, Home/About/Gallery nav, `css/style.css` and `js/script.js`) |
| What it produced | Full Home page: `header` + `nav` (with `aria-current`), `main` with three `section`s: `#hero` (original ASCII big-top tent in a `<pre role="img">` with an `aria-label`, `h1`, tagline, "Pick a game" link to `#game-select`), `#game-select` (`ul.game-scroller` of 4 linked game cards, one-line blurbs it drafted), `#intro` (placeholder for my text + one `<img>` with alt text and width/height to avoid layout shift), and `footer`. Checked in the browser: renders, no console errors. |
| Your decision | TODO: e.g. kept the structure; rewrite the four card blurbs in my own words; replace the alt text once `images/home.png` exists; changes to the ASCII art? |

## 1b. Navigation and remaining pages (Step 5)
| Field | Entry |
|---|---|
| Feature | `about.html` and `gallery.html` with the same header, nav and footer as Home |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | "Yes, start Step 5" (context: the spec's Step 5 prompt: same header and nav on every page, About with two text sections, Gallery with a grid of six image placeholders) |
| What it produced | About: section 1 `#the-casino` (placeholders for my text + a play-money note), section 2 `#the-games` with one image and an `<article>` of short rules per game, with ids matching the Home card links. Gallery: intro line, six `<button>`-wrapped `<img>`s with descriptive alt text and width/height, and the lightbox `<dialog>`. It then ran a script to check that the header and footer are identical across pages (apart from `aria-current`) and that every link and `#anchor` exists, found the Home footer differed by a leftover comment and removed it, and removed an empty `src=""` on the lightbox image (invalid HTML). No console errors on any page. |
| Your decision | TODO: e.g. rewrite the rules and About text in my own words; match the gallery alt text to my real images |

## 2. CSS design + responsive layout (Step 6)
| Field | Entry |
|---|---|
| Feature | `css/style.css` for all three pages, mobile first |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | "Yes, start Step 6" (context: the design plan in `OUTLINE.md`: dark navy background, gold accent, pink hover, pixel font for headings only, header + horizontal nav, stack under 600px) |
| What it produced | Design tokens in `:root`; "Press Start 2P" (Google Fonts) for headings, nav and buttons, system font for body text; header/nav bar that stacks on phones with the current page highlighted in gold; ASCII art sized with `clamp()`; game cards in a sideways `scroll-snap` row where the next card peeks in; 1/2/3-column gallery grid (phone/600px/900px); lightbox, footer, `:focus-visible` outlines; smooth scrolling that turns off for `prefers-reduced-motion`. |
| Testing + fixes | It ran a local server and checked each page at 1280px and 375px: no horizontal page scroll anywhere. Found two problems and fixed them: (1) on phones the title broke at the hyphen as "8-" / "Bit" → wrapped "8-Bit Casino" in a `.nowrap` span; (2) the server log showed a `favicon.ico` 404 on every page → added an inline SVG favicon. Computed contrast for every color pair: all pass WCAG AA (lowest 5.15:1, pink on card background). The remaining 404s are the image files I haven't added yet. |
| Your decision | TODO: e.g. kept the palette; changed X because Y; one focused follow-up prompt you tried (the spec asks you to iterate one change at a time) |

## 3. Gallery lightbox JavaScript (Step 7)
| Field | Entry |
|---|---|
| Feature | `js/script.js`: click a gallery thumbnail to view it large, with previous/next and close |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | "Yes, start Step 7" (context: the stubbed functions and TODOs in `script.js`, and the lightbox behaviour in `OUTLINE.md`) |
| What it produced | `wrapIndex` (wrap-around with `((i % n) + n) % n`, because JS `%` keeps the sign so `-1 % 6` is `-1`), `showImage` (copies src + alt, caption "alt (n of 6)"), `openLightbox` (`dialog.showModal()`: backdrop, focus trap, Esc and focus return come free), `closeLightbox`, `moveBy`, and `initGallery` (click listeners, ←/→ keys, backdrop click; returns early on Home/About, which have no gallery). `npm test`: 4/4 pass. |
| Your decision | TODO: e.g. kept `<dialog>` instead of a hand-built overlay because…; anything you'd change |

## 4. Debugging: lightbox didn't open, and backdrop close (Step 7)
| Field | Entry |
|---|---|
| Feature | Fixing two problems found while testing the lightbox |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | (found during its own browser testing in the same Step 7 request) |
| What it produced | (1) Clicking a thumbnail did nothing, with no console error. Instead of changing code, it checked what the page had loaded: `openLightbox.toString()` still showed the old `// TODO` stub, so the browser was using a cached old `script.js` from the local Python server. A cache-bypassing reload fixed it, with no code change. (2) Before testing, it noticed its own first backdrop check (`event.target === lightbox`) would also close the dialog when clicking its padding, and changed it to also check the click is outside the dialog's rectangle. |
| Your decision | TODO: lesson, e.g. "hard-reload (⇧⌘R) after editing JS before assuming the code is broken" |

## 5. Redesign: black abyss theme and detailed ASCII art (after Step 9)
| Field | Entry |
|---|---|
| Feature | New color theme, button/menu effect, and Home ASCII art |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | "Change the site to have a black background with red and blue circus-like accents. I want the buttons and menus to fade from black to a color so that they look like they are coming out of an abyss. Finally make a more detailed ascii art for the home page." |
| What it produced | Checked contrast for candidate colors first, then picked red `#d6202b` / blue `#1f4fd8` for fills and brighter `#ff4d57` / `#6b95ff` for text on black. New `.abyss` class: a gradient from black (bottom) up into red or blue, twice the button's height, which slides up on hover/focus so the color "rises out of the abyss" (turned off for reduced-motion users). Applied to nav links (blue, current page red), "Pick a game", the game cards (alternating red/blue) and the lightbox buttons. Red/blue striped header, footer and lightbox borders. New 45-column ASCII art (a striped big top with two side tents, flags and a banner), generated with a small Python script to keep it symmetric after its first hand-drawn draft had the entrance one column off-center; CSS font shrinks to ~9.75px so it fits a 375px phone. Re-tested at 1280px and 375px: no sideways scroll, lightbox works, no JS errors. |
| Your decision | TODO: e.g. kept/changed the red and blue shades, the ASCII design, which elements got the fade |

## 6. Code review fixes (after the redesign)
| Field | Entry |
|---|---|
| Feature | Fixes from an LLM code review of the redesign |
| LLM used | Claude Code (Claude Opus 5.5), `/ponytail:ponytail-review` then "fix 1 and 2" |
| Your prompt | "fix 1 and 2" |
| What it produced | (1) The game cards' hover glow was cut off on the top and left: a box that scrolls sideways (`overflow-x: auto`) also clips vertically, and the cards touched its edges. Fix: padding on the scroller plus `scroll-padding-inline` so cards still snap correctly. Checked in the browser: glow shows on all sides, no sideways page scroll at 375px. (2) Merged two separate `prefers-reduced-motion` blocks into one so a future animation can't be added to one and missed in the other. |
| Your decision | TODO |

## 7. Playable games
| Field | Entry |
|---|---|
| Feature | Make Horse Racing, Slots, Blackjack and Roulette actually playable |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | "make the games playable" |
| What it produced | A new `play.html` page (added to the nav; Home cards now open it) and `js/games.js`. Shared play-money chips (start 100, saved in `localStorage`, Reset button; works without storage too). Pure, tested functions for the rules: `betError`, `slotsPayout`, `rouletteColor`/`roulettePayout`, `newDeck` (Fisher-Yates shuffle), `handValue` (aces 11 or 1), `blackjackPayout` (3:2 natural, push, bust), `pickWinner` (weighted horse odds); `tests/games.test.js` has 9 tests. Page wiring below: bet validation with messages, an `aria-live` result line per game, blackjack hides the dealer's second card and enables Deal/Hit/Stand at the right times, an animated race (skipped for reduced-motion users). |
| Testing + fixes | Played every game through the real buttons and checked each chip change against the rules (no mismatches). Found and fixed: (1) the race took ~40 s when the browser slowed timers (an unfocused pane, same as a background tab), because horses moved a fixed step per tick → steps now scale with real elapsed time; (2) on phones the roulette "Bet" label wrapped away from its box → label + control grouped. Also caught its own test mistake: a same-page `#hash` navigation isn't a reload, so it re-tested chip saving with a real reload. |
| Your decision | TODO: e.g. a separate Play page vs. games on About; the payout rules; anything you'd change |

## 8. Move the games into the shared script
| Field | Entry |
|---|---|
| Feature | Put the games code in `js/script.js` so the site has one shared JavaScript file, as the spec asks |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | "move the games code into script.js" |
| What it produced | Merged `js/games.js` into `js/script.js` as "Part 2" after the lightbox ("Part 1"), with one start-up that runs `initGallery()` and `initGames()` (each returns early on pages that don't need it) and one combined export list for `npm test`. Deleted `games.js`, removed its `<script>` tag from `play.html`, and pointed `tests/games.test.js` at `script.js`. Checked: 13/13 tests pass; no JS errors on any of the 4 pages; lightbox and all four games still work. (Entry 7 above describes the code when it was still in `games.js`.) |
| Your decision | TODO: e.g. why one file (matches the spec) vs. two (smaller files) |

## 9. Redesign: sleek sportsbook look ("Longshot")
| Field | Entry |
|---|---|
| Feature | Drop the 8-bit theme for a sleek sportsbook look |
| LLM used | Claude Code (Claude Opus 5.5, chat in the desktop app) |
| Your prompt | "Drop the 8-bit theme and make the website have a sleek sports book look". It then asked four questions; my answers: name = "use your judgment", hero = featured odds board, accent = gold, buttons = flat sleek (no abyss fade). |
| What it produced | Renamed the site "Longshot" and the 8-bit-joke horses (Gold Standard, Night Shift, Photo Finish, Long Shot). Rewrote `style.css`: near-black + one gold accent, Inter font, sticky top bar with pill tabs, rounded cards, `.btn` / `.btn-primary`, odds chips. Home hero: headline + "Featured race" odds board; each odds button opens `play.html?horse=N` with that horse picked (the URL value is checked, bad values fall back to horse 1). Play: American odds (+100…+700), blackjack cards drawn as white playing cards with a face-down hole card, results colored win/push/lose. Removed the ASCII art, pixel font, circus stripes and abyss fade. 2 new tests (odds format; Home board must match `HORSES`), 15/15 pass. Contrast re-checked: 23 pairs, lowest 5.39:1. |
| Testing + fixes | Clicked +300 → Play opened with Photo Finish picked. 80 plays across the games, 0 payout mismatches; no JS errors on any page; no sideways scroll at 375px. Found: on phones the header wraps to two rows (107px), taller than the anchor offset (96px), so section links tucked headings under it → bigger offset on phones, smaller on wider screens; re-checked all game links at both widths. |
| Your decision | TODO: e.g. keep "Longshot" or rename; the odds board; anything you'd change |

## Reflection
<!-- Write this yourself: the rubric grades your own thinking on corrections and ownership.
     Delete these notes when done. -->

Corrections on record, to draw on (from the entries above and `TEST_REPORT.md`):
- I changed the plan's Home page from a pitch + hero image to an ASCII circus hero and a sideways game-select gallery (Step 3).
- The LLM drafted the card blurbs and game rules; I need to decide what to rewrite in my own words (Steps 4–5).
- Title broke as "8-" / "Bit" on phones → `.nowrap` span; `favicon.ico` 404 → inline favicon (Step 6).
- The lightbox "didn't work" because the browser cached the old script, not because of a code bug (Step 7).
- Its first backdrop-close check would have closed the dialog on clicks inside its padding (Step 7).
- Images are still missing: the tests caught this, the LLM couldn't fix it because the art has to be mine (Step 8).

TODO, in your own words (a paragraph or two each):
1. What did the LLM get wrong or miss, and how did you catch it?
2. What did you change or reject, and why?
3. What would you prompt differently next time?
4. How do you know you understand the final code? Pick one piece (e.g. `wrapIndex` and why it adds `length` before the second `%`, or why the lightbox uses `<dialog>`) and explain it.
