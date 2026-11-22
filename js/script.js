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

/** Add aria-current="page" to the nav link that matches this page's file name. */
function markActiveNav() {
  // TODO (Plan step 5): compare location.pathname's last segment (or "index.html") to each href.
}

/** Home only: replace the fallback cards in #tool-gallery with one card per tool in TOOLS. */
function renderToolGallery() {
  const gallery = document.getElementById("tool-gallery");
  if (!gallery) return; // not the home page
  // TODO (Plan step 4): for each tool, build
  //   <li class="tool-card"><a href=...><img src="images/<id>.svg" alt=...><h3><p></a></li>
  // Planned tools (no href): render without a link and with a "Coming soon" badge.
  // Use textContent, not innerHTML, for names/summaries.
  void TOOLS;
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  markActiveNav();
  renderToolGallery();
  document.querySelector(".theme-toggle")?.addEventListener("click", toggleTheme);
  document.querySelector(".nav-toggle")?.addEventListener("click", toggleNav);
});
