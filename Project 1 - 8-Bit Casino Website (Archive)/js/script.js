// Longshot: shared script for every page.
// Part 1: gallery lightbox (gallery.html). Part 2: the four mini games (play.html).
// Each part's start-up function returns early on pages that don't have it.
// Classic script (not a module) so pages work when opened straight from the file system.

/* ===================== Part 1: gallery lightbox ===================== */

/**
 * Wrap a gallery index so "next" after the last image goes to the first, and
 * "previous" before the first goes to the last. Pure function: tested in tests/script.test.js.
 * @param {number} index  index after moving (may be -1 or length)
 * @param {number} length number of images (> 0)
 * @returns {number} an index in 0..length-1
 */
function wrapIndex(index, length) {
  // JS % keeps the sign (-1 % 6 === -1), so add length before the second %.
  return ((index % length) + length) % length;
}

/** Gallery state: the thumbnail <img> elements and which one the lightbox shows. */
let galleryImages = [];
let currentIndex = 0;

/**
 * Show image number `index` in the lightbox: copy its src and alt, and use the alt as the caption.
 * @param {number} index
 */
function showImage(index) {
  const source = galleryImages[index];
  const image = document.getElementById("lightbox-image");
  currentIndex = index;
  image.src = source.src; // .src is the resolved full URL of the thumbnail
  image.alt = source.alt;
  document.getElementById("lightbox-caption").textContent =
    `${source.alt} (${index + 1} of ${galleryImages.length})`;
}

/**
 * Open the lightbox on image `index`.
 * @param {number} index
 */
function openLightbox(index) {
  showImage(index);
  // showModal(): backdrop, focus trap, Esc closes, and focus returns to the thumbnail on close.
  document.getElementById("lightbox").showModal();
}

/** Close the lightbox. */
function closeLightbox() {
  document.getElementById("lightbox").close();
}

/**
 * Move by `step` (+1 next, -1 previous), wrapping around.
 * @param {number} step
 */
function moveBy(step) {
  showImage(wrapIndex(currentIndex + step, galleryImages.length));
}

/** Wire up the gallery. Does nothing on pages without one (Home, About). */
function initGallery() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const buttons = document.querySelectorAll(".gallery-item");
  galleryImages = Array.from(buttons, (button) => button.querySelector("img"));

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => openLightbox(index));
  });

  document.getElementById("lightbox-prev").addEventListener("click", () => moveBy(-1));
  document.getElementById("lightbox-next").addEventListener("click", () => moveBy(1));
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);

  // Arrow keys only fire here while the dialog is open, since it is the only thing focusable then.
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveBy(-1);
    if (event.key === "ArrowRight") moveBy(1);
  });

  // Close on a click on the dark backdrop. Backdrop clicks target the <dialog> itself, but so do
  // clicks on its padding, so also check the click landed outside the dialog's box.
  lightbox.addEventListener("click", (event) => {
    if (event.target !== lightbox) return;
    const box = lightbox.getBoundingClientRect();
    const outside =
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom;
    if (outside) closeLightbox();
  });
}

/* ===================== Part 2: the mini games (play.html) =====================
   Play-money chips only. Pure game logic first (no DOM, tested in tests/games.test.js),
   then the page wiring. */

/* ===================== Game logic ===================== */

const START_CHIPS = 100;

/**
 * Check a bet against the chip balance.
 * @param {number} bet
 * @param {number} chips
 * @returns {string} an error message, or "" if the bet is fine
 */
function betError(bet, chips) {
  if (!Number.isInteger(bet) || bet < 1) return "Bet a whole number of chips, at least 1.";
  if (bet > chips) return `You only have ${chips} chips.`;
  return "";
}

// All payouts below return the chips handed back, including the stake:
// 0 = lose, bet = push (stake back), more than bet = win.

/* ----- Slots ----- */
const SLOT_SYMBOLS = ["7", "$", "★", "♦", "♣"];

/**
 * @param {string[]} reels three symbols
 * @param {number} bet
 * @returns {number} chips paid back
 */
function slotsPayout(reels, bet) {
  const [a, b, c] = reels;
  if (a === b && b === c) return bet * (a === "7" ? 20 : 10);
  if (a === b || b === c || a === c) return bet; // a pair gives the stake back
  return 0;
}

/* ----- Roulette ----- */
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

/** @returns {"red"|"black"|"green"} */
function rouletteColor(n) {
  if (n === 0) return "green";
  return RED_NUMBERS.includes(n) ? "red" : "black";
}

/**
 * @param {"red"|"black"|"odd"|"even"|number} pick a bet type, or a single number 0-36
 * @param {number} n where the ball landed (0-36)
 * @param {number} bet
 * @returns {number} chips paid back
 */
function roulettePayout(pick, n, bet) {
  if (typeof pick === "number") return pick === n ? bet * 36 : 0;
  if (n === 0) return 0; // green 0 loses every outside bet
  const hit =
    pick === rouletteColor(n) || (pick === "odd" && n % 2 === 1) || (pick === "even" && n % 2 === 0);
  return hit ? bet * 2 : 0;
}

/* ----- Blackjack ----- */
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["♠", "♥", "♦", "♣"];

/**
 * A shuffled 52-card deck (Fisher-Yates shuffle).
 * @param {() => number} random injectable for tests
 * @returns {{rank: string, suit: string}[]}
 */
function newDeck(random = Math.random) {
  const deck = SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Best total for a hand: aces count 11 unless that busts, then 1. */
function handValue(hand) {
  let total = 0;
  let aces = 0;
  for (const { rank } of hand) {
    if (rank === "A") {
      aces++;
      total += 11;
    } else if (rank === "10" || rank === "J" || rank === "Q" || rank === "K") {
      total += 10;
    } else {
      total += Number(rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

const isNatural = (hand) => hand.length === 2 && handValue(hand) === 21;

/** The dealer draws until 17 or more. */
const dealerShouldHit = (hand) => handValue(hand) < 17;

/**
 * @returns {number} chips paid back: natural blackjack pays 3:2 (rounded down), win 1:1, push = stake
 */
function blackjackPayout(player, dealer, bet) {
  const p = handValue(player);
  const d = handValue(dealer);
  if (p > 21) return 0;
  if (isNatural(player) && !isNatural(dealer)) return Math.floor(bet * 2.5);
  if (isNatural(dealer) && !isNatural(player)) return 0;
  if (d > 21 || p > d) return bet * 2;
  if (p === d) return bet;
  return 0;
}

/* ----- Horse racing ----- */
// chance values add up to 1; each payout is a bit under fair odds, like a real track.
const HORSES = [
  { name: "Gold Standard", chance: 0.4, pays: 2 },
  { name: "Night Shift", chance: 0.3, pays: 3 },
  { name: "Photo Finish", chance: 0.2, pays: 4 },
  { name: "Long Shot", chance: 0.1, pays: 8 },
];

/**
 * Pick the winning horse, weighted by each horse's chance.
 * @param {() => number} random injectable for tests
 * @returns {number} index into HORSES
 */
function pickWinner(random = Math.random) {
  let roll = random();
  for (let i = 0; i < HORSES.length - 1; i++) {
    if (roll < HORSES[i].chance) return i;
    roll -= HORSES[i].chance;
  }
  return HORSES.length - 1;
}

/**
 * Sportsbook-style American odds for a payout: pays 2x (stake back doubled) is "+100".
 * @param {number} pays total paid back per chip bet, at least 2
 * @returns {string}
 */
const americanOdds = (pays) => `+${(pays - 1) * 100}`;

/* ===================== Page wiring ===================== */

const CHIPS_KEY = "casinoChips";
let chips = START_CHIPS;

/** Saved balance, or the starting amount if nothing valid is saved or storage is blocked. */
function loadChips() {
  try {
    const saved = localStorage.getItem(CHIPS_KEY);
    if (saved !== null && /^\d+$/.test(saved)) return Number(saved);
  } catch {
    // storage blocked (private window etc.): play without saving
  }
  return START_CHIPS;
}

function setChips(amount) {
  chips = amount;
  document.getElementById("chip-count").textContent = amount;
  try {
    localStorage.setItem(CHIPS_KEY, String(amount));
  } catch {
    // not saved, but the game still works
  }
}

const $ = (id) => document.getElementById(id);

/**
 * Show a message in a game's result line (an aria-live region, so screen readers hear it).
 * @param {"win"|"push"|"lose"|""} outcome colors the line via CSS; "" for plain messages
 */
function say(game, text, outcome = "") {
  const line = $(`${game}-result`);
  line.textContent = text;
  line.dataset.outcome = outcome;
}

/** Read and check the game's bet; take it from the balance. Returns the bet, or 0 if invalid. */
function takeBet(game) {
  const bet = Number($(`${game}-bet`).value);
  const error = betError(bet, chips);
  if (error) {
    say(game, chips === 0 ? "Out of chips! Press Reset chips to play again." : error);
    return 0;
  }
  setChips(chips - bet);
  return bet;
}

/** Pay out and describe the result. */
function settle(game, paid, bet, text) {
  setChips(chips + paid);
  if (paid > bet) say(game, `${text} You win ${paid - bet} chips!`, "win");
  else if (paid === bet) say(game, `${text} Push: your ${bet} chips come back.`, "push");
  else say(game, `${text} You lose ${bet} chips.`, "lose");
}

/* ----- Slots ----- */
function playSlots() {
  const bet = takeBet("slots");
  if (!bet) return;
  const reels = [0, 1, 2].map(() => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
  document.querySelectorAll(".slot-reel").forEach((reel, i) => (reel.textContent = reels[i]));
  settle("slots", slotsPayout(reels, bet), bet, `${reels.join(" ")}.`);
}

/* ----- Roulette ----- */
function playRoulette() {
  const type = $("roulette-pick").value;
  let pick = type;
  if (type === "number") {
    pick = Number($("roulette-number").value);
    if (!Number.isInteger(pick) || pick < 0 || pick > 36) {
      say("roulette", "Pick a number from 0 to 36.");
      return;
    }
  }
  const bet = takeBet("roulette");
  if (!bet) return;
  const n = Math.floor(Math.random() * 37);
  const wheel = $("roulette-wheel");
  wheel.textContent = n;
  wheel.dataset.color = rouletteColor(n);
  settle("roulette", roulettePayout(pick, n, bet), bet, `The ball lands on ${n} ${rouletteColor(n)}.`);
}

/* ----- Blackjack ----- */
const bj = { deck: [], player: [], dealer: [], bet: 0 };

const cardText = (card) => card.rank + card.suit;

/** One card as a small white playing card (red text for hearts and diamonds). */
function cardElement(card) {
  const el = document.createElement("span");
  el.className = card.suit === "♥" || card.suit === "♦" ? "playing-card red" : "playing-card";
  el.textContent = cardText(card);
  return el;
}

/** Draw a hand into its row; with hideSecond the dealer's hole card shows face down, no total. */
function showHand(id, hand, hideSecond) {
  const parts = hand.map((card, i) => {
    if (!(hideSecond && i === 1)) return cardElement(card);
    const back = document.createElement("span");
    back.className = "playing-card card-back";
    back.innerHTML = '<span class="visually-hidden">face-down card</span>';
    return back;
  });
  const total = document.createElement("span");
  total.className = "hand-total";
  total.textContent = hideSecond ? "" : `(${handValue(hand)})`;
  // spaces between cards so screen readers say "7♥ 8♠", not "7♥8♠"
  $(id).replaceChildren(...parts.flatMap((part) => [part, " "]), total);
}

function showBlackjack(hideHoleCard) {
  showHand("bj-player", bj.player, false);
  showHand("bj-dealer", bj.dealer, hideHoleCard);
}

function setBlackjackPlaying(playing) {
  $("bj-deal").disabled = playing;
  $("blackjack-bet").disabled = playing;
  $("bj-hit").disabled = !playing;
  $("bj-stand").disabled = !playing;
}

function bjDeal() {
  bj.bet = takeBet("blackjack");
  if (!bj.bet) return;
  bj.deck = newDeck();
  bj.player = [bj.deck.pop(), bj.deck.pop()];
  bj.dealer = [bj.deck.pop(), bj.deck.pop()];
  say("blackjack", "Hit or stand?");
  // A natural on either side ends the round straight away.
  if (isNatural(bj.player) || isNatural(bj.dealer)) {
    bjFinish();
    return;
  }
  showBlackjack(true);
  setBlackjackPlaying(true);
  $("bj-hit").focus();
}

function bjHit() {
  bj.player.push(bj.deck.pop());
  if (handValue(bj.player) >= 21) bjFinish(); // bust, or 21: nothing left to decide
  else showBlackjack(true);
}

function bjFinish() {
  const playerDone = handValue(bj.player) > 21 || isNatural(bj.player) || isNatural(bj.dealer);
  if (!playerDone) {
    while (dealerShouldHit(bj.dealer)) bj.dealer.push(bj.deck.pop());
  }
  showBlackjack(false);
  setBlackjackPlaying(false);
  $("bj-deal").focus();
  const p = handValue(bj.player);
  const d = handValue(bj.dealer);
  const summary = p > 21 ? `Bust with ${p}.` : `You ${p}, dealer ${d}${d > 21 ? " (bust)" : ""}.`;
  settle("blackjack", blackjackPayout(bj.player, bj.dealer, bj.bet), bj.bet, summary);
}

/* ----- Horse racing ----- */
function drawHorses(positions) {
  document.querySelectorAll(".horse").forEach((horse, i) => {
    // left + matching translate keeps the horse inside its lane at 100%
    horse.style.left = `${positions[i]}%`;
    horse.style.transform = `translateX(-${positions[i]}%)`;
  });
}

function playRace() {
  const choice = Number(document.querySelector('input[name="horse"]:checked').value);
  const bet = takeBet("race");
  if (!bet) return;
  const winner = pickWinner();
  const positions = HORSES.map(() => 0);
  const finish = () => {
    $("race-start").disabled = false;
    const paid = choice === winner ? bet * HORSES[choice].pays : 0;
    settle("race", paid, bet, `${HORSES[winner].name} wins!`);
  };

  $("race-start").disabled = true;
  say("race", "And they're off!");
  drawHorses(positions);

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    positions.fill(80);
    positions[winner] = 100;
    drawHorses(positions);
    finish();
    return;
  }
  // Every horse runs at random speed; the others are held back just short of the line,
  // so the picked winner always crosses first. Steps scale with the real time since the last
  // tick, because browsers slow timers in background tabs; the race still ends in ~3 seconds.
  let last = performance.now();
  const timer = setInterval(() => {
    const now = performance.now();
    const ticks = (now - last) / 80;
    last = now;
    positions.forEach((pos, i) => {
      positions[i] = Math.min(i === winner ? 100 : 94, pos + (1 + Math.random() * 3) * ticks);
    });
    drawHorses(positions);
    if (positions[winner] >= 100) {
      clearInterval(timer);
      finish();
    }
  }, 80);
}

function initRace() {
  // ?horse=N comes from the odds board on Home. It's from the URL, so only accept a real horse.
  const linked = Number(new URLSearchParams(location.search).get("horse"));
  const picked = Number.isInteger(linked) && linked >= 0 && linked < HORSES.length ? linked : 0;

  // Build the horse choices and lanes from HORSES so names and odds live in one place.
  HORSES.forEach((horse, i) => {
    $("race-picks").insertAdjacentHTML(
      "beforeend",
      `<label><input type="radio" name="horse" value="${i}"${i === picked ? " checked" : ""} /> ` +
        `${i + 1} &middot; ${horse.name} <span class="odds">${americanOdds(horse.pays)}</span></label>`,
    );
    $("race-track").insertAdjacentHTML(
      "beforeend",
      `<li class="race-lane"><span class="horse">${i + 1}</span></li>`,
    );
  });
}

/* ----- Start ----- */
function initGames() {
  if (!$("chip-count")) return; // not the Play page
  setChips(loadChips());
  $("chip-reset").addEventListener("click", () => {
    setChips(START_CHIPS);
  });

  $("slots-spin").addEventListener("click", playSlots);

  $("roulette-spin").addEventListener("click", playRoulette);
  $("roulette-pick").addEventListener("change", () => {
    $("roulette-number-field").hidden = $("roulette-pick").value !== "number";
  });

  $("bj-deal").addEventListener("click", bjDeal);
  $("bj-hit").addEventListener("click", bjHit);
  $("bj-stand").addEventListener("click", bjFinish);

  initRace();
  $("race-start").addEventListener("click", playRace);
}

/* ===================== Start ===================== */
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initGallery();
    initGames();
  });
}

// Lets `npm test` (Node) load the pure functions; ignored in the browser.
if (typeof module !== "undefined") {
  module.exports = {
    wrapIndex,
    betError,
    slotsPayout,
    rouletteColor,
    roulettePayout,
    newDeck,
    handValue,
    dealerShouldHit,
    blackjackPayout,
    pickWinner,
    americanOdds,
    HORSES,
  };
}
