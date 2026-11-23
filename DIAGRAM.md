# Christopia — Diagrams
See [OUTLINE.md](OUTLINE.md) and [REDESIGN_PLAN.md](REDESIGN_PLAN.md)

## Plan
```mermaid
flowchart TD
  subgraph DONE["Done"]
    D1["Site shell: nav, galleries, Home services panel"]
    D2["CS tools: sorting, data structures, graphs, Big-O, regex"]
    D3["Indie-web redesign 1-9 + glass and sky-blue look"]
    D4["Math tools: plotter, matrix, scanner, LaTeX"]
    D5["Social tools: forum, events, journal"]
    D1 --> D2 --> D3 --> D4 --> D5
  end
  subgraph NEXT["Still to do"]
    N1["Your content: text, photos, collage, friends"]
    N4["Redesign step 10: test report"]
    N5["Submit: prompt log, reflection, links"]
    N1 --> N4 --> N5
  end
  D5 --> N1
```
Where the project stands. Each box is one or more commits; `OUTLINE.md` has the details.

## Sitemap
```mermaid
flowchart TD
  SP["index.html: Splash"] -- "CD-ROM autorun" --> H["home.html: Home"]
  NAV["Top nav + Start menu (every page)"]
  NAV --> H
  NAV --> T["tools.html: Tools desktop"]
  NAV --> S["social/index.html: Social"]
  NAV --> ME["me.html: Me"]
  T --> MF["Math folder"] & CF["CS folder"]
  MF --> M1["math/plotter"] & M2["math/matrix"] & M3["math/latex"] & M4["math/scanner"]
  CF --> C1["cs/sorting"] & C2["cs/data-structures"] & C3["cs/graphs"] & C4["cs/big-o"] & C5["cs/regex"]
  S --> S1["social/forum"] & S2["social/events"] & S3["social/journal"] & S4["social/friends"]
  ME -- "desk objects" --> T & S & S3 & H
  M4 -- "Open in LaTeX editor" --> M3
```
Eighteen pages. The splash leads to Home; the nav and the Start menu reach every page. Tools is a desktop of folders; tool pages link back through their address bar (Math, CS) or sub-nav (Social).

## Splash and Home wireframes
```mermaid
flowchart TD
  subgraph SPL["index.html (splash)"]
    direction TB
    T1["h1.chrome-title + splash text"] --> SUB["subtitle"] --> CD["a.autorun: spinning CD + Click to run"] --> NOTE["best viewed in any browser"]
  end
  subgraph HOME["home.html"]
    direction TB
    HD["header: logo, nav (Home, Tools, Social, Me)"] --> TK["ticker"] --> T2["h1.chrome-title-small + tagline"]
    T2 --> PORTAL
    subgraph PORTAL["div.portal (3 columns at 1000 px+)"]
      direction LR
      L["Launch pad"] --- C["welcome.txt / All tools gallery"] --- R["Services control panel"]
    end
    PORTAL --> FT["footer: hit counter + badges"]
  end
  TB["taskbar: Start menu, task button, clock (every page)"]
  SPL -.-> TB
  HOME -.-> TB
```
The splash is just the title and a CD-ROM button; Home is the three-column portal.

## Tool page layout
```mermaid
flowchart TD
  HD["header + ticker"] --> NAV2["address bar (Math, CS) or sub-nav (Social)"]
  NAV2 --> MAIN
  subgraph MAIN["main.tool-layout (2 columns at 768 px+)"]
    direction LR
    W1["window: icon + Tool name - tool.exe (h1), controls"] --- W2["window: the work area (sunken white panel)"]
  end
  MAIN --> FT["footer"]
  FT --> TB["taskbar"]
```
Every tool page: two 98 windows, controls on the left and the stage on the right (stacked on phones).

## Sticker layers
```mermaid
flowchart BT
  BG["page background (sky gradient or collage; math paper)"] --> L0["sticker layer: behind (z 0)"]
  L0 --> C["page content: main, ticker, address bar, footer (z 1)"]
  C --> L5["sticker layer: front (z 5)"]
  L5 --> H["sticky header (z 10)"]
  H --> TB["taskbar + Start menu (z 40, 41)"]
```
Bottom to top: what paints over what. Both sticker layers cover the whole page, scroll with it, and let clicks through except on link stickers.

## Code structure
```mermaid
flowchart LR
  subgraph shared["shared (every page)"]
    SC["script.js: taskbar, menus, galleries, services panel, stickers, extras"]
    TL["tools.js: tool registry"]
    STK["stickers.js: sticker list"]
  end
  subgraph libs["pure logic (tested in Node)"]
    U["utils.js (math)"]
    CL["cs-lib.js"]
    SL["social-lib.js"]
    ST["storage.js"]
  end
  SC --> TL & STK & U
  DK["desktop.js (Tools)"] --> TL
  MATH["plotter, matrix, latex, scanner .js"] --> U
  CS["sorting, structures, graphs, bigo, regex .js"] --> CL
  RW["regex-worker.js"] --> CL
  CS -. "regex.js starts" .-> RW
  SOC["forum, events, journal, friends-page .js"] --> SL & ST
  SOC --> FR["friends.js: friends list"]
  T["tests/*.test.js"] --> U & CL & SL & ST & TL & STK
```
Page scripts import the pure library for their section; the data files (`tools.js`, `stickers.js`, `friends.js`) are the places you edit to add things.

## Visualizer pattern (Sorting, Graphs, Data Structures)
```mermaid
flowchart LR
  IN["user input"] --> LIB["cs-lib: compute all steps"]
  LIB --> ST["state.steps, pos = 0"]
  ST --> P{"Play or Step"}
  P --> AP["apply step pos, redraw, pos++"]
  AP --> D{"pos = steps.length?"}
  D -- no --> P
  D -- yes --> DONE["done: final state + stats"]
```
Compute first, animate after: the library is tested in Node, the page only replays.

## Regex matching with a time limit
```mermaid
sequenceDiagram
  participant P as regex.js (page)
  participant W as regex-worker.js
  P->>P: compile pattern (syntax errors shown at once)
  P->>W: pattern, flags, text, replacement
  alt finishes in under 1 s
    W-->>P: matches + replaced text
    P->>P: highlight, table, replace preview
  else still running after 1 s
    P->>W: terminate (start a fresh worker)
    P->>P: "Stopped after 1 s: this pattern backtracks too much"
  end
```
A runaway pattern can only be stopped by killing the thread it runs on, so matching lives in a worker.

## Plotter flow
```mermaid
flowchart TD
  A["input event (250 ms debounce)"] --> B["readWindow"]
  B --> C{"min < max?"}
  C -- no --> E1["#plot-error"]
  C -- yes --> D{"mode"}
  D -- 2D --> F["compileExpression per row, sample2D"]
  F --> BR["break the line at asymptotes"]
  D -- 3D --> G["compileExpression per row, sampleSurface"]
  BR --> H["Plotly.react #plot"]
  G --> H
  F & G -. "bad expression" .-> E1
```
How an edit becomes a redrawn graph. A row with a typo is skipped and named in the error line; the others still draw.

## Scanner to LaTeX
```mermaid
sequenceDiagram
  participant U as You
  participant SC as scanner.js
  participant T as Tesseract.js (in the browser)
  participant LS as localStorage
  participant LX as latex.js
  U->>SC: photo + Scan
  SC->>T: recognize(file, "eng")
  T-->>SC: progress updates, then text + confidence
  SC->>SC: cleanOcrText
  SC->>LS: christopia:lastScan
  U->>SC: Open in LaTeX editor
  SC->>LX: latex.html?from=scanner
  LX->>LS: read last scan
  LX->>LX: KaTeX preview, and Download .tex wraps it with toLatexDocument
```
The photo never leaves the browser; the two pages share the text through localStorage.

## Journal
```mermaid
flowchart LR
  subgraph LOCK["section#journal-lock"]
    SF["setup-form (first time)"]
    UF["unlock-form"]
  end
  subgraph APP["div#journal-app (after unlock)"]
    direction LR
    subgraph SIDE["aside: sidebar"]
      SR["search"] --- NP["+ New page"] --- FAV["Favorites"] --- TREE["page tree"] --- TR["Trash"]
    end
    subgraph ED["section: editor"]
      TB["breadcrumb, Saved, Favorite"] --> PH["icon + title"] --> BL["blocks"]
      BL -. "/" .-> SM["slash menu"]
    end
  end
  LOCK -- "right password" --> APP
  APP -- "Lock / idle 10 min" --> LOCK
```
The lock screen and the two-pane Notion-style app it opens.

```mermaid
sequenceDiagram
  participant U as You
  participant J as journal.js
  participant L as social-lib.js
  participant S as storage.js
  U->>J: password
  J->>S: load("journal-vault")
  S-->>J: salt, check, pages (encrypted)
  J->>L: deriveKey(password, salt)
  L-->>J: AES key (memory only)
  J->>L: decryptJSON(key, check)
  alt wrong password
    L-->>J: throws
    J-->>U: "Wrong password"
  else right password
    J->>L: decryptJSON(key, pages)
    J-->>U: open app
  end
```
The password never leaves memory and is never saved; a wrong key makes AES-GCM fail.

## Requirements → code
```mermaid
flowchart LR
  R1["3+ pages"] --> C1["18 html pages"]
  R2["Consistent nav"] --> C2["same header on every page, aria-current, Start menu sitemap"]
  R3["2+ images with alt"] --> C3["images/ (icons, desk, stickers, badges)"]
  R4["Consistent design"] --> C4["98.css + glass/blue tokens in style.css + fonts"]
  R5["JS feature"] --> C5["script.js + tool scripts"]
  R6["Responsive"] --> C6["media queries, Menu button, phone grids"]
  R7["Semantic HTML, no inline styles"] --> C7["header/nav/main/section/footer; positions in CSS classes"]
  R8["Tool logic correct"] --> C8["utils, cs-lib, social-lib, storage"]
  C8 --> T1["tests/*.test.js"]
  C5 --> T2["TEST_REPORT item 3"]
  C1 & C2 --> T3["TEST_REPORT items 1, 6"]
  C6 --> T4["TEST_REPORT item 4"]
  C3 --> T5["TEST_REPORT item 2"]
  R9["Prompt log + reflection"] --> C9["PROMPT_LOG.md"]
```
Each spec requirement, the code that satisfies it, and the test or report item that checks it.
