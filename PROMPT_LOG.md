# Prompt Log — 8-Bit Casino Website

LLM(s) used: TODO (e.g. Claude, ChatGPT, GitHub Copilot)

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

## Reflection
TODO: what the LLM got wrong and how you caught it, which corrections you made yourself, what you would prompt differently, and how you made sure you understand and own the final code.
