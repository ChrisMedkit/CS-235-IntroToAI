# Christopia — Diagrams
See [OUTLINE.md](OUTLINE.md)

## Plan
```mermaid
flowchart TD
  subgraph M1["Milestone 1: content and structure"]
    S1["Step 1: text, images, tools.js"] --> S2["Step 2: LLM warm-up"]
    S2 --> S3["Step 3: Home hero + about"]
    S3 --> S4["Step 4: tool galleries (script.js)"]
    S4 --> S5["Step 5: nav + mobile menu"]
    S5 --> S6["Step 6: CSS + dark/light"]
  end
  subgraph M2["Milestone 2: math tools"]
    S7["Step 7: Plotter"] --> S8["Step 8: Matrix Lab"]
    S8 --> S9["Step 9: Scanner"]
    S9 --> S10["Step 10: LaTeX"]
    S10 --> S11["Step 11: Hub"]
  end
  subgraph M3["Milestone 3: CS and Social"]
    S12["Step 12: CS visualizers (cs-lib.js)"] --> S13["Step 13: Social (social-lib.js, storage.js)"]
  end
  subgraph M4["Milestone 4: finish"]
    S14["Step 14: test + debug"] --> S15["Step 15: deploy, log, reflection, submit"]
  end
  S6 --> S7
  S11 --> S12
  S13 --> S14
```
The plan steps in order, grouped into four milestones; commit after each step.

## Sitemap
```mermaid
flowchart TD
  NAV["Top nav (every page)"]
  NAV --> H["index.html: Home"]
  NAV --> M["math/index.html"]
  NAV --> C["cs/index.html"]
  NAV --> S["social/index.html"]
  NAV --> HB["hub.html: Hub"]
  M --> M1["plotter"] & M2["matrix"] & M3["latex"] & M4["scanner"]
  C --> C1["sorting"] & C2["data-structures"] & C3["graphs"] & C4["big-o"] & C5["regex"]
  S --> S1["forum"] & S2["events"] & S3["journal"]
  M4 -- "Open in LaTeX editor" --> M3
```
Five top-level destinations; each section's overview and sub-nav link its tool pages. The Scanner hands text to the LaTeX page.

## Home page wireframe
```mermaid
flowchart TD
  subgraph PAGE["index.html"]
    direction TB
    subgraph HEADER["header.site-header"]
      direction LR
      B["Logo + splash"] --- NV["nav: Home, Math, CS, Social, Hub"] --- TT["Dark mode, Sound"]
    end
    TK["div.ticker"]
    subgraph MAIN["main"]
      direction TB
      HERO["section#hero"]
      SEC["section#sections: 4 tiles"]
      GAL["section#tools: sideways gallery"]
      AB["section#about"]
      HERO --> SEC --> GAL --> AB
    end
    FOOT["footer: hit counter + badges"]
    HEADER --> TK --> MAIN --> FOOT
  end
```
Home page from top to bottom. Section pages add a `nav.sub-nav` bar under the ticker.

## Journal layout
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

## Code structure
```mermaid
flowchart LR
  subgraph shared["shared"]
    SC["script.js"]
    TL["tools.js"]
    ST["storage.js"]
  end
  subgraph libs["pure logic (tested)"]
    U["utils.js (math)"]
    CL["cs-lib.js"]
    SL["social-lib.js"]
  end
  MATH["plotter, matrix, latex, scanner .js"] --> U
  CS["sorting, structures, graphs, bigo, regex .js"] --> CL
  SOC["forum, events, journal .js"] --> SL & ST
  HJ["hub.js"] --> U & TL
  SC --> TL
  T["tests/*.test.js"] --> U & CL & SL
```
Page scripts import the pure library for their section; Social pages also go through `storage.js`.

## Plotter flow
```mermaid
flowchart TD
  A["input event (debounced)"] --> B["readWindow"]
  B --> C{"min < max?"}
  C -- no --> E1["#plot-error"]
  C -- yes --> D{"mode"}
  D -- 2D --> F["compileExpression per row, sample2D"]
  D -- 3D --> G["compileExpression per row, sampleSurface"]
  F --> H["Plotly.react #plot"]
  G --> H
```
How an edit becomes a redrawn graph.

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

## Journal unlock
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
  R1["3+ pages"] --> C1["17 html pages"]
  R2["Consistent nav"] --> C2["same header + sub-nav, aria-current"]
  R3["2+ images with alt"] --> C3["images/, hero + cards"]
  R4["Consistent design"] --> C4["style.css tokens + fonts"]
  R5["JS feature"] --> C5["script.js + tool scripts"]
  R6["Responsive"] --> C6["media queries, toggleNav"]
  R7["Tool logic correct"] --> C7["utils, cs-lib, social-lib"]
  C7 --> T1["tests/*.test.js"]
  C5 --> T2["TEST_REPORT item 3"]
  C1 & C2 --> T3["TEST_REPORT items 1, 6"]
  C6 --> T4["TEST_REPORT item 4"]
  C3 --> T5["TEST_REPORT item 2"]
  R8["Prompt log + reflection"] --> C8["PROMPT_LOG.md"]
```
Each spec requirement, the code that satisfies it, and the test or report item that checks it.
