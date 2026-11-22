# 8-Bit Casino

A four-page website about a retro, 8-bit circus of play-money casino mini games: Horse Racing, Slots, Blackjack and Roulette. Built for CS235 (AI-Assisted Coding) with an LLM as a development partner.

## Pages
- **Home** (`index.html`): ASCII-art circus tent, then a sideways-scrolling row of game cards that open each game.
- **About** (`about.html`): what the casino is, and the rules of each game.
- **Play** (`play.html`): the four games, playable with shared play-money chips (start with 100, saved in your browser, Reset chips to start over).
- **Gallery** (`gallery.html`): six pictures; select one to open it in a lightbox with previous/next, arrow keys, and Esc/X/backdrop to close.

## Built with
Plain HTML, CSS and JavaScript (no frameworks): one shared `css/style.css` and one shared `js/script.js` (gallery lightbox) plus `js/games.js` for the Play page. Headings use the "Press Start 2P" font from Google Fonts.

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
