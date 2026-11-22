# Longshot Website — Diagrams
See [OUTLINE.md](OUTLINE.md)

## Plan
```mermaid
flowchart TD
  S1["Step 1-3: content, images, site plan<br>images/, OUTLINE.md"] --> S4["Step 4: Home page<br>index.html"]
  S4 --> S5["Step 5: About + Gallery, shared nav<br>about.html, gallery.html"]
  S5 --> S6["Step 6: CSS + responsive<br>css/style.css"]
  S6 --> S7["Step 7: Lightbox JS<br>js/script.js, tests/script.test.js"]
  S7 --> S8["Step 8: Test and fix<br>TEST_REPORT.md"]
  S8 --> S9["Step 9: Pages deploy, log, submit<br>PROMPT_LOG.md"]
```
Each step ends with a commit, as the spec requires.

## Sitemap
```mermaid
flowchart TD
  H["Home<br>index.html"] <--> P["Play<br>play.html"]
  P <--> A["About<br>about.html"]
  A <--> G["Gallery<br>gallery.html"]
  G <--> H
  G --> L["Lightbox dialog<br>#lightbox"]
  H -- "game cards" --> P
  P -- "Rules links" --> A
```
All four pages share the same nav, so each links to the others. Home game cards open the Play page; each game links to its rules on About.

## Page wireframe (every page)
```mermaid
flowchart TD
  subgraph header["header.site-header"]
    logo["a.site-logo"]
    nav["nav.site-nav: Home / About / Gallery"]
  end
  subgraph main["main"]
    s1["section #hero odds board (Home) / #the-casino (About) / #gallery (Gallery)"]
    s2["section #game-select scroller / #the-games / dialog #lightbox"]
    s3["section #intro (Home only)"]
  end
  subgraph footer["footer.site-footer"]
    f["copyright, image credits"]
  end
  header --> main --> footer
```
Same header and footer on every page; the main sections change per page.

## Code structure
```mermaid
flowchart LR
  subgraph pages["HTML pages"]
    idx["index.html"]
    abt["about.html"]
    gal["gallery.html"]
  end
  css["css/style.css"]
  subgraph js["js/script.js"]
    init["initGallery()"]
    open["openLightbox(index)"]
    close["closeLightbox()"]
    move["moveBy(step)"]
    show["showImage(index)"]
    wrap["wrapIndex(index, length)"]
  end
  test["tests/script.test.js"]
  pages --> css
  pages --> init
  init --> open
  init --> close
  init --> move
  open --> show
  move --> wrap
  move --> show
  test --> wrap
```
All pages load the same stylesheet and script; `initGallery` returns early on pages with no `#lightbox`.

## Requirements → code
```mermaid
flowchart LR
  r1["3+ pages"] --> c1["index / about / gallery.html"] --> t1["Test 1: navigation"]
  r2["Consistent nav"] --> c2["header.site-header in each page"] --> t1
  r3["2+ images, alt text"] --> c3["img tags + images/"] --> t2["Test 2: images"]
  r4["Consistent design"] --> c4["css/style.css :root tokens"] --> t4["Test 4: responsive"]
  r5["JS feature"] --> c5["script.js lightbox"] --> t3["Test 3 + npm test"]
  r6["Responsive"] --> c6["@media min-width 600px"] --> t4
  r7["No errors / 404s"] --> c7["all pages"] --> t5["Tests 5-6: console, network"]
  r8["Prompt log + reflection"] --> c8["PROMPT_LOG.md"]
```
Each requirement, the file that meets it, and the test report item that checks it.
