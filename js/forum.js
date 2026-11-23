// Forum page. Threads live in storage.js ("forum"): [{id, title, body, author, category,
// createdAt, score, replies: [{id, body, author, createdAt}]}].
import { load, save } from "./storage.js";
import { validatePost, sortThreads, relativeTime } from "./social-lib.js";

const $ = (id) => document.getElementById(id);
const CATEGORIES = { general: "General", math: "Math", cs: "CS", homework: "Homework help", offtopic: "Off-topic" };
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

let threads = [];
let votes = {}; // threadId -> +1 / -1 (this browser's vote)
let openId = null;

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Save threads; false (with the message shown) if this browser won't store them. */
async function persist(errorId) {
  try {
    await save("forum", threads);
    return true;
  } catch {
    $(errorId).textContent = "Not saved: this browser isn't letting the page store anything (private mode?).";
    return false;
  }
}

/** Filter (#forum-filter, #forum-search) + sortThreads(#forum-sort), then one <li> per thread. */
function renderThreads() {
  const category = $("forum-filter").value;
  const q = $("forum-search").value.trim().toLowerCase();
  const shown = sortThreads(threads, $("forum-sort").value).filter(
    (t) =>
      (category === "all" || t.category === category) &&
      (!q || [t.title, t.body, t.author].some((s) => s.toLowerCase().includes(q))),
  );
  const now = Date.now();
  $("thread-list").replaceChildren(
    ...shown.map((t) => {
      const open = el("button", { type: "button", className: "thread-link", textContent: t.title });
      open.addEventListener("click", () => openThread(t.id));
      if (t.id === openId) open.setAttribute("aria-current", "true");
      const meta = `${CATEGORIES[t.category] ?? t.category} · ${t.author} · ${relativeTime(t.createdAt, now)} · ${plural(t.replies.length, "reply", "replies")} · ${plural(t.score, "point")}`;
      return el("li", {}, open, el("p", { className: "meta", textContent: meta }));
    }),
  );
  if (!shown.length) {
    const text = threads.length ? "No threads match." : "No threads yet. Start one!";
    $("thread-list").append(el("li", { className: "empty-state", textContent: text }));
  }
}

/** Show a thread in #thread-article (hide #thread-empty): title, meta, body, replies. */
function openThread(id, { focus = true } = {}) {
  const t = threads.find((x) => x.id === id);
  if (!t) return;
  openId = id;
  const now = Date.now();
  $("thread-empty").hidden = true;
  $("thread-article").hidden = false;
  $("thread-title").textContent = t.title;
  $("thread-meta").textContent = `${CATEGORIES[t.category] ?? t.category} · posted by ${t.author} ${relativeTime(t.createdAt, now)}`;
  $("thread-body").textContent = t.body; // .post-body keeps line breaks with white-space: pre-wrap
  $("thread-score").textContent = t.score;
  $("vote-up").setAttribute("aria-pressed", String(votes[id] === 1));
  $("vote-down").setAttribute("aria-pressed", String(votes[id] === -1));
  $("reply-list").replaceChildren(
    ...t.replies.map((r) =>
      el(
        "li",
        {},
        el("p", { className: "meta", textContent: `${r.author} · ${relativeTime(r.createdAt, now)}` }),
        el("p", { className: "post-body", textContent: r.body }),
      ),
    ),
  );
  if (!t.replies.length) $("reply-list").append(el("li", { className: "empty-state", textContent: "No replies yet." }));
  $("reply-error").textContent = "";
  renderThreads(); // move the "current" marker
  if (focus) $("thread-title").focus(); // also scrolls it into view on phones, where it's below the list
}

/** Errors from validatePost as one line, in the form's field order (title, post, name). */
const errorText = (errors) => ["title", "body", "author"].map((f) => errors[f]).filter(Boolean).join(" ");

/** Validate, add, save, re-render. Errors go to #thread-error / #reply-error per field. */
async function submitThread(form) {
  const post = {
    title: $("thread-title-input").value.trim(),
    body: $("thread-body-input").value.trim(),
    author: $("thread-author").value.trim(),
  };
  const errors = validatePost(post, { requireTitle: true });
  $("thread-error").textContent = errorText(errors);
  if (Object.keys(errors).length) return;
  const thread = { id: crypto.randomUUID(), ...post, category: $("thread-category").value, createdAt: Date.now(), score: 0, replies: [] };
  threads.unshift(thread);
  if (!(await persist("thread-error"))) {
    threads.shift(); // keep what they typed so nothing is lost
    return;
  }
  form.reset();
  rememberName(post.author); // after reset, which cleared it
  $("new-thread").open = false;
  openThread(thread.id);
}

async function submitReply(form) {
  const t = threads.find((x) => x.id === openId);
  const post = { body: $("reply-body").value.trim(), author: $("reply-author").value.trim() };
  const errors = validatePost(post);
  $("reply-error").textContent = errorText(errors);
  if (!t || Object.keys(errors).length) return;
  t.replies.push({ id: crypto.randomUUID(), ...post, createdAt: Date.now() });
  if (!(await persist("reply-error"))) {
    t.replies.pop();
    return;
  }
  form.reset();
  rememberName(post.author);
  openThread(t.id, { focus: false });
  $("reply-body").focus();
}

/** ±1 score; one vote per thread per browser (remember votes in storage). Same button again undoes it. */
async function vote(delta) {
  const t = threads.find((x) => x.id === openId);
  if (!t) return;
  const before = votes[t.id] ?? 0;
  const after = before === delta ? 0 : delta;
  t.score += after - before;
  votes[t.id] = after;
  try {
    await save("forum", threads);
    await save("forum-votes", votes);
  } catch {
    $("reply-error").textContent = "Vote not saved: this browser isn't letting the page store anything.";
  }
  openThread(t.id, { focus: false });
}

/** Fill both name fields and keep the name for next time. */
function rememberName(name) {
  $("thread-author").value = $("reply-author").value = name;
  save("forum-name", name).catch(() => {}); // a convenience only
}

document.addEventListener("DOMContentLoaded", async () => {
  const saved = await load("forum", []);
  threads = Array.isArray(saved) ? saved.filter((t) => t && typeof t.title === "string" && Array.isArray(t.replies)) : [];
  votes = (await load("forum-votes", {})) ?? {};
  const name = await load("forum-name", "");
  if (typeof name === "string") $("thread-author").value = $("reply-author").value = name;
  $("thread-title").tabIndex = -1; // focus target when a thread opens

  for (const id of ["forum-filter", "forum-sort", "forum-search"]) $(id).addEventListener("input", renderThreads);
  $("thread-form").addEventListener("submit", (e) => {
    e.preventDefault();
    submitThread(e.target);
  });
  $("reply-form").addEventListener("submit", (e) => {
    e.preventDefault();
    submitReply(e.target);
  });
  $("vote-up").addEventListener("click", () => vote(1));
  $("vote-down").addEventListener("click", () => vote(-1));
  renderThreads();
});
