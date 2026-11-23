// Events page. Events live in storage.js ("events"); see ChristopiaEvent in social-lib.js.
import { download, el } from "./dom.js";
import { load, save } from "./storage.js";
import { rsvpSummary, setRsvp, splitEvents, toICS } from "./social-lib.js";

const $ = (id) => document.getElementById(id);
const STATUSES = [
  ["going", "Going"],
  ["maybe", "Maybe"],
  ["no", "Can't go"],
];

let events = [];
const cardErrors = {}; // eventId -> message shown on that card after a re-render

/** Save events; returns false if this browser won't store them. */
async function persist() {
  try {
    await save("events", events);
    return true;
  } catch {
    return false;
  }
}

/** Validate (title required, end after start, capacity >= 1 or blank), add, save, render. */
async function createEvent(form) {
  const title = $("event-title").value.trim();
  const start = new Date($("event-start").value).getTime(); // datetime-local is local time
  const endText = $("event-end").value;
  const end = endText ? new Date(endText).getTime() : undefined;
  const capText = $("event-capacity").value.trim();
  const capacity = capText ? Number(capText) : null;
  const errors = [];
  if (!title) errors.push("Give the event a title.");
  if (!Number.isFinite(start)) errors.push("Pick when it starts.");
  if (end !== undefined && !(end > start)) errors.push("It has to end after it starts.");
  if (capacity !== null && !(Number.isInteger(capacity) && capacity >= 1)) errors.push("Capacity must be a whole number of 1 or more, or blank.");
  $("event-error").textContent = errors.join(" ");
  if (errors.length) return;

  const event = {
    id: crypto.randomUUID(),
    title,
    start,
    ...(end !== undefined && { end }),
    location: $("event-location").value.trim(),
    description: $("event-description").value.trim(),
    capacity,
    rsvps: {},
  };
  events.push(event);
  if (!(await persist())) {
    events.pop(); // keep the form filled so nothing is lost
    $("event-error").textContent = "Not saved: this browser isn't letting the page store anything (private mode?).";
    return;
  }
  form.reset();
  render();
  $(`event-${event.id}`)?.focus();
}

/** splitEvents(now) into #event-list / #past-event-list; toggle #event-empty. */
function render() {
  const { upcoming, past } = splitEvents(events, Date.now());
  $("event-list").replaceChildren(...upcoming.map((e) => renderEvent(e, false)));
  $("past-event-list").replaceChildren(...past.map((e) => renderEvent(e, true)));
  $("event-empty").hidden = upcoming.length > 0;
  $("past-event-list").closest("details").hidden = past.length === 0;
}

/** "Tue, Dec 1, 2026, 5:00 PM – 6:00 PM" (same day) or two full dates. */
function dateRange(start, end) {
  const full = { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" };
  const from = new Date(start).toLocaleString(undefined, full);
  if (end === undefined) return from;
  const sameDay = new Date(start).toDateString() === new Date(end).toDateString();
  return `${from} – ${new Date(end).toLocaleString(undefined, sameDay ? { hour: "numeric", minute: "2-digit" } : full)}`;
}

/** Your current answer on this event, matching names trimmed and case-insensitively like setRsvp. */
function myStatus(event) {
  const me = $("rsvp-name").value.trim().toLowerCase();
  const key = Object.keys(event.rsvps).find((n) => n.trim().toLowerCase() === me);
  return me && key ? event.rsvps[key] : null;
}

/**
 * One event card: title, formatted date range, location, description, RSVP buttons with
 * aria-pressed for your current status, counts + "N spots left" from rsvpSummary, names going,
 * "Add to calendar (.ics)" button.
 * @returns {HTMLLIElement}
 */
function renderEvent(event, isPast) {
  const sum = rsvpSummary(event);
  const heading = el("h3", { id: `event-${event.id}`, tabIndex: -1, textContent: event.title });
  const card = el("li", {}, heading, el("p", { className: "meta", textContent: dateRange(event.start, event.end) }));
  if (event.location) card.append(el("p", { className: "meta", textContent: `📍 ${event.location}` }));
  if (event.description) card.append(el("p", { className: "post-body", textContent: event.description }));

  const spots = sum.spotsLeft === null ? "" : sum.spotsLeft === 0 ? " · Full" : ` · ${sum.spotsLeft} spot${sum.spotsLeft === 1 ? "" : "s"} left`;
  card.append(el("p", { className: "rsvp-counts", textContent: `${sum.going} going · ${sum.maybe} maybe · ${sum.no} can't go${spots}` }));
  const going = Object.keys(event.rsvps).filter((n) => event.rsvps[n] === "going");
  if (going.length) card.append(el("p", { className: "meta", textContent: `Going: ${going.join(", ")}` }));

  const buttons = el("div", { className: "button-row" });
  if (!isPast) {
    const mine = myStatus(event);
    for (const [status, label] of STATUSES) {
      const b = el("button", { type: "button", textContent: label });
      Object.assign(b.dataset, { eventId: event.id, rsvp: status });
      b.setAttribute("aria-pressed", String(mine === status));
      buttons.append(b);
    }
  }
  const ics = el("button", { type: "button", textContent: "Add to calendar (.ics)" });
  Object.assign(ics.dataset, { eventId: event.id, ics: "" });
  buttons.append(ics);
  const error = el("p", { className: "error", textContent: cardErrors[event.id] ?? "" });
  error.setAttribute("role", "alert");
  card.append(buttons, error);
  return card;
}

/** RSVP with the #rsvp-name name (ask for it if blank); show setRsvp's error (event full). */
async function rsvp(eventId, status) {
  const i = events.findIndex((e) => e.id === eventId);
  const name = $("rsvp-name").value.trim();
  delete cardErrors[eventId];
  if (!name) {
    cardErrors[eventId] = "Type your name above first.";
    render();
    $("rsvp-name").focus();
    return;
  }
  const { event, error } = setRsvp(events[i], name, status);
  const before = events[i];
  if (error) cardErrors[eventId] = error;
  else {
    events[i] = event;
    if (!(await persist())) {
      events[i] = before;
      cardErrors[eventId] = "Not saved: this browser isn't letting the page store anything.";
    }
    save("rsvp-name", name).catch(() => {}); // a convenience only
  }
  render();
  document.querySelector(`[data-event-id="${eventId}"][data-rsvp="${status}"]`)?.focus(); // re-render replaced the button
}

/** Download toICS(event) as <title>.ics. */
function downloadICS(event) {
  const name = event.title.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "event";
  download(`${name}.ics`, toICS(event, Date.now()), "text/calendar");
}

document.addEventListener("DOMContentLoaded", async () => {
  const saved = await load("events", []);
  events = Array.isArray(saved) ? saved.filter((e) => e && typeof e.title === "string" && Number.isFinite(e.start) && e.rsvps) : [];
  const name = await load("rsvp-name", "");
  if (typeof name === "string") $("rsvp-name").value = name;

  $("event-form").addEventListener("submit", (e) => {
    e.preventDefault();
    createEvent(e.target);
  });
  // RSVP and .ics buttons (upcoming and past) are delegated: data-event-id + data-rsvp or data-ics.
  $("event-list-section").addEventListener("click", (e) => {
    const button = e.target.closest("button[data-event-id]");
    if (!button) return;
    if (button.dataset.rsvp) rsvp(button.dataset.eventId, button.dataset.rsvp);
    else downloadICS(events.find((ev) => ev.id === button.dataset.eventId));
  });
  $("rsvp-name").addEventListener("input", render); // your answers light up as you type your name
  render();
});
