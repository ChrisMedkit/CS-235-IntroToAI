# Momentum Tennis — Play-Money Sportsbook Site: Design

**Date:** 2026-11-16
**Repo:** github.com/ChrisMedkit/Momentum-Tennis
**Course:** CS235 Project 1, "Personal Interest Website with an LLM"

## 1. Intent and why

The owner's math modeling final is "Momentum in Tennis": a model that predicts
who wins the next point of a tennis match. Their group is spinning that idea off
into a gambling-style website. This repo is the CS235 version of that website.
It is a static site that turns **public** tennis models and methods into
point-by-point win chances and **play-money** odds. It also hosts two small
casino-style mini games.

The CS235 assignment grades the build process as much as the result: working
with an LLM, keeping a prompt log, committing after every step, and meeting
fixed technical requirements (see §4). The long-term goal is to grow the site
to four sports with a real server. This version must leave room for that
without building it.

## 2. Goals, non-goals, anti-goals

**Goals**
- A sportsbook-style site with 4 pages: Home, How the Model Works, Mini Games,
  and Play Safe.
- A working tennis "match replay" driven by real model output loaded from JSON.
- Play-money betting on tennis replays, plus blackjack and slots, all sharing
  one credit wallet.
- A data format and JS structure that can later switch from static files to a
  server, and from one sport to four, with small changes.
- Meet every CS235 requirement in §4.

**Non-goals (this version)**
- No server, database, accounts or login.
- No real money, payments, deposits or prizes of any kind.
- No working soccer, football or basketball models. They appear only as
  disabled "coming soon" choices.
- No "recent bets" feed. The owner dropped it, since without accounts the only
  bets the site could show would be the visitor's own.
- The owner's group model is not part of this version. Public methods only.

**Anti-goals (would make it a failure even if it works)**
- Anything that looks like real gambling: real-money language, deposit
  buttons, or no visible play-money disclaimer.
- Fake activity presented as real, such as made-up "other users' bets" or
  "live" labels on replayed data.
- Copying a real sportsbook's or casino game's branding, art or name.
- A site the owner cannot explain line by line. They must understand and own
  the code for the assignment.

## 3. Audience and tone

Classmates, the instructor, and the owner's math modeling group. The look is a
modern sportsbook: dark background, bright green accent, odds shown in tidy
boxes, and bold sans-serif type. The tone is fun but honest. It always reads
as a demo with play money.

## 4. Constraints (from the CS235 assignment)

- At least 3 pages, linked by an identical navigation menu on every page.
- At least 2 images that the owner made or has rights to use. No team logos,
  player photos or sportsbook screenshots unless they are clearly licensed.
- Consistent colors, fonts and layout across pages.
- At least one JavaScript interactive feature. This site has several.
- Responsive: works on desktop and on phones (about 375px wide).
- Semantic HTML (`header`, `nav`, `main`, `section`, `footer`).
- One shared external CSS file (`css/style.css`). No inline styles.
- One shared JS file (`js/script.js`) for interactive features. Page-specific
  JS files are allowed as additions, not as a replacement.
- Alt text on every image. Readable color contrast (aim for WCAG AA).
- Meaningful class names, helpful comments, consistent formatting.
- Commit to GitHub after every assignment step. Keep a prompt log covering at
  least 3 significant features (`docs/prompt-log.md`, already in the repo).
- Hosting: GitHub Pages (static only).

## 5. Approaches considered

| | Approach | Trade-off | Verdict |
|---|---|---|---|
| **A** | Plain HTML/CSS/JS. Python script writes model output to `data/*.json`. JS loads it with `fetch`. | Matches the future server: the server will return the same JSON, so only the URL changes. Needs a local server to test (VS Code Live Server), because `fetch` fails on `file://`. | **Chosen by owner** |
| B | Same, but data saved as `.js` files that set `window.TENNIS = {...}` | Works by double-clicking `index.html`. Swapping to a server later is messier, and large data files slow page loads. | Not chosen |
| C | React or another framework with a build step | Overkill. Fights the "plain shared CSS/JS file" rule and makes the prompt log harder to follow. | Dropped |

## 6. Site structure

```
index.html            Home (sportsbook)
model.html            How the Model Works
games.html            Mini Games (blackjack, slots)
play-safe.html        Play Safe: healthy gambling + disclaimers
css/style.css         All styles, shared
js/script.js          Shared: nav menu, wallet, banner, helpers
js/replay.js          Home: sport/mode picker, match replay, betting
js/blackjack.js       Mini Games: blackjack
js/slots.js           Mini Games: slots
data/tennis/          Model output (JSON)
model/                Python pipeline that builds data/tennis/
images/               Site images (owner-made or licensed)
docs/                 Prompt log, test report, reflection, this spec
```

Every page has the same `header`, `nav` and `footer`. The footer on every page
carries the line "Play money only. No real betting." with a link to Play Safe.
The header shows the visitor's credit balance on every page.

## 7. Page designs

### 7.1 Home (`index.html`)

Sections from top to bottom:

1. **Banner carousel.** Slides rotate through upcoming events (featured replay
   matches), promotions (for example "Double credits on your first blackjack
   hand"), and game modes. It auto-advances, has previous/next arrows and a
   pause button, and stops auto-advancing when the user has "reduce motion"
   turned on (`prefers-reduced-motion`). Slides link to the matching section or
   page. Designer's call: slides are informational only ("Featured replay:
   the 2023 final", "New: Slots"). No promotion claims a bonus the site
   doesn't actually give, which keeps it in line with the anti-goals.
2. **Pick a sport, then a mode.** Sport tabs: Tennis (active), plus Soccer,
   Football and Basketball (disabled, labeled "Coming soon"). Once Tennis is
   picked, the visitor picks a match from the replay list, then a mode:
   - **Next point:** who wins the next point.
   - **Next game:** who wins the current game.
   - **Match winner:** who wins the match.
3. **Match Replay (stats).** Replays a real 2023 Wimbledon match point by
   point, as if live, but labeled "Replay", never "Live". It shows the
   scoreboard, the model's win probability for each player, a momentum chart
   that updates each point, and play-money odds for the selected mode. The
   visitor places a bet from the bet slip, the replay advances, and the bet
   settles. Controls: play/pause, step to next point, and speed.

**Bet flow (designer's calls, owner can change):**
- A replay starts at point 1. A "jump to set" control lets the visitor skip
  ahead to the start of any set.
- **Owner's decision:** the replay keeps playing while the bet slip is open,
  for a fast, live feel. Odds in the open slip update with each point. They
  lock at the moment the visitor clicks "Place bet". A bet always applies to
  the next point/game that has not started yet. If the replay moves on while
  the slip is open, the slip shows the new odds before the click, never stale
  ones. The default replay speed should leave time to bet (the builder picks
  it, and the speed control still lets the visitor slow down).
- At most one open bet per mode at a time, so up to three open bets in total
  (next point, next game, match winner). Each settles when its event ends.
- The stake leaves the wallet when the bet is placed. Winnings (stake × locked
  decimal odds) are paid in when it settles.
- Open bets live only in memory. **Owner's decision (changed after review):** if
  the visitor reloads, leaves, switches match or jumps to a set with open bets,
  those bets are **settled immediately on the match's real result** (the whole
  match is already loaded), with a warning first when switching or jumping.
  Refunding instead would let visitors cancel any bet that was going badly.
  Bets are not saved in `localStorage`.
- Betting is closed once the match is over. "Match winner" betting closes
  after the final set begins, so the bet isn't free money.

### 7.2 How the Model Works (`model.html`)

A plain-language explainer of the public methods used (§8): how serve and
return stats become a point-win probability, how that rolls up into game and
match probabilities, what "momentum" means in the model, how probabilities
become odds (including the house margin), and the model's limits. It includes
at least one chart or diagram and cites its sources.

### 7.3 Mini Games (`games.html`)

A grid of game cards: Blackjack, Slots, and one locked "Coming soon" card.
Each card shows the game's approximate return to player (for example "returns
about 95 credits per 100 bet over time") to tie in the math theme and the Play
Safe message.

- **Blackjack:** one player against the dealer, one standard 52-card deck,
  reshuffled every hand. Hit, stand and double down. Blackjack pays 3:2, and
  the dealer stands on all 17s. No splitting or insurance in version 1.
- **Slots:** 3 reels and 1 payline, with the site's own symbols (tennis-themed
  is fine, for example ball, racket and trophy). A visible pay table. Reel
  results use `Math.random()` with set symbol weights. The pay table and
  weights are chosen so the long-run return is below 100%, and the page states
  that return.

Both games bet from and pay into the shared wallet.

### 7.4 Play Safe (`play-safe.html`)

Disclaimers (play money only, no prizes, not real gambling, for education),
healthy gambling habits, warning signs of problem gambling, and real help
resources. For example, the 1-800-GAMBLER helpline (US) and the Wisconsin
Council on Problem Gambling. An expandable FAQ (accordion) covers questions
such as "Can I cash out credits?" (no) and "Why does the house always win?"
(links to the model page).

## 8. Model and data pipeline

**Data:** the 2024 MCM Problem C dataset, which the owner has and may publish.
`2024_Wimbledon_featured_matches.csv` holds 31 matches and 7,284 points from
the 2023 Wimbledon men's singles (third round (last 32) onward), with one row per point.
Its columns include `match_id`, players, set/game/point numbers, score,
`server`, `point_victor`, aces, winners, errors, break points, distance run,
rally count, and serve speed. That CSV and `2024_data_dictionary.csv` are
copied into `model/raw/` and committed. The source is noted in
`model/README.md`. All 31 matches can be included if the JSON stays small;
otherwise the builder picks a featured subset, which must include the final.

**Methods (public, citable):**
- **Point model:** each player's chance of winning a point on serve, estimated
  from serve stats in the match so far, blended with a tournament baseline
  early in the match. This follows the standard independent-points approach
  (Klaassen & Magnus).
- **Rolling up:** the standard closed-form or recursive formulas turn
  point-on-serve probability into game, set and match win probabilities from
  the current score.
- **Momentum:** an exponentially weighted score of recent point outcomes (and
  optionally serve advantage removed), shown as the momentum chart. In version
  1 it is a displayed signal. Whether it adjusts the point model is left to the
  builder to try, and the model page must say which was done.

**Pipeline:** `model/build_data.py` (Python 3, pandas) reads the raw CSV and
writes the JSON files. It runs offline on the owner's machine. Output is
committed so GitHub Pages can serve it.

**Data contract (sport-agnostic, the same shape a future server returns):**

```
data/tennis/index.json          list of matches: id, players, round, date, summary
data/tennis/match-<id>.json     one match
```

Each match file holds the match metadata plus a `points` array. Each point
has: point number, server, score before the point, winner, and the model
output after it (`p_point_server`, `p_game`, `p_match` for each player, and
`momentum`). Odds are computed in JS from the probabilities plus a stated
house margin, so the margin can be changed in one place.

JS reads data through one function in `js/script.js`, such as
`loadData(sport, path)`, which builds the URL from a single `DATA_BASE`
constant. Moving to a server later means changing that constant only.

## 9. Wallet

- Stored in `localStorage` under one key. It starts at 1,000 credits.
- Shown in the header on every page.
- A "Reset credits" button sets it back to 1,000, with a confirm step.
- If the balance hits 0, offer the reset rather than blocking play.
- If `localStorage` is unavailable, fall back to an in-memory wallet for that
  visit, so the site still works.

## 10. Images

At least 2. Owner's decision: use free, openly licensed placeholder photos for
now (public domain/CC0, or the Unsplash/Pexels license, for example a tennis
court, ball or racket) for the banner and model page. Each is saved in
`images/` and credited in `images/CREDITS.md` with its source URL and license.
No player photos, logos or trademarks. The owner may swap in their own photos
later. Slot symbols and cards are drawn with CSS/emoji/SVG. Every image gets
alt text.

## 11. Testing (CS235 testing requirements)

Manual checks, recorded in `docs/test-report.md`:
- Every nav link works on every page.
- Layout at desktop width and about 375px wide. No horizontal scroll.
- No console errors on any page (served through Live Server and on GitHub
  Pages).
- Banner: arrows, pause, and reduced-motion behavior.
- Replay: loads each match, steps and plays, bets settle correctly, odds match
  the probabilities and margin.
- Blackjack: naturals, busts, dealer draws to 17, double down, and correct
  payouts.
- Slots: payouts match the pay table. A simulation of many spins (a small
  script or console run) confirms the stated return.
- Wallet persists across pages and reloads, reset works, and nothing breaks
  when the balance is 0.
- All images have alt text, and contrast passes a checker.

The Python pipeline gets a small check that the probabilities are between 0
and 1 and that each match's final `p_match` reaches 0 or 1 for the winner.

## 12. Build order and workflow

The assignment's steps are graded and run in this order: plan (step 3), home
page HTML (4), other pages and nav (5), CSS (6), interactive features (7),
testing (8), finalize (9). The plan follows that order. Inside step 7, the
work is split into smaller commits:

1. Data contract plus one small hand-made sample match JSON, so the replay can
   be built before the pipeline is done.
2. `script.js`: nav menu, wallet, banner, `loadData`.
3. Model pipeline (`model/build_data.py`) producing real JSON.
4. Match replay and betting.
5. Blackjack. 6. Slots. 7. Play Safe FAQ accordion.

Commit after each of these, not only after each assignment step.

**Workflow:** Claude Code is the LLM partner. Claude writes each piece, and
the owner reviews it, runs it, and commits it. Plan tasks are small enough
that the owner can explain every line. Code favors plain and readable over
clever: hand-drawn SVG for the momentum chart (no chart library), and simple
recursive formulas for the game/set/match roll-up. At least three tasks are
marked as prompt-log entries: page structure, CSS/responsive design, and the
match replay (plus any real debugging exchange along the way).

## 13. Decided by the owner

- Sportsbook look (not LaTeX).
- Home: banner carousel, then sport and mode picker, then live/recent stats
  (shown as a replay). No recent-bets section.
- Four sports eventually: soccer, tennis, football, basketball.
- No server for now. A server comes later.
- Subpages: Play Safe (healthy gambling and disclaimers), How the Model Works,
  Mini Games.
- Mini games: blackjack and slots.
- Approach A (JSON files plus `fetch`).
- Public models and methods only for now.

## 14. Calls made by the designer (owner can change)

- Tennis only works now. Other sports are disabled "Coming soon" tabs.
- Modes: next point, next game, match winner.
- "Replay" label instead of "Live".
- One shared wallet, 1,000 starting credits, stored in `localStorage`.
- Page-specific JS files in addition to the shared `script.js`.
- Data from the 2023 Wimbledon dataset (MCM 2024 Problem C).
- Blackjack rules in §7.3. Slots return below 100%, stated on the page.
- Help resources listed on Play Safe.

## 15. Left to the builder

Exact colors and fonts within the sportsbook look; banner slide content and
timing; how many matches to include in the replay list (keep the JSON small);
the house margin value; chart drawing method (canvas, SVG, or a small chart
library from a CDN); slot symbols, weights and pay table; exact copy text.
