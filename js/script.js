// Shared script for every page: mobile nav, taskbar + Start menu, galleries, early-internet extras.
// Tool pages add their own module (plotter.js, ...) for page-specific behavior.
import { TOOLS } from "./tools.js";
import { STICKERS } from "./stickers.js";
import { filterTools } from "./utils.js";

const root = () => document.body.dataset.root ?? ""; // "" at the site root, "../" in section folders

/**
 * Open/close a disclosure: the button's aria-expanded drives it, aria-controls names the target.
 * Mobile nav uses the .open class (CSS shows it on wide screens anyway); the Start menu uses `hidden`.
 * @param {HTMLButtonElement} button
 * @param {boolean} [open]  omit to toggle
 */
function setExpanded(button, open = button.getAttribute("aria-expanded") !== "true") {
  const target = document.getElementById(button.getAttribute("aria-controls"));
  if (!target) return;
  button.setAttribute("aria-expanded", String(open));
  if (target.id === "site-nav") target.classList.toggle("open", open);
  else target.hidden = !open;
}

/** Mobile Menu button and the Start button: click toggles; Esc or a click elsewhere closes. */
function initMenus() {
  const toggles = [...document.querySelectorAll(".nav-toggle, .start-button")];
  for (const button of toggles) button.addEventListener("click", () => setExpanded(button));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    for (const button of toggles) {
      if (button.getAttribute("aria-expanded") === "true") {
        setExpanded(button, false);
        button.focus();
      }
    }
  });
  document.addEventListener("click", (e) => {
    for (const button of toggles) {
      const target = document.getElementById(button.getAttribute("aria-controls"));
      if (!button.contains(e.target) && !target?.contains(e.target)) setExpanded(button, false);
    }
  });
}

/**
 * Home and section overview pages: re-render #tool-gallery from TOOLS (replacing the static
 * fallback cards). data-section="math|cs|social" on the list limits it to that section.
 */
function renderToolGallery() {
  const gallery = document.getElementById("tool-gallery");
  if (!gallery) return; // not a gallery page
  const section = gallery.dataset.section;
  const cards = TOOLS.filter((t) => t.status === "live" && (!section || t.category === section)).map(
    (tool) => {
      const img = document.createElement("img");
      Object.assign(img, {
        src: `${root()}images/${tool.id}.svg`,
        alt: `${tool.name} preview`,
        width: 640,
        height: 360,
        loading: "lazy",
      });
      const name = document.createElement("h3");
      name.textContent = tool.name; // textContent, never innerHTML
      const summary = document.createElement("p");
      summary.textContent = tool.summary;
      const link = document.createElement("a");
      link.href = root() + tool.href;
      link.append(img, name, summary);
      const card = document.createElement("li");
      card.className = "tool-card";
      card.append(link);
      return card;
    },
  );
  gallery.replaceChildren(...cards);
}

/* ---------- Taskbar + Start menu (Windows-98 style, built here so every page gets the same one) ---------- */

/**
 * The site map, shown as a tree in the Start menu and used by "Random page".
 * Folders list their pages from TOOLS, so a new tool shows up here by itself.
 */
const SITE = [
  { name: "Home", href: "home.html" }, // index.html is the splash page
  { name: "Tools", href: "tools.html", folders: [["Math", "math"], ["CS", "cs"]] },
  { name: "Social", href: "social/index.html", folders: [["Pages", "social"]] },
  { name: "Me", href: "me.html" },
];

/** Every page a visitor can open, as root-relative hrefs (for Random page). */
const allPages = () => [...SITE.map((p) => p.href), ...TOOLS.filter((t) => t.status === "live").map((t) => t.href)];

const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};
const link = (name, href) => el("a", { href: root() + href, textContent: name });

/** <ul class="tree-view"> sitemap: top pages, with tool folders as collapsible <details>. */
function siteTree() {
  return el(
    "ul",
    { className: "tree-view" },
    ...SITE.map((page) => {
      const li = el("li", {}, link(page.name, page.href));
      if (page.folders) {
        li.append(
          el(
            "ul",
            {},
            ...page.folders.map(([label, category]) =>
              el(
                "li",
                {},
                el(
                  "details",
                  {},
                  el("summary", { textContent: label }),
                  el(
                    "ul",
                    {},
                    ...TOOLS.filter((t) => t.status === "live" && t.category === category).map((t) =>
                      el("li", {}, link(t.name, t.href)),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      return li;
    }),
  );
}

function updateClock(clock) {
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Build the taskbar: Start button + menu (sitemap, Random page, Sound), current-page task, clock. */
function initTaskbar() {
  const menu = el(
    "div",
    { id: "start-menu", className: "start-menu window", hidden: true },
    el("div", { className: "start-menu-banner", ariaHidden: "true" }, "Christopia", el("b", { textContent: "98" })),
    el(
      "div",
      { className: "start-menu-items" },
      el("nav", { ariaLabel: "All pages" }, siteTree()),
      el("hr"),
      el("button", { type: "button", className: "start-item random-page", textContent: "Random page" }),
      el("button", { type: "button", className: "start-item sound-toggle", textContent: "Sound" }),
    ),
  );
  const start = el(
    "button",
    { type: "button", className: "start-button" },
    el("span", { className: "start-logo", ariaHidden: "true", textContent: "✦" }),
    "Start",
  );
  start.setAttribute("aria-expanded", "false");
  start.setAttribute("aria-controls", "start-menu");
  // The open "program": this page's title, like a 98 task button (decorative; the h1 says it already).
  const task = el("span", {
    className: "task-button",
    ariaHidden: "true",
    textContent: document.title.replace(/^Christopia: /, ""),
  });
  const clock = el("time", { className: "clock" });
  updateClock(clock);
  setInterval(() => updateClock(clock), 15_000);
  const bar = el("div", { className: "taskbar" }, start, task, el("div", { className: "tray" }, clock));
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Taskbar");
  document.body.append(menu, bar);

  menu.querySelector(".random-page").addEventListener("click", () => {
    const path = (url) => new URL(url, location.href).pathname.replace(/\/$/, "/index.html");
    const choices = allPages().filter((href) => path(root() + href) !== path(location.href)); // never "here"
    location.href = root() + choices[Math.floor(Math.random() * choices.length)];
  });
}

/* ---------- Stickers (the list lives in js/stickers.js) ---------- */

/** This page's sticker key: "index", "home", "tools", "math/plotter", ... (path from the site root). */
function pageKey() {
  const base = new URL(root() || "./", location.href).pathname;
  return location.pathname.slice(base.length).replace(/\.html$/, "") || "index";
}

/** One layer behind the windows and one in front; both ignore the mouse except on link stickers. */
function stickerLayer(name) {
  const layer = el("div", { className: `sticker-layer ${name}` });
  document.body.append(layer);
  return layer;
}

function initStickers() {
  const key = pageKey();
  const mine = STICKERS.filter((s) => [].concat(s.page).some((p) => p === "*" || p === key));
  if (!mine.length) return;
  const layers = { behind: stickerLayer("behind"), front: stickerLayer("front") };
  for (const s of mine) {
    const img = el("img", { src: root() + s.src, alt: s.alt ?? "", loading: "lazy", decoding: "async" });
    if (s.pixel) img.classList.add("pixel");
    let node = img;
    if (s.still) {
      // Animated sticker: browsers show the still copy when the visitor asked for less motion.
      const source = el("source", { srcset: root() + s.still });
      source.media = "(prefers-reduced-motion: reduce)";
      node = el("picture", {}, source, img);
    }
    if (s.href) node = el("a", { href: root() + s.href, className: "sticker-link" }, node);
    const sticker = el("div", { className: s.phone ? "sticker phone" : "sticker" }, node);
    const px = (v) => (typeof v === "number" ? `${v}px` : v);
    if (s.right !== undefined) sticker.style.right = px(s.right);
    else sticker.style.left = px(s.x ?? 0);
    sticker.style.top = `${s.y}px`;
    sticker.style.width = `${s.w}px`;
    sticker.style.setProperty("--r", `${s.r ?? 0}deg`);
    (s.front ? layers.front : layers.behind).append(sticker);
  }
}

/* ---------- Early-internet extras ---------- */

const SOUND_KEY = "christopia:sound";
const HITS_KEY = "christopia:hits";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Splash phrases next to the logo: add your own.
const SPLASHES = [
  "Epsilon > 0 :)",
  "Q.E.D.",
  "Proof-based",
  "hello world",
  "Mad dog!",
  "Under Construction",
  "Claude Opus",
  "AURRRR",
  "Cathedral in hear",
  "UW Stout",
  "Where am i",
  "Lingering"
]; // keep them short (~12 chars) so they don't cover the nav

/** Pick a random splash phrase on every page load. */
function initSplash() {
  const splash = document.querySelector(".splash");
  if (splash) splash.textContent = SPLASHES[Math.floor(Math.random() * SPLASHES.length)];
}

/** Sparkles follow the mouse; skipped when the user prefers reduced motion. */
function initSparkles() {
  if (reducedMotion) return;
  let last = 0;
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || e.timeStamp - last < 40) return; // ~25 sparkles/s max
    last = e.timeStamp;
    const s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = "✦";
    s.setAttribute("aria-hidden", "true");
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    s.style.setProperty("--dx", `${Math.round(Math.random() * 24 - 12)}px`);
    s.addEventListener("animationend", () => s.remove());
    document.body.append(s);
  });
}

let audio; // AudioContext, created on first use (browsers require a user gesture)
let soundOn = false;

/** Short synthesized blip (original sound, no audio files). */
function blip(freq, seconds, volume) {
  if (!soundOn) return;
  audio ??= new AudioContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audio.currentTime + seconds);
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + seconds);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + seconds);
}

/** Sync the Sound switch with soundOn (label stays "Sound"; aria-pressed is the state). */
function renderSoundToggle() {
  document.querySelector(".sound-toggle")?.setAttribute("aria-pressed", String(soundOn));
}

/** Menu sounds: muted by default; clicks and hovers on buttons, links and tiles blip when on. */
function initSounds() {
  try {
    soundOn = localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    soundOn = false;
  }
  renderSoundToggle();
  document.querySelector(".sound-toggle")?.addEventListener("click", () => {
    soundOn = !soundOn;
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
    } catch {
      /* private mode: setting lasts for this page only */
    }
    renderSoundToggle();
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest("button, a, .tool-card")) blip(660, 0.09, 0.12);
  });
  document.addEventListener("pointerover", (e) => {
    const hit = e.target.closest("button, #site-nav a, .tool-card");
    if (hit && !hit.contains(e.relatedTarget)) blip(1200, 0.04, 0.04);
  });
}

/** Retro visitor counter. Counts visits from this browser only (no server). */
function initHitCounter() {
  let hits = 0;
  try {
    hits = Number(localStorage.getItem(HITS_KEY) || 0) + 1;
    localStorage.setItem(HITS_KEY, String(hits));
  } catch {
    return; // storage blocked: leave 000000
  }
  for (const el of document.querySelectorAll(".hit-counter")) {
    el.textContent = String(hits).padStart(6, "0");
  }
}

/* ---------------- Home: services control panel ---------------- */

const EMPTY_BAYS = 4; // blank "coming soon" slots under the planned services

/** One rack unit: status light, name, status, optional note. */
function rackUnit(name, status, note, ledClass) {
  const li = el("li", { className: "rack-unit" });
  const led = el("span", { className: `led ${ledClass}`.trim() });
  led.setAttribute("aria-hidden", "true");
  li.append(led, el("span", { className: "unit-name", textContent: name }), el("span", { className: "unit-status", textContent: status }));
  if (note) li.append(el("span", { className: "unit-note", textContent: note }));
  return li;
}

/** Home's control panel: services that aren't tools yet (status "planned" in tools.js), then empty bays. */
function renderServices() {
  const list = document.getElementById("rack-units");
  if (!list) return;
  const planned = filterTools(TOOLS, "planned");
  const units = planned.map((t) => rackUnit(t.name, "Offline · coming soon", t.summary, "led-amber"));
  for (let i = 0; i < EMPTY_BAYS; i++) {
    const bay = rackUnit("Empty bay", "Coming soon", "", "");
    bay.classList.add("empty");
    units.push(bay);
  }
  list.replaceChildren(...units);
  document.getElementById("rack-summary").textContent = `0 online · ${planned.length} planned · ${EMPTY_BAYS} empty bays`;
}

document.addEventListener("DOMContentLoaded", () => {
  initTaskbar(); // before initSounds and initMenus: they wire its buttons
  initStickers();
  renderToolGallery();
  renderServices();
  initSplash();
  initSparkles();
  initSounds();
  initHitCounter();
  initMenus();
});
