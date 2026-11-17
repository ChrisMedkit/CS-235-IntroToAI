# Momentum in Tennis — Play-Money Odds Site

Creating a website using AI, documenting the pitfalls and successes of the LLM while ensuring correctness along the way.

CS235 Project 1 (AI-Assisted Coding). A static website that turns public
"Momentum in Tennis" models into point-by-point win chances and play-money odds.
No real money, no accounts.

How it works: models run offline (Python/R) and export predictions to `data/`.
The site's JavaScript reads those files and shows them in the browser.

## Run it locally

`fetch` doesn't work on `file://`, so open the site through a local server:

- **VS Code:** install the Live Server extension, right-click `index.html` → *Open with Live Server*.
- **Terminal:** `python3 -m http.server 5500`, then open http://localhost:5500.

Live site: *(add the GitHub Pages URL here after deploying)*

## Rebuild the data

```bash
python3 model/build_data.py
```

## Run the tests

```bash
node --test tests/js/*.test.js      # pages, wallet, odds, bets, blackjack, slots
python3 -m pytest tests/model -q    # tennis math and data build
```

## Structure

```
index.html          Home: banner, sport/mode picker, match replay + bet slip
model.html          How the Model Works
games.html          Mini Games: blackjack and slots
play-safe.html      Disclaimers, healthy habits, help lines, FAQ
css/style.css       Shared styles
js/script.js        Shared: wallet, menu, banner, FAQ, data loader
js/replay.js        Match replay and betting
js/blackjack.js     Blackjack table
js/slots.js         Slot machine
js/lib/             Rules with unit tests (wallet, odds, bets, blackjack, slots, carousel)
data/tennis/        Replay data (built by model/build_data.py)
model/              Python model and raw 2023 Wimbledon CSV
tests/              JS and Python tests
docs/               Prompt log, test report, reflection, design spec and plan
images/             Site images and credits
```

## Credits

Data: COMAP 2024 MCM Problem C. Methods: Klaassen & Magnus, *Analyzing Wimbledon* (2014).
Image sources are listed in `images/CREDITS.md`. Play money only — no real betting.
