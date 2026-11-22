# Christopia

A hub of study tools for applied math and computer science: a 2D/3D function plotter, a notes scanner, a Matrix Lab, a LaTeX scratchpad, and a Hub for planned tools (home server, smart home).

CS235 Project 1: Personal Interest Website with an LLM. See [OUTLINE.md](OUTLINE.md).

## Run
Static site, no build. Open `index.html` with VS Code Live Preview, or:

```bash
python3 -m http.server 8124
```

Tests (Node 18+, nothing to install): `npm test`

## Add a tool
1. Add an entry to `js/tools.js`.
2. Add `<tool>.html` (copy the header/nav/footer from any page) and `js/<tool>.js`.
3. Add the nav link to every page.

Live site: TODO (GitHub Pages URL)
