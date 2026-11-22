# Longshot

A four-page website for Longshot, a sleek play-money sportsbook and casino: Horse Racing, Slots, Blackjack and Roulette. Built for CS235 (AI-Assisted Coding) with an LLM as a development partner.

## Pages
- **Home** (`index.html`): headline plus a "Featured race" odds board (tap the odds to back a horse on the Play page), then a sideways-scrolling row of game cards that open each game.
- **About** (`about.html`): what the casino is, and the rules of each game.
- **Play** (`play.html`): the four games, playable with shared play-money chips (start with 100, saved in your browser, Reset chips to start over).
- **Gallery** (`gallery.html`): six pictures; select one to open it in a lightbox with previous/next, arrow keys, and Esc/X/backdrop to close.

## Built with
Plain HTML, CSS and JavaScript (no frameworks): one shared `css/style.css` and one shared `js/script.js` (Part 1: gallery lightbox; Part 2: the games on the Play page). Text uses the Inter font from Google Fonts (falls back to the system font).

## Run it
Open `index.html` in a browser, or in VS Code right-click it and choose **Show Preview**.

Unit tests for the lightbox and the game rules (needs Node.js):

```bash
npm test
```

## Assignment documents
- [PROMPT_LOG.md](PROMPT_LOG.md): prompt log and reflection
- [TEST_REPORT.md](TEST_REPORT.md): test report
- [OUTLINE.md](OUTLINE.md), [DIAGRAM.md](DIAGRAM.md): plan and diagrams
