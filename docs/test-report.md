# Test Report

Date: 2026-11-16 · Tested on a local no-cache server (same as VS Code Live Server) in a Chromium browser.
GitHub Pages checks are still to do after deploy (marked **Pending**).

## Automated tests

| Suite | Command | Result |
|---|---|---|
| JavaScript (pages, wallet, banner, odds, bets, blackjack, slots) | `node --test tests/js/*.test.js` | 68 passed, 0 failed |
| Python (tennis math, data build) | `python3 -m pytest tests/model -q` | 23 passed, 0 failed |

## Manual checklist (spec §11)

| Check | Result | Notes / fix |
|---|---|---|
| Every nav link works on every page | Pass | All 16 links return the right page. |
| No horizontal scroll at 375px (and 320px) | Pass after fix | Home page was 524px wide at 375px once the match list loaded: the longest match name stretched the page grid. **Fix:** `grid-template-columns: minmax(0, 1fr)` on `main` and a shrinkable dropdown. At 320px the scoreboard was 368px wide; **fix:** tighter scoreboard under 400px. Re-tested all pages at 320, 375, 768 and 1200px. |
| Desktop layout | Pass | Replay and bet slip sit side by side above 860px. |
| No console errors | Pass | Fresh tab, all 4 pages: no console errors. Photos added (`banner-court.jpg`, `model-ball.jpg`, credited in `images/CREDITS.md`) and `images/favicon.svg` linked. |
| Banner: arrows, pause, auto-advance | Pass | Next/prev wrap around; Pause shows "Play" and `aria-pressed="true"`; advances after 6 s. |
| Banner: reduce motion | Pass (code check) | Banner starts paused when `prefers-reduced-motion` is on; CSS turns off animations. The browser pane couldn't emulate the setting. |
| Replay loads every match | Pass | 31 matches listed, final first. |
| Replay: step, play, speed, jump to set | Pass | |
| Bets settle correctly | Pass | Point bet (lost 10), game bet (lost 20) and match bet each settled at the right moment. Payout = floor(stake × locked odds). |
| Odds match probabilities and margin | Pass | 50% → 1.90; unit tests cover clamping. |
| Odds lock at click; slip updates while playing | Pass | |
| Bad stakes refused (0, 10.5, abc, more than balance) | Pass | Clear message, balance unchanged. |
| Switching match / jumping settles open bets on the real result | Pass | After confirm: a 100-credit match bet on the loser stayed lost on jump; a 100-credit bet on the winner paid 190 on switch. (Changed from refunds after review — refunds let visitors cancel losing bets.) |
| Leaving the page settles open bets | Pass | `pagehide` settled a 50-credit point bet as lost (the pick lost that point); a second `pagehide` changed nothing. |
| Match betting closes in the final set | Pass | Button disabled with a reason. |
| Blackjack payouts | Pass | 10 hands checked by hand: wins pay 2×, dealer stands on soft 17, bust loses even when dealer would bust. |
| Slots payouts match pay table | Pass | 20 spins checked; exact return 92.4%, a 200,000-spin simulation agrees within 2%. |
| Wallet persists across pages and reloads | Pass | Debit on home showed on Mini Games. |
| Reset works; balance 0 shows the reset notice | Pass | |
| Wallet with blocked or junk storage | Pass (unit tests) | Falls back to 1,000 in memory. |
| Data can't load | Pass | Friendly message: "Could not load data. Open the site with Live Server or reload." |
| All images have alt text | Pass | Enforced by `tests/js/pages.test.js`; alt text describes the actual photos. |
| Color contrast (WCAG AA) | Pass | Lowest pair: muted text on cards, 6.8:1. |
| FAQ opens by keyboard, one at a time | Pass | Uses `<details>`; works without JavaScript too. |
| GitHub Pages: nav, data load, console | **Pending** | Owner turns on Pages, then re-checks. |
