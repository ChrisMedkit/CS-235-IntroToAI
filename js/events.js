// Events page. Events live in storage.js ("events"); see ChristopiaEvent in social-lib.js.
import { load, save } from "./storage.js";
import { rsvpSummary, setRsvp, splitEvents, toICS } from "./social-lib.js";

let events = [];

/** Validate (title required, end after start, capacity >= 1 or blank), add, save, render. */
async function createEvent(form) {
  // TODO (Plan Social step 2b): datetime-local value -> new Date(value).getTime().
  void form, save;
}

/** splitEvents(now) into #event-list / #past-event-list; toggle #event-empty. */
function render() {
  // TODO (Plan Social step 2b)
  void events, splitEvents;
}

/**
 * One event card: title, formatted date range, location, description, RSVP buttons with
 * aria-pressed for your current status, counts + "N spots left" from rsvpSummary, names going,
 * "Add to calendar (.ics)" button.
 * @returns {HTMLLIElement}
 */
function renderEvent(event) {
  // TODO (Plan Social step 2c)
  void event, rsvpSummary;
  return document.createElement("li");
}

/** RSVP with the #rsvp-name name (ask for it if blank); show setRsvp's error (event full). */
async function rsvp(eventId, status) {
  // TODO (Plan Social step 2c): remember the name in storage.
  void eventId, status, setRsvp;
}

/** Download toICS(event) as <title>.ics (Blob, text/calendar). */
function downloadICS(event) {
  // TODO (Plan Social step 2d)
  void event, toICS;
}

document.addEventListener("DOMContentLoaded", async () => {
  events = await load("events", []);
  document.getElementById("event-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    createEvent(e.target);
  });
  // RSVP and .ics buttons are delegated: data-event-id + data-rsvp="going|maybe|no" or data-ics.
  document.getElementById("event-list")?.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-event-id]");
    if (!button) return;
    if (button.dataset.rsvp) rsvp(button.dataset.eventId, button.dataset.rsvp);
    else downloadICS(events.find((ev) => ev.id === button.dataset.eventId));
  });
  void renderEvent;
  render();
});
