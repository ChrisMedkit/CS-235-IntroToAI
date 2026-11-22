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

## 2. TODO: feature (e.g. CSS design + responsive layout)
| Field | Entry |
|---|---|
| Feature | |
| LLM used | |
| Your prompt | |
| What it produced | |
| Your decision | |

## 3. TODO: feature (e.g. Gallery lightbox JavaScript)
| Field | Entry |
|---|---|
| Feature | |
| LLM used | |
| Your prompt | |
| What it produced | |
| Your decision | |

## 4. TODO: debugging exchange (paste the exact error)
| Field | Entry |
|---|---|
| Feature | |
| LLM used | |
| Your prompt | |
| What it produced | |
| Your decision | |

## Reflection
TODO: what the LLM got wrong and how you caught it, which corrections you made yourself, what you would prompt differently, and how you made sure you understand and own the final code.
