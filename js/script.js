// Shared script for every page: theme toggle, mobile nav, current-page link, home gallery.
// Tool pages add their own module (plotter.js, ...) for page-specific behavior.
import { TOOLS } from "./tools.js";
import { THEME_STORAGE_KEY } from "./utils.js";

/**
 * Set the theme on <html data-theme> and update the toggle's label + aria-pressed.
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  // TODO (Plan step 6, the spec's Step 7 feature):
  // 1. document.documentElement.dataset.theme = theme
  // 2. every .theme-toggle: aria-pressed = theme === "dark"; text "Light mode"/"Dark mode"
  void theme;
}

/** Toggle light/dark and remember it in localStorage (wrap storage in try/catch). */
function toggleTheme() {
  // TODO: read current, flip, applyTheme, save under THEME_STORAGE_KEY.
  void THEME_STORAGE_KEY;
}

/** Initial theme: saved choice, else the OS preference (prefers-color-scheme). */
function initTheme() {
  // TODO: try localStorage, fall back to matchMedia("(prefers-color-scheme: dark)").
}

/** Mobile nav: open/close #site-nav and keep aria-expanded in sync. */
function toggleNav() {
  // TODO (Plan step 5): toggle .open on #site-nav; set aria-expanded on .nav-toggle.
}

/**
 * Home and section overview pages: re-render #tool-gallery from TOOLS (replacing the static
 * fallback cards). data-section="math|cs|social" on the list limits it to that section.
 */
function renderToolGallery() {
  const gallery = document.getElementById("tool-gallery");
  if (!gallery) return; // not a gallery page
  // TODO (Plan step 4): for each live tool (filtered by gallery.dataset.section if set), build
  //   <li class="tool-card"><a href=ROOT+href><img src=ROOT+"images/<id>.svg" alt=...><h3><p></a></li>
  // where ROOT = document.body.dataset.root ("" on the home page, "../" in section folders).
  // Use textContent, not innerHTML, for names/summaries.
  void TOOLS;
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

/** Sync the Sound button with soundOn. */
function renderSoundToggle() {
  const button = document.querySelector(".sound-toggle");
  if (!button) return;
  button.setAttribute("aria-pressed", String(soundOn));
  button.textContent = soundOn ? "Sound on" : "Sound off";
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
  document.querySelector(".theme-toggle")?.addEventListener("click", toggleTheme);
  document.querySelector(".nav-toggle")?.addEventListener("click", toggleNav);
});
