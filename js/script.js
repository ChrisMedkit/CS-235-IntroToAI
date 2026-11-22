// Shared script for every page: theme, mobile nav, quick menu, galleries, early-internet extras.
// Tool pages add their own module (plotter.js, ...) for page-specific behavior.
import { TOOLS } from "./tools.js";
import { THEME_STORAGE_KEY } from "./utils.js";

/**
 * Set the theme on <html data-theme> and sync the Dark mode switch.
 * The label stays "Dark mode"; aria-pressed carries on/off (changing both confuses screen readers).
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  for (const button of document.querySelectorAll(".theme-toggle")) {
    button.setAttribute("aria-pressed", String(theme === "dark"));
  }
}

/** Toggle light/dark and remember the choice (storage can be blocked: then it lasts this page only). */
function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* private mode */
  }
}

/** Initial theme: saved choice, else the OS preference. */
function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    /* storage blocked */
  }
  const osDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved === "dark" || saved === "light" ? saved : osDark ? "dark" : "light");
}

/**
 * Open/close a disclosure: the button's aria-expanded drives it, aria-controls names the target.
 * Mobile nav uses the .open class (CSS shows it on wide screens anyway); the quick menu uses `hidden`.
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

/** Mobile Menu button and bottom Options menu: click toggles; Esc or a click elsewhere closes. */
function initMenus() {
  const toggles = [...document.querySelectorAll(".nav-toggle, .quick-menu-toggle")];
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
  const root = document.body.dataset.root ?? ""; // "" at the site root, "../" in section folders
  const section = gallery.dataset.section;
  const cards = TOOLS.filter((t) => t.status === "live" && (!section || t.category === section)).map(
    (tool) => {
      const img = document.createElement("img");
      Object.assign(img, {
        src: `${root}images/${tool.id}.svg`,
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
      link.href = root + tool.href;
      link.append(img, name, summary);
      const card = document.createElement("li");
      card.className = "tool-card";
      card.append(link);
      return card;
    },
  );
  gallery.replaceChildren(...cards);
}

/* ---------- Early-internet extras ---------- */

const SOUND_KEY = "christopia:sound";
const HITS_KEY = "christopia:hits";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Splash phrases next to the logo: add your own.
const SPLASHES = [
  "Now in 3D!",
  "Epsilon > 0!",
  "Q.E.D.!",
  "Has RREF!",
  "Proof-based!",
  "Any browser!",
  "Hi, server!",
  "Converges!",
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

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderToolGallery();
  initSplash();
  initSparkles();
  initSounds();
  initHitCounter();
  initMenus();
  document.querySelector(".theme-toggle")?.addEventListener("click", toggleTheme);
});
