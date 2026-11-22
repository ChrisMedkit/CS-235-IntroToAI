// Tools desktop: folder windows of tool icons (from js/tools.js), draggable by their title bars
// on wide screens with a mouse. On phones, touch screens and for keyboard use the windows stack
// normally, so nothing depends on dragging.
import { TOOLS } from "./tools.js";

const POSITIONS_KEY = "christopia:desktop";
const draggable = window.matchMedia("(min-width: 900px) and (pointer: fine)");

const desktop = document.getElementById("desktop");
const windows = () => [...desktop.querySelectorAll(".desktop-window")];
let zTop = 1;

/** Each folder's icons and object count come from TOOLS, so a new tool appears by itself. */
function renderFolders() {
  for (const grid of desktop.querySelectorAll(".icon-grid[data-category]")) {
    const tools = TOOLS.filter((t) => t.status === "live" && t.category === grid.dataset.category);
    grid.replaceChildren(
      ...tools.map((tool) => {
        const img = Object.assign(document.createElement("img"), {
          src: `images/icons/${tool.id}.svg`,
          alt: "", // the label below names the tool
          width: 48,
          height: 48,
        });
        const label = Object.assign(document.createElement("span"), { textContent: tool.name });
        const link = Object.assign(document.createElement("a"), { href: tool.href });
        link.append(img, label);
        const li = document.createElement("li");
        li.append(link);
        return li;
      }),
    );
    const count = desktop.querySelector(`[data-count="${grid.dataset.category}"]`);
    if (count) count.textContent = `${tools.length} object${tools.length === 1 ? "" : "s"}`;
  }
}

/** Bring a window to the front; the others get 98's grey "inactive" title bar. */
function activate(win) {
  win.style.zIndex = ++zTop;
  for (const w of windows()) w.querySelector(".title-bar").classList.toggle("inactive", w !== win);
}

function loadPositions() {
  try {
    return JSON.parse(localStorage.getItem(POSITIONS_KEY)) ?? {};
  } catch {
    return {};
  }
}

function savePositions() {
  const positions = Object.fromEntries(windows().map((w) => [w.id, { x: w.offsetLeft, y: w.offsetTop }]));
  try {
    localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
  } catch {
    /* private mode: positions last for this visit only */
  }
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

/** The desktop must be tall enough to hold its absolutely positioned windows. */
function fitHeight() {
  const bottom = Math.max(...windows().map((w) => w.offsetTop + w.offsetHeight));
  desktop.style.minHeight = `${bottom + 24}px`;
}

/** Place windows (saved spot, else a staggered default), kept inside the desktop's width. */
function layout() {
  desktop.classList.toggle("is-draggable", draggable.matches);
  if (!draggable.matches) {
    desktop.style.minHeight = "";
    return; // CSS stacks the windows; their left/top are ignored
  }
  const saved = loadPositions();
  windows().forEach((w, i) => {
    const fallback = { x: i === 0 ? 16 : desktop.clientWidth - w.offsetWidth - 16, y: 16 + i * 56 };
    const { x, y } = saved[w.id] ?? fallback;
    w.style.left = `${clamp(x, 0, desktop.clientWidth - w.offsetWidth)}px`;
    w.style.top = `${Math.max(0, y)}px`;
  });
  fitHeight();
}

function initDragging() {
  desktop.addEventListener("pointerdown", (e) => {
    const win = e.target.closest(".desktop-window");
    if (!win) return;
    activate(win);
    const bar = e.target.closest(".title-bar");
    if (!bar || !draggable.matches || e.button !== 0) return;
    e.preventDefault(); // no text selection while dragging
    const start = { px: e.clientX, py: e.clientY, x: win.offsetLeft, y: win.offsetTop };
    try {
      bar.setPointerCapture(e.pointerId); // keep getting moves even if the pointer outruns the bar
    } catch {
      /* no live pointer (synthetic events): dragging still works while over the bar */
    }
    const move = (ev) => {
      win.style.left = `${clamp(start.x + ev.clientX - start.px, 0, desktop.clientWidth - win.offsetWidth)}px`;
      win.style.top = `${Math.max(0, start.y + ev.clientY - start.py)}px`;
    };
    const stop = () => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", stop);
      bar.removeEventListener("pointercancel", stop);
      savePositions();
      fitHeight();
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", stop);
    bar.addEventListener("pointercancel", stop);
  });
  // Keyboard users bring a window forward by tabbing into it.
  desktop.addEventListener("focusin", (e) => {
    const win = e.target.closest(".desktop-window");
    if (win) activate(win);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFolders();
  layout();
  initDragging();
  draggable.addEventListener("change", layout);
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  });
  // tools.html#cs (from Home or the address bar) opens with that folder in front.
  const target = document.getElementById(location.hash.slice(1));
  activate(target?.classList.contains("desktop-window") ? target : windows()[0]);
});
