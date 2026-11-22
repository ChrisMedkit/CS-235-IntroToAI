// Lab page: every tool and planned service from js/tools.js, filterable by status.
import { TOOLS } from "./tools.js";
import { filterTools } from "./utils.js";

const SECTION_NAMES = { math: "Math", cs: "CS", social: "Social", home: "Home" };
const STATUS_NAMES = { live: "Live", planned: "Planned" };

/** Small pill: <span class="badge ...">text</span>. */
function badge(text, className) {
  const span = document.createElement("span");
  span.className = `badge ${className}`;
  span.textContent = text;
  return span;
}

/**
 * Render tools into #hub-grid as cards: name (a link when the tool has a page), summary,
 * status badge and section badge. Planned tools have no page yet, so no link.
 * @param {import("./tools.js").Tool[]} tools
 */
function renderHub(tools) {
  const grid = document.getElementById("hub-grid");
  const root = document.body.dataset.root ?? "";
  const cards = tools.map((tool) => {
    const title = document.createElement("h3");
    if (tool.href) {
      const link = document.createElement("a");
      link.href = root + tool.href;
      link.textContent = tool.name;
      title.append(link);
    } else {
      title.textContent = tool.name;
    }
    const summary = document.createElement("p");
    summary.textContent = tool.summary;
    const meta = document.createElement("p");
    meta.className = "hub-meta";
    meta.append(
      badge(STATUS_NAMES[tool.status] ?? tool.status, `status-${tool.status}`),
      badge(SECTION_NAMES[tool.category] ?? tool.category, "section"),
    );
    const card = document.createElement("li");
    card.className = `hub-card status-${tool.status}`;
    card.append(title, summary, meta);
    return card;
  });
  if (cards.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Nothing here yet.";
    cards.push(empty);
  }
  grid.replaceChildren(...cards);
  document.getElementById("hub-count").textContent =
    `Showing ${tools.length} of ${TOOLS.length} tools`;
}

/** Filter button click: mark it pressed (only one at a time), then re-render. */
function onFilter(button) {
  for (const other of document.querySelectorAll("#hub-filters button[data-status]")) {
    other.setAttribute("aria-pressed", String(other === button));
  }
  renderHub(filterTools(TOOLS, button.dataset.status));
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
