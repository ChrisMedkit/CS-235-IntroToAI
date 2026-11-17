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
