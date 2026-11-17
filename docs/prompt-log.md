# Prompt Log

One entry per significant feature or debugging exchange (need at least 3).

---

## Entry 1 — Home page structure

- **Date:** 2026-11-16
- **Tool / LLM:** Claude Code (Opus 5.5)
- **Goal:** Plan the site with the LLM, then generate the semantic HTML for the home page.
- **Prompt (exact):**

  > There should be a banner at the top of the main page that scrolls through upcoming events, promotions, and different game modes/ ways to play. The user will then scroll down from that section and where they can select a sport to bet on or a game to play. The section below will show live and recently occurred statistics. and finally a button section displaying recently placed bets. Is there any section that needs to be strengthened, combined, or removed?

- **What the LLM gave back:** A critique: keep the banner; narrow "pick a sport" to tennis with other sports as "coming soon"; rename "live" stats to "Match Replay" since a static site can't be live; drop "recent bets" because there are no accounts. Then `index.html` with header/nav/main/footer, banner, sport and mode pickers, replay section, and bet slip.
- **What I changed / fixed:** Kept four sports as the long-term goal (disabled tabs). Removed recent bets. Added Play Safe, Model and Mini Games pages to the plan.
- **What I learned:** Asking the LLM to critique my layout before writing code changed the design more than any code prompt did. A structure test (`tests/js/pages.test.js`) checks semantic tags, alt text and the disclaimer automatically.
- **Commit:** see `git log` — "feat: home page structure"

---

## Entry 2 — Navigation and remaining pages

- **Date:** 2026-11-16
- **Tool / LLM:** Claude Code (Opus 5.5)
- **Goal:** Create the three subpages with the exact same header, nav and footer as the home page.
- **Prompt (exact):**

  > correct, one subpage will be for to explain correct relationships with gambling and include disclaimers. Additionally the second sub page will be for how to model works, and a 3rd page for mini games

- **What the LLM gave back:** `model.html`, `games.html` and `play-safe.html`, each built from the home page's header/nav/footer with `aria-current="page"` on its own link, plus placeholder sections.
- **What I changed / fixed:** The first test command (`node --test tests/js/`) crashed because Node treated the folder as a module path; switched to `tests/js/*.test.js`.
- **What I learned:** A test that compares the header/nav/footer of every page to `index.html` catches copy-paste drift automatically, so the nav can't silently get out of sync.
- **Commit:** see `git log` — "feat: add model, games and play-safe pages"

---

## Entry 3 — Sportsbook CSS and responsive layout

- **Date:** 2026-11-16
- **Tool / LLM:** Claude Code (Opus 5.5)
- **Goal:** One shared stylesheet with a sportsbook look that works on phones.
- **Prompt (exact):**

  > It should be a sportsbook look.

- **What the LLM gave back:** `css/style.css` with color tokens (dark surfaces, green accent, gold balance), pill tabs, odds buttons, a collapsible menu under 600px, a stacked replay layout under 860px, and a reduce-motion block.
- **What I changed / fixed:** The first browser check looked unstyled. The cause was the browser caching the earlier empty `style.css`, not a CSS bug; a hard reload fixed it.
- **What I learned:** Check `scrollWidth` vs `innerWidth` at 375px to prove there's no sideways scroll, and check contrast ratios with numbers instead of eyeballing.
- **Commit:** see `git log` — "feat: sportsbook stylesheet"

---

## Entry 4 — Match replay and betting (JavaScript feature)

- **Date:** 2026-11-16
- **Tool / LLM:** Claude Code (Opus 5.5)
- **Goal:** Replay a real Wimbledon match point by point with the model's win chances, a momentum chart, and play-money bets on the next point, next game or match.
- **Prompt (exact):**

  > keep the match playing to build a quick enviornment

- **What the LLM gave back:** `js/lib/odds.js` (probability → decimal odds with a 5% house margin), `js/lib/bets.js` (stake checks, bet targets, settling), and `js/replay.js` (scoreboard, SVG momentum chart, bet slip whose odds refresh every point and lock on click). Unit tests in `tests/js/odds.test.js` and `tests/js/bets.test.js`.
- **What I changed / fixed:** At the end of the replay the scoreboard showed the games from *before* the final point (5–4 instead of 6–4). Fixed by adding the last game and set to the winner in the final view.
- **What I learned:** Keeping the rules (odds, settling) in small files with tests made the UI file much easier to debug — the bugs left were display bugs, not math bugs.
- **Commit:** see `git log` — "feat: match replay with play-money betting"

---
