// Friends page: friends' 88x31 buttons and links (js/friends.js), Christopia's own button code,
// and a guestbook. Guestbook entries go through storage.js: this browser only for now, shared
// once storage.js talks to the home server.
import { el } from "./dom.js";
import { FRIENDS, NEIGHBORS } from "./friends.js";
import { load, save } from "./storage.js";
import { validatePost, relativeTime } from "./social-lib.js";

const $ = (id) => document.getElementById(id);
const root = document.body.dataset.root ?? "";
const MAX_ENTRIES = 200;

/** Only http(s) links: a typo like "javascript:..." or "sam.com" must never become a link. */
function webUrl(text) {
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

// Links to other people's sites: new visitors stay safe, and search engines know we didn't write them.
const outLink = (href, ...children) => el("a", { href, rel: "noopener ugc" }, ...children);

/* ---------------- Friends wall ---------------- */

function friendItem({ name, url, note }) {
  const href = webUrl(url);
  if (!href) return null;
  const li = el("li", {}, outLink(href, name));
  if (note) li.append(` · ${note}`);
  return li;
}

function renderFriends() {
  const withButtons = FRIENDS.filter((f) => f.button && webUrl(f.url));
  $("friend-buttons").replaceChildren(
    ...withButtons.map((f) => {
      const img = el("img", {
        src: root + f.button,
        alt: f.name,
        width: 88,
        height: 31,
        title: f.note ?? f.name,
      });
      return el("li", {}, outLink(webUrl(f.url), img));
    }),
  );
  $("friend-list").replaceChildren(
    ...FRIENDS.filter((f) => !f.button)
      .map(friendItem)
      .filter(Boolean),
  );
  $("friends-empty").hidden = FRIENDS.length > 0;
  $("neighbor-list").replaceChildren(...NEIGHBORS.map(friendItem).filter(Boolean));
}

/* ---------------- Link to me ---------------- */

/** The copy-paste HTML for Christopia's button, using this site's real address. */
function renderButtonCode() {
  const home = new URL(`${root}index.html`, location.href).href;
  const img = new URL(`${root}images/badges/christopia.svg`, location.href).href;
  $("button-code").value =
    `<a href="${home}"><img src="${img}" alt="Christopia" width="88" height="31"></a>`;
}

async function copyButtonCode() {
  try {
    await navigator.clipboard.writeText($("button-code").value);
    $("copy-status").textContent = "Copied! Paste it into your site's HTML.";
  } catch {
    $("button-code").select(); // clipboard blocked: select it so ⌘C / Ctrl+C works
    $("copy-status").textContent =
      "Couldn't copy automatically; it's selected, so press Ctrl+C (⌘C on a Mac).";
  }
}

/* ---------------- Guestbook ---------------- */

let entries = [];

function renderEntries() {
  const list = $("gb-entries");
  if (!entries.length) {
    list.replaceChildren(
      el("li", { className: "empty-state", textContent: "No one has signed yet. Be the first!" }),
    );
    return;
  }
  const now = Date.now();
  list.replaceChildren(
    ...entries.map((entry) => {
      const href = entry.site && webUrl(entry.site);
      const who = href ? outLink(href, entry.name) : el("strong", { textContent: entry.name });
      const when = el("time", {
        dateTime: new Date(entry.createdAt).toISOString(),
        textContent: relativeTime(entry.createdAt, now),
      });
      const header = el("p", { className: "gb-meta" }, who, " · ", when);
      // textContent, never innerHTML: messages are typed by visitors.
      return el("li", {}, header, el("p", { className: "gb-message", textContent: entry.message }));
    }),
  );
}

async function sign(form) {
  // By id: form.name would be the form's own name attribute, not the "name" field.
  const name = $("gb-name").value.trim();
  const message = $("gb-message").value.trim();
  const site = $("gb-site").value.trim();
  const errors = Object.values(validatePost({ author: name, body: message }));
  if (message.length > 1000)
    errors.push(`Message is too long (${message.length} of 1000 characters).`);
  if (site && !webUrl(site)) errors.push("Website must be a full address starting with https://");
  $("gb-error").textContent = errors.join(" ");
  $("gb-status").textContent = "";
  if (errors.length) return;

  const entry = {
    id: crypto.randomUUID(),
    name,
    message,
    site: site ? webUrl(site) : null,
    createdAt: Date.now(),
  };
  const next = [entry, ...entries].slice(0, MAX_ENTRIES);
  try {
    await save("guestbook", next);
  } catch {
    $("gb-error").textContent =
      "Not saved: this browser isn't letting the page store anything (private mode?).";
    return; // keep what they typed
  }
  entries = next;
  form.reset();
  renderEntries();
  $("gb-status").textContent = "Thanks for signing!";
}

document.addEventListener("DOMContentLoaded", async () => {
  renderFriends();
  renderButtonCode();
  $("copy-button-code").addEventListener("click", copyButtonCode);
  const saved = await load("guestbook", []);
  entries = Array.isArray(saved)
    ? saved.filter((e) => e && typeof e.name === "string" && typeof e.message === "string")
    : [];
  renderEntries();
  $("gb-form").addEventListener("submit", (e) => {
    e.preventDefault();
    sign(e.target);
  });
});
