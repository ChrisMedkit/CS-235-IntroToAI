// Forum page. Threads live in storage.js ("forum"): [{id, title, body, author, category,
// createdAt, score, replies: [{id, body, author, createdAt}]}].
import { load, save } from "./storage.js";
import { validatePost, sortThreads, relativeTime } from "./social-lib.js";

let threads = [];
let openId = null;

/** Filter (#forum-filter, #forum-search) + sortThreads(#forum-sort), then one <li> per thread. */
function renderThreads() {
  // TODO (Plan Social step 1b): title as a <button> that calls openThread; textContent only.
  void threads, sortThreads, relativeTime;
}

/** Show a thread in #thread-article (hide #thread-empty): title, meta, body, replies. */
function openThread(id) {
  // TODO (Plan Social step 1c): keep line breaks with CSS white-space: pre-wrap, not <br> HTML.
  void id, openId;
}

/** Validate, add, save, re-render. Errors go to #thread-error / #reply-error per field. */
async function submitThread(form) {
  // TODO (Plan Social step 1b): crypto.randomUUID() for ids; remember the display name in storage.
  void form, validatePost, save;
}

async function submitReply(form) {
  // TODO (Plan Social step 1c)
  void form;
}

/** ±1 score; one vote per thread per browser (remember votes in storage). */
async function vote(delta) {
  // TODO (Plan Social step 1d)
  void delta;
}

document.addEventListener("DOMContentLoaded", async () => {
  threads = await load("forum", []);
  for (const id of ["forum-filter", "forum-sort", "forum-search"]) {
    document.getElementById(id)?.addEventListener("input", renderThreads);
  }
  document.getElementById("thread-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitThread(e.target);
  });
  document.getElementById("reply-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitReply(e.target);
  });
  document.getElementById("vote-up")?.addEventListener("click", () => vote(1));
  document.getElementById("vote-down")?.addEventListener("click", () => vote(-1));
  void openThread;
  renderThreads();
});
