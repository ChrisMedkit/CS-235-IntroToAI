// Hub page: every tool and planned service from js/tools.js, filterable by status.
import { TOOLS } from "./tools.js";
import { filterTools } from "./utils.js";

/**
 * Render tools into #hub-grid as cards: name, summary, category, status badge
 * (.status-live / .status-planned), and a link when href is set.
 * @param {import("./tools.js").Tool[]} tools
 */
function renderHub(tools) {
  // TODO (Plan step 11b): clear #hub-grid; build each card with textContent; empty-state message.
  void tools;
}

/** Filter button click: set aria-pressed on the group, then renderHub(filterTools(TOOLS, status)). */
function onFilter(button) {
  // TODO (Plan step 11c)
  void button, filterTools;
}

// Later (home server milestone): checkServiceStatus(url) -> fetch with a timeout, show up/down.
// Only works from inside your home network or through a tunnel; leave it out of the graded build.

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hub-filters")?.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-status]");
    if (button) onFilter(button);
  });
  renderHub(TOOLS);
});
