# Momentum Tennis Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, play-money sportsbook site (4 pages) that replays 2023 Wimbledon matches with public-model win probabilities and odds, plus blackjack and slots, sharing one credit wallet.

**Architecture:** Plain HTML pages share one header/nav/footer, `css/style.css` and `js/script.js`. Pure logic (wallet, odds, bets, blackjack, slots) lives in small ES modules under `js/lib/`, which are unit-tested with Node's built-in test runner. Page UI files (`replay.js`, `blackjack.js`, `slots.js`) import them. A Python pipeline (`model/`) turns the raw CSV into `data/tennis/*.json`, which JS loads with `fetch` through one `loadData()` function.

**Tech Stack:** HTML5, CSS3, vanilla JS (ES modules, `<script type="module">`), Node 26 `node --test` for JS tests, Python 3.14 + pandas 3 + pytest 9 for the pipeline, VS Code Live Server for local viewing, GitHub Pages for hosting.

**Spec:** `docs/superpowers/specs/2026-11-16-momentum-tennis-site-design.md`

## Global Constraints

- Pages: `index.html`, `model.html`, `games.html`, `play-safe.html`. Nav labels, in order: Home · How the Model Works · Mini Games · Play Safe.
- `<header>`, `<nav>` and `<footer>` markup is byte-identical on every page, except for `aria-current="page"` on the current link.
- Footer on every page: `Play money only. No real betting.` with a link to `play-safe.html`.
- Header shows the credit balance on every page (element `id="wallet-balance"`).
- No inline styles (`style=` attributes or `<style>` tags). All CSS lives in `css/style.css`.
- Every `<img>` has non-empty `alt`.
- Look: dark sportsbook theme, bright green accent, bold sans-serif. Text contrast meets WCAG AA (4.5:1 for body text).
- Responsive: no horizontal scroll at 375px width.
- Never use the word "Live" for replayed data. Use "Replay".
- No real-money language (deposit, cash out, withdraw) except to say it isn't possible.
- No player photos, logos or trademarks. Images are openly licensed and credited in `images/CREDITS.md`.
- Wallet: `localStorage` key `mt_wallet`, start balance `1000`, in-memory fallback.
- House margin: one constant, `HOUSE_MARGIN = 0.05` in `js/lib/odds.js`.
- Data base URL: one constant, `DATA_BASE = 'data'` in `js/script.js`.
- Sports tabs: Tennis (active). Soccer, Football and Basketball are disabled and labeled "Coming soon".
- Banner slides are informational only. No bonus claims.
- Commit after every task. Commit messages end with the attribution lines from the session. Tasks marked 📝 get a prompt-log entry in `docs/prompt-log.md`.
- Run tests: `node --test tests/js/` and `python3 -m pytest tests/model -q`.
- View locally through VS Code Live Server (`fetch` fails on `file://`).

## Review Focus

1. **`localStorage` blocked, empty or holding junk** (`"abc"`, `-50`, `NaN`): the wallet should load as 1000 and keep working. Tested in Task 4.
2. **Bad stakes** (0, negative, decimals like 10.5, more than the balance, empty field): the bet should be refused with a message, and the balance should not change. Tested in Task 8.
3. **Data can't load** (opened via `file://`, a missing match file, or bad JSON): the replay area should show a clear message telling the visitor to use Live Server or reload, not a blank section or an uncaught error. Tested in Task 4.
4. **Open bets when the replay ends or the match is switched:** next-point and next-game bets still open at match end are refunded, and switching match refunds every open bet after a confirm. Tested in Task 8.
5. **Tiebreak and deuce scores** (`AD`, tiebreak counts like `9`, and the 10-point final-set tiebreak at 6-6): probabilities stay in [0, 1] and the scoreboard renders them correctly. Tested in Tasks 6 and 7.

---

### Task 1: Home page structure 📝

Assignment Step 4. Prompt-log entry: page structure.

**Files:**
- Create: `index.html`, `tests/js/pages.test.js`, `package.json`

**Interfaces:**
- Produces: the shared header/nav/footer block (copied verbatim in Task 2). Element ids used by later tasks: `wallet-balance`, `wallet-reset`, `nav-toggle`, `site-nav`, `banner`, `sport-picker`, `mode-picker`, `match-select`, `replay`, `bet-slip`, `replay-status`.

- [ ] **Step 1: Write `package.json`** with `"type": "module"` and `"scripts": {"test": "node --test tests/js/"}`. No dependencies.
- [ ] **Step 2: Write the failing test** `tests/js/pages.test.js`, which reads the HTML files with `fs` and uses regex checks only (no DOM library). For each page in `PAGES = ['index.html']` (Task 2 extends this):
  - `has semantic landmarks`: contains `<header`, `<nav`, `<main`, `<footer`, and at least one `<section`.
  - `links shared css and js`: contains `href="css/style.css"` and `<script type="module" src="js/script.js">`.
  - `no inline styles`: does not match `/\sstyle=/` or `/<style/`.
  - `every img has alt`: every `<img` tag matches `/alt="[^"]+"/`.
  - `footer disclaimer`: contains `Play money only. No real betting.`
  - `nav links`: contains `href="index.html"`, `href="model.html"`, `href="games.html"` and `href="play-safe.html"`.
- [ ] **Step 3: Run** `node --test tests/js/`. Expected: FAIL (index.html missing).
- [ ] **Step 4: Write `index.html`** with these parts:
  - The header has the site name "Momentum Tennis", the credit balance in `<span id="wallet-balance">1000</span> credits`, a `<button id="wallet-reset">Reset credits</button>`, and a `<button id="nav-toggle" aria-controls="site-nav" aria-expanded="false">Menu</button>`.
  - `<nav id="site-nav">` holds the four links, with `aria-current="page"` on Home.
  - `<main>` holds four sections:
    - `#banner`: an `aria-roledescription="carousel"` container with 3 placeholder slides, prev/next/pause buttons, and one placeholder `<img>` with alt text.
    - `#sport-picker`: four tab buttons. Soccer, Football and Basketball are `disabled`, with "Coming soon".
    - `#mode-picker`: three buttons, `data-mode="point|game|match"`.
    - `#replay`: holds `<select id="match-select">`, a scoreboard, `<svg id="momentum-chart">`, `<div id="bet-slip">`, and `<p id="replay-status" role="status">`.
  - The footer has the disclaimer and the Play Safe link.
- [ ] **Step 5: Run** `node --test tests/js/`. Expected: PASS. Open with Live Server. The page renders unstyled with no console errors.
- [ ] **Step 6: Add a prompt-log entry** (prompt, result, fixes). **Commit:** `feat: home page structure`.

### Task 2: Remaining pages and navigation 📝

Assignment Step 5. Prompt-log entry: navigation.

**Files:**
- Create: `model.html`, `games.html`, `play-safe.html`
- Modify: `tests/js/pages.test.js`

- [ ] **Step 1: Extend the test.** Set `PAGES` to all four files and add `shared chrome is identical`. It extracts `<header>…</header>`, `<nav…</nav>` and `<footer>…</footer>` from each page, removes ` aria-current="page"`, and asserts all four are equal to index.html's. It also asserts each page has exactly one `aria-current="page"`, on its own link.
- [ ] **Step 2: Run the test.** Expected: FAIL.
- [ ] **Step 3: Create the three pages** with the copied header, nav and footer, plus placeholder sections:
  - `model.html`: sections `#overview`, `#point-model`, `#roll-up`, `#momentum`, `#odds`, `#limits`, `#sources`, and one placeholder `<img>` with alt.
  - `games.html`: `#game-grid` with three cards (Blackjack, Slots, a locked "Coming soon"), `#blackjack` and `#slots` sections, and scripts `js/blackjack.js` and `js/slots.js` as modules.
  - `play-safe.html`: `#disclaimer`, `#habits`, `#warning-signs`, `#help`, and `#faq`.
- [ ] **Step 4: Run the test.** Expected: PASS. In the browser, click every nav link on every page.
- [ ] **Step 5: Add a prompt-log entry. Commit:** `feat: add model, games and play-safe pages`.

### Task 3: Sportsbook stylesheet, responsive layout, images 📝

Assignment Step 6. Prompt-log entry: CSS design and responsive layout.

**Files:**
- Modify: `css/style.css`, all four HTML pages (only to swap in real images)
- Create: `images/*.jpg|webp` (at least 2), `images/CREDITS.md`

- [ ] **Step 1: Pick images.** Propose 2–3 openly licensed photos (CC0/public domain, or the Unsplash/Pexels license): a tennis court, a ball, a racket. **Ask the owner before downloading**, giving each file's name, source URL and size. Save the approved ones to `images/`, under 300 KB each, and record their source URL, author and license in `images/CREDITS.md`.
- [ ] **Step 2: Write `css/style.css`:**
  - Color tokens on `:root` (dark background, surface, text, muted text, green accent, red for losses).
  - A system sans-serif font stack. Header, nav and footer styles. A grid/flex layout. Odds boxes. Buttons with hover and `:focus-visible` states.
  - A `prefers-reduced-motion` block that turns off transitions.
  - A breakpoint at 600px: the nav collapses behind `#nav-toggle`, and the sections stack.
  - Use `.nav-open` on `#site-nav` for the open state (Task 4 toggles it).
- [ ] **Step 3: Check it.**
  - At desktop width and at 375px in browser devtools, run `document.documentElement.scrollWidth <= window.innerWidth` in the console on each page. Expected: `true`.
  - Check the text and accent colors with a contrast checker. Expected: ≥ 4.5:1 for body text.
- [ ] **Step 4: Run** `node --test tests/js/`. Expected: PASS (no inline styles crept in).
- [ ] **Step 5: Add a prompt-log entry. Commit:** `feat: sportsbook stylesheet and images`.

### Task 4: Shared script: wallet, nav toggle, data loader

Assignment Step 7 begins.

**Files:**
- Create: `js/lib/wallet.js`, `tests/js/wallet.test.js`, `data/tennis/index.json`, `data/tennis/match-sample.json`
- Modify: `js/script.js`

**Interfaces:**
- Produces in `js/lib/wallet.js`:
  - `export const START_BALANCE = 1000`
  - `export function createWallet(storage) -> { getBalance(): number, canAfford(n): boolean, debit(n): boolean, credit(n): void, reset(): void, onChange(fn): void }`. `storage` is a `localStorage`-like object or `null`.
- Produces in `js/script.js`:
  - `export const wallet` (a `createWallet` result using `localStorage` if accessible, otherwise `null`)
  - `export const DATA_BASE = 'data'`
  - `export async function loadData(sport: string, path: string) -> object`. It fetches `${DATA_BASE}/${sport}/${path}` and throws `Error('Could not load data. Open the site with Live Server or reload.')` on a network error, a non-OK status or bad JSON.
- **Data contract** (both JSON files, and Task 7 output):
  - `index.json`: `{ "sport":"tennis", "matches":[{ "id", "players":[p1,p2], "round", "file":"match-<id>.json", "summary" }] }`
  - `match-<id>.json`: `{ "id", "players":[p1,p2], "best_of":5, "winner":1|2, "points":[Point] }`
  - `Point`, with **state before the point is played**: `{ "n", "set", "game", "server":1|2, "sets":[a,b], "games":[a,b], "score":[str,str], "tiebreak":bool, "p_serve":[p1,p2], "p_point":[p1,p2], "p_game":[p1,p2], "p_next_game":[p1,p2], "p_match":[p1,p2], "momentum":number, "winner":1|2 }`. `p_point` is each player's chance of winning this point. `p_game` covers the game in progress. `p_next_game` covers the next game from 0–0. `momentum` is in [-1, 1], where positive means player 1.

- [ ] **Step 1: Write failing tests** in `tests/js/wallet.test.js`, using a fake storage object:
  - `starts at 1000 with empty storage`
  - `falls back to 1000 when stored value is junk`, with stored values `"abc"`, `"-50"` and `"NaN"` (Review Focus 1)
  - `works with null storage`: debit and credit change the in-memory balance.
  - `storage that throws on setItem does not crash`
  - `debit refuses more than balance, zero, negative, non-integer`: returns `false`, and the balance is unchanged.
  - `credit then reload from same storage persists`
  - `reset returns to 1000`
- [ ] **Step 2: Run** `node --test tests/js/`. Expected: FAIL.
- [ ] **Step 3: Implement `js/lib/wallet.js`.** Balance is a whole number. Every read goes through a `try/catch` and validation.
- [ ] **Step 4: Run tests.** Expected: PASS.
- [ ] **Step 5: Write the hand-made `match-sample.json`.** It has 12 points following the contract: two games and one `AD` score. Write an `index.json` that lists it.
- [ ] **Step 6: Implement `js/script.js`.**
  - Export `wallet`, `DATA_BASE` and `loadData`.
  - On `DOMContentLoaded`: render the balance into `#wallet-balance` and keep it in sync with `onChange`. `#wallet-reset` asks `confirm('Reset credits to 1000?')`, then resets. `#nav-toggle` toggles `.nav-open` and `aria-expanded`.
  - When the balance reaches 0, show a small notice in the header: "Out of credits — reset to keep playing", with the reset button. Spec §9: offer the reset, don't block.
- [ ] **Step 7: Check it in the browser.**
  - Balance shows 1000 on all pages.
  - `wallet.debit(100)` from the console (`import('/js/script.js')`) updates the header. After a reload on another page it shows 900.
  - The menu toggles at 375px.
  - With the site opened via `file://`, a temporary `loadData('tennis','index.json')` in the console rejects with the friendly message (Review Focus 3).
- [ ] **Step 8: Commit:** `feat: wallet, nav toggle and data loader`.

### Task 5: Banner carousel

**Files:**
- Create: `js/lib/carousel.js`, `tests/js/carousel.test.js`
- Modify: `js/script.js`, `index.html` (final slide content)

**Interfaces:**
- Produces: `export function nextIndex(i, n, dir) -> number`, which wraps around: `nextIndex(2,3,1) === 0` and `nextIndex(0,3,-1) === 2`.

- [ ] **Step 1: Write failing test** `wraps forward and backward`, using the values above plus `nextIndex(1,3,1) === 2`.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Wire the carousel in `script.js`** (only if `#banner` exists).
  - Auto-advance every 6 s. Prev and next buttons. The pause button toggles its label between Pause and Play and sets `aria-pressed`.
  - Don't auto-advance when `matchMedia('(prefers-reduced-motion: reduce)').matches`.
  - Pause while hovered or focused.
  - Slide content (informational only): "Featured replay: the 2023 final", "Bet on the next point, the next game or the match", "New: Blackjack and Slots". Each links to `#replay` or `games.html`.
- [ ] **Step 6: Check it in the browser.** It advances, the arrows work, and pause holds. Turn on reduced motion (devtools → Rendering → emulate) and confirm there's no auto-advance.
- [ ] **Step 7: Commit:** `feat: banner carousel`.

### Task 6: Tennis probability math (Python)

**Files:**
- Create: `model/tennis_math.py`, `tests/model/test_tennis_math.py`, `model/README.md`
- Create: `model/raw/2024_Wimbledon_featured_matches.csv` and `model/raw/2024_data_dictionary.csv`, copied from the owner's `…/Math Modeling/2024_MCM_Problem_C_Data/`

**Interfaces:**
- Produces:
  - `p_game(p: float, a: int, b: int) -> float`: the server wins the game from points a–b (0,1,2,3…, with deuce handled).
  - `p_tiebreak(p1: float, p2: float, a: int, b: int, first_to: int, server_first: int) -> float`: player 1 wins the tiebreak. `p1` and `p2` are each player's serve-point win chance. Serve rotation follows the standard 1-then-2-2 pattern.
  - `p_set(p1, p2, g1, g2, server: int, final_set: bool) -> float`: player 1 wins the set from games g1–g2 (start of a game). At 6–6 the tiebreak is first to 7, or first to 10 if `final_set`.
  - `p_match(p1, p2, s1, s2, g1, g2, a, b, server, in_tiebreak, best_of=5) -> float`: player 1 wins from the full current state.
  - `estimate_serve(won: int, played: int, baseline: float, k: int = 20) -> float`: returns `(won + k*baseline) / (played + k)`.
  - `update_momentum(m: float, p1_won: bool, p1_expected: float, lam: float = 0.9) -> float`: returns `lam*m + (1-lam)*(x - p1_expected)`, where `x` is 1 or 0, clamped to [-1, 1].
- Use `functools.lru_cache` recursion over the score state. Probabilities are rounded only at output time.

- [ ] **Step 1: Write failing tests:**
  - `test_game_even`: `p_game(0.5,0,0) == pytest.approx(0.5)`
  - `test_game_known`: `p_game(0.6,0,0) == pytest.approx(0.7357, abs=1e-3)`
  - `test_game_deuce_symmetry`: `p_game(p,3,3) == pytest.approx(p*p/(p*p+(1-p)**2))` for p = 0.55 and 0.7
  - `test_game_finished`: `p_game(0.6,4,2) == 1` and `p_game(0.6,1,4) == 0`
  - `test_tiebreak_even`: `p_tiebreak(0.6,0.6,0,0,7,1) == pytest.approx(0.5)`, also with `first_to=10`
  - `test_set_even` and `test_match_even`: equal serve gives 0.5 from 0–0.
  - `test_match_monotone`: `p_match(0.68,0.62,0,0,0,0,0,0,1,False) > 0.5`
  - `test_match_terminal`: `s1=3` gives 1.0
  - `test_all_in_range`: over a grid of p values and states (including tiebreak 9–9, final set 6–6), every result is in [0, 1] (Review Focus 5).
  - `test_estimate_serve_prior`: `estimate_serve(0,0,0.673) == pytest.approx(0.673)`
  - `test_momentum_bounds`: 500 wins in a row stay ≤ 1.
- [ ] **Step 2: Run** `python3 -m pytest tests/model -q`. Expected: FAIL.
- [ ] **Step 3: Implement `model/tennis_math.py`.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Write `model/README.md`:**
  - Data source (2024 MCM Problem C), which the owner may publish.
  - Methods: independent points (Klaassen & Magnus, *Analyzing Wimbledon*, 2014), serve estimate with a prior (`k=20`, baseline = the dataset's serve-point win rate, about 0.673), and EWMA momentum (λ = 0.9).
  - Version 1 shows momentum but does not feed it into the point model.
  - How to run the pipeline.
- [ ] **Step 6: Commit:** `feat: tennis probability math with tests`.

### Task 7: Build match JSON from the CSV

**Files:**
- Create: `model/build_data.py`, `tests/model/test_build_data.py`
- Replace: `data/tennis/index.json`. Create: `data/tennis/match-<id>.json`. Keep `match-sample.json` for JS tests only and drop it from `index.json`.

**Interfaces:**
- Consumes: Task 6 functions and the data contract from Task 4.
- Produces:
  - `parse_point_score(s: str, tiebreak: bool) -> int` (`"0"→0`, `"15"→1`, `"30"→2`, `"40"→3`, `"AD"→4`, tiebreak digits → int)
  - `build_match(df_match: DataFrame, baseline: float) -> dict`
  - `main(csv_path, out_dir)`, run as `python3 model/build_data.py`

- [ ] **Step 1: Write failing tests:**
  - `test_parse_scores`, including `AD` and tiebreak `"9"`.
  - `test_build_final`: build `2023-wimbledon-1701` (Alcaraz v Djokovic) and assert:
    - `winner == 1` (Alcaraz is player1)
    - the point count equals the CSV row count
    - every `p_*` value is in [0, 1], and each pair sums to 1 ± 1e-6
    - `points[0]['p_match']` is within 0.3–0.7
    - `momentum` is within [-1, 1]
    - every key in the contract is present on every point
  - `test_serve_estimate_uses_only_past_points`: point n's `p_serve` comes only from points before n (no peeking).
  - `test_index_lists_all_files`: run `main` into `tmp_path`. `index.json` lists 31 matches, and each `file` exists.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** The baseline is the whole-dataset serve-point win rate. The final set is set 5. `tiebreak` is true when games are 6–6. **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Run the pipeline** with `python3 model/build_data.py`, then `du -sh data/tennis`. If the total is over 3 MB, shorten keys or round probabilities to 3 decimals (round to 3 decimals anyway).
- [ ] **Step 6: Commit** the script, the tests and the generated JSON: `feat: build tennis replay data from Wimbledon CSV`.

### Task 8: Match replay and betting 📝

Prompt-log entry: JavaScript feature (replay and betting).

**Files:**
- Create: `js/lib/odds.js`, `js/lib/bets.js`, `js/replay.js`, `tests/js/odds.test.js`, `tests/js/bets.test.js`
- Modify: `index.html` (add `<script type="module" src="js/replay.js">`)

**Interfaces:**
- Consumes: `wallet`, `loadData` (Task 4), and the data contract.
- Produces:
  - `odds.js`:
    - `export const HOUSE_MARGIN = 0.05`
    - `export function toDecimalOdds(p) -> number`: returns `1 / (clamp(p,0.02,0.98) * (1+HOUSE_MARGIN))`, rounded to 2 decimals, minimum 1.01.
  - `bets.js`:
    - `export function validateStake(raw: string, balance: number) -> {ok: true, stake: number} | {ok: false, error: string}`
    - `export function makeBet({mode, pick, stake, odds, point}) -> Bet`, where `Bet = {id, mode, pick, stake, odds, target}`. The target depends on the mode:
      - `point`: the index of the next unplayed point
      - `game`: `{set, game}` of the next game not yet started
      - `match`: `'match'`
    - `export function settle(bet, points, idx, matchWinner) -> null | {won: boolean, payout: number}`. It returns `null` while unresolved. `payout = won ? Math.floor(stake*odds) : 0`.
    - `export function matchBettingOpen(point) -> boolean`: false once both players have 2 sets (the final set has begun).

- [ ] **Step 1: Write failing tests:**
  - `toDecimalOdds(0.5) === 1.9`, `toDecimalOdds(0.99) === 1.01` (clamped), `toDecimalOdds(0.001) === 47.62`
  - `validateStake` for `''`, `'0'`, `'-5'`, `'10.5'`, `'abc'`, and `'2000'` with balance 1000 → not ok, each with a message. `'50'` → ok (Review Focus 2).
  - `settle` a point bet: `null` before its point, then won/lost correctly once played.
  - `settle` a game bet resolves on the last point of the target game, using `match-sample.json`.
  - `settle` a match bet: `null` until the end, then resolves using `matchWinner`.
  - `matchBettingOpen` is false at sets [2,2].
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement `odds.js` and `bets.js`.** **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Implement `js/replay.js`.**
  - Load `index.json` and fill `#match-select`, defaulting to the final. If loading fails, put the error message in `#replay-status` (Review Focus 3).
  - The replay ticks one point per interval. Default 2.5 s, with speed options 0.5×, 1× and 2×, plus play/pause, step, and "jump to set N".
  - Each tick: update the scoreboard (show `AD` and tiebreak counts as-is), win-% bars from `p_match`, and redraw `#momentum-chart` as an SVG polyline of `momentum` so far (hand-drawn, no library).
  - Bet slip:
    - Mode from `#mode-picker`, and pick a player.
    - Odds come from the next unplayed point's `p_point`, `p_next_game` or `p_match`. They refresh every tick while the slip is open, and the replay keeps playing.
    - "Place bet" runs `validateStake`, then `wallet.debit`, then `makeBet` with the odds shown at the click.
    - At most one open bet per mode. The match-mode button is disabled when `matchBettingOpen` is false or the match is over.
  - Each tick: `settle` open bets, `wallet.credit(payout)` for wins, and announce results in `#replay-status`.
  - At the end of the replay, refund any bet `settle` can't resolve (Review Focus 4).
  - Switching match with open bets asks `confirm()`, then refunds all of them.
  - Stakes leave the wallet when a bet is placed, so a `beforeunload` handler credits open stakes back on reload or leave.
- [ ] **Step 6: Check it in the browser.**
  - Place one bet of each mode on the final at 2× speed.
  - Balances change by the expected amounts.
  - Odds in the open slip change between points.
  - Switching match with open bets refunds them after confirm.
  - Reload with an open bet: the balance is restored.
- [ ] **Step 7: Run** `node --test tests/js/`. Expected: PASS. **Add a prompt-log entry. Commit:** `feat: match replay with play-money betting`.

### Task 9: Blackjack

**Files:**
- Create: `js/lib/blackjack-rules.js`, `js/blackjack.js`, `tests/js/blackjack.test.js`

**Interfaces:**
- Produces:
  - `newDeck(rng=Math.random) -> Card[]`: 52 cards, shuffled with Fisher–Yates. `Card = {rank:'A'|'2'…'10'|'J'|'Q'|'K', suit:'♠'|'♥'|'♦'|'♣'}`
  - `handValue(cards) -> {total: number, soft: boolean}`
  - `isBlackjack(cards) -> boolean`
  - `dealerShouldHit(cards) -> boolean`: hits below 17 and stands on all 17s, soft 17 included.
  - `settleHand(player, dealer, stake, doubled) -> {result:'blackjack'|'win'|'push'|'lose', returned: number}`. `returned` is the total credited back: blackjack 2.5×stake, win 2×(stake, doubled if `doubled`), push the stake back, lose 0.

- [ ] **Step 1: Write failing tests:**
  - `handValue`: A+K = 21 soft; A+A+9 = 21 soft; A+9+5 = 15 hard; K+Q+5 = 25.
  - `dealerShouldHit`: true at 16, false at soft 17 (A+6), false at hard 17.
  - `settleHand`: player blackjack vs dealer 20 → `blackjack`, 25 returned on a stake of 10. Both blackjack → `push`, 10. Player bust → `lose` even if the dealer busts. Doubled win → 40 on a stake of 10.
  - `newDeck` has 52 unique cards.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement the rules.** **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Implement the `js/blackjack.js` UI** in `#blackjack`:
  - Stake input (`validateStake` from `bets.js`), then Deal, Hit, Stand, and Double (only on the first two cards, and only if the wallet can afford the extra stake).
  - The dealer's hole card stays hidden until the player stands.
  - Cards are drawn as styled `<div>`s with rank and suit, with an `aria-label` like "Ace of spades".
  - The result goes in a `role="status"` line. Reshuffle each hand.
- [ ] **Step 6: Check it in the browser.** Play about 10 hands and confirm each payout against the rules. **Commit:** `feat: blackjack`.

### Task 10: Slots

**Files:**
- Create: `js/lib/slots-rules.js`, `js/slots.js`, `tests/js/slots.test.js`

**Interfaces:**
- Produces:
  - `SYMBOLS`: an array of `{id, label, emoji, weight}`, tennis-themed (for example ball, racket, trophy, shoe, net, and a "🍓" strawberries nod). The builder picks the weights.
  - `PAYTABLE`: three-of-a-kind multipliers per symbol, plus an optional two-ball rule.
  - `spin(rng=Math.random) -> [id,id,id]`
  - `payout(reels, stake) -> number`
  - `expectedReturn() -> number`: the exact RTP, found by enumerating all weighted outcomes.

- [ ] **Step 1: Write failing tests:**
  - `expectedReturn()` is between 0.90 and 0.98.
  - `payout` matches `PAYTABLE` for one winning line and one losing line.
  - `spin` with a stubbed rng returns the expected symbols.
  - A simulation of 200,000 spins with a seeded rng (a small mulberry32 in the test) has an average return within ±0.02 of `expectedReturn()`.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** Tune the weights until the RTP test passes. **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Implement the `js/slots.js` UI** in `#slots`:
  - Stake input and a Spin button.
  - The reels animate briefly with a CSS class. Under reduced motion they show the result immediately.
  - Show the pay table, plus "Returns about N credits per 100 bet over time", computed from `expectedReturn()`.
  - Fill the RTP figures on both game cards (blackjack's card says about 99.5 with these rules, noted as approximate).
- [ ] **Step 6: Check it in the browser.** Spin 20 times. The balance changes match the pay table. **Commit:** `feat: slots`.

### Task 11: Model page and Play Safe content, FAQ accordion

**Files:**
- Modify: `model.html`, `play-safe.html`, `js/script.js`, `css/style.css`

- [ ] **Step 1: Write `model.html` content** for each section listed in Task 2. Include:
  - The serve formula, `(won + 20·0.673)/(played + 20)`.
  - A worked example: from p = 0.6 a server holds about 74%.
  - The momentum formula with λ = 0.9.
  - How odds come from probability plus the 5% margin, with a worked example (50% → 1.90).
  - Limits: points aren't truly independent, and there's only one tournament of data.
  - Sources: Klaassen & Magnus, and COMAP 2024 MCM Problem C.
  - A static inline SVG chart of momentum from the final, made from the JSON at build time or copied once.
- [ ] **Step 2: Write `play-safe.html` content:**
  - The disclaimer: play money, no prizes, educational.
  - Healthy habits and warning signs.
  - Help: National Problem Gambling Helpline 1-800-GAMBLER (1-800-426-2537), and the Wisconsin Council on Problem Gambling (wi-problemgamblers.org, helpline 1-800-426-2535). Check both against their official sites before committing.
  - FAQ entries as `<details><summary>`, at least 5: "Can I cash out credits?", "Is this real gambling?", "Why does the house always win?", "How are the odds made?", "I ran out of credits".
- [ ] **Step 3: Enhance the accordion in `script.js`** so that opening one `<details>` in `#faq` closes the others. Without JS it still works natively.
- [ ] **Step 4: Run** `node --test tests/js/`. Expected: PASS. Click through the FAQ by keyboard (Tab, Enter). **Commit:** `feat: model explainer and play safe pages`.

### Task 12: Test pass, deploy, write-ups

Assignment Steps 8–9.

**Files:**
- Create: `docs/test-report.md`, `docs/reflection.md`
- Modify: `docs/prompt-log.md`, `README.md`

- [ ] **Step 1: Run** `node --test tests/js/` and `python3 -m pytest tests/model -q`. Expected: all PASS.
- [ ] **Step 2: Work through the spec's §11 checklist** in the browser at desktop and 375px widths. Record each item's pass/fail and any fix in `docs/test-report.md`, re-testing after each fix. Include the five Review Focus items.
- [ ] **Step 3: Owner action.** In the repo, go to Settings → Pages → deploy from `main` / root. Then open the Pages URL and repeat the nav, data-load and console checks there.
- [ ] **Step 4: Update the README** with the live URL, how to run locally (Live Server), how to rebuild the data, and how to run the tests. Check the prompt log has at least 3 entries. The owner writes `docs/reflection.md`; Claude may draft prompts for it, not the text.
- [ ] **Step 5: Commit and push:** `docs: test report, prompt log, readme`.
