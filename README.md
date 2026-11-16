# Momentum in Tennis — Play-Money Odds Site

Creating a website using AI, documenting the pitfalls and successes of the LLM while ensuring correctness along the way.

CS235 Project 1 (AI-Assisted Coding). A static website that turns public
"Momentum in Tennis" models into point-by-point win chances and play-money odds.
No real money, no accounts.

How it works: models run offline (Python/R) and export predictions to `data/`.
The site's JavaScript reads those files and shows them in the browser.

## Structure

```
index.html        Home page
css/style.css     Shared styles
js/script.js      Shared JavaScript (reads data/ files)
data/             Model output (JSON/CSV)
images/           Site images
docs/             Prompt log, test report, reflection
```
