// Run with `npm test`. Covers the game rules and payouts in js/script.js (Part 2).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const g = require("../js/script.js");

const hand = (...ranks) => ranks.map((rank) => ({ rank, suit: "♠" }));

test("betError rejects bad bets and accepts good ones", () => {
  assert.notEqual(g.betError(0, 100), "");
  assert.notEqual(g.betError(1.5, 100), "");
  assert.notEqual(g.betError(NaN, 100), "");
  assert.match(g.betError(101, 100), /only have 100/);
  assert.equal(g.betError(100, 100), "");
});

test("slots: three 7s pay 20x, other triples 10x, a pair returns the stake, else lose", () => {
  assert.equal(g.slotsPayout(["7", "7", "7"], 5), 100);
  assert.equal(g.slotsPayout(["$", "$", "$"], 5), 50);
  assert.equal(g.slotsPayout(["$", "★", "$"], 5), 5);
  assert.equal(g.slotsPayout(["$", "★", "♦"], 5), 0);
});

test("roulette colors", () => {
  assert.equal(g.rouletteColor(0), "green");
  assert.equal(g.rouletteColor(1), "red");
  assert.equal(g.rouletteColor(2), "black");
});

test("roulette payouts", () => {
  assert.equal(g.roulettePayout("red", 1, 10), 20);
  assert.equal(g.roulettePayout("black", 1, 10), 0);
  assert.equal(g.roulettePayout("even", 2, 10), 20);
  assert.equal(g.roulettePayout("odd", 2, 10), 0);
  assert.equal(g.roulettePayout("even", 0, 10), 0, "0 is not even for betting");
  assert.equal(g.roulettePayout(17, 17, 10), 360);
  assert.equal(g.roulettePayout(0, 0, 10), 360);
  assert.equal(g.roulettePayout(17, 18, 10), 0);
});

test("newDeck has 52 different cards", () => {
  const deck = g.newDeck(() => 0.5);
  assert.equal(deck.length, 52);
  assert.equal(new Set(deck.map((c) => c.rank + c.suit)).size, 52);
});

test("handValue counts aces as 11 or 1", () => {
  assert.equal(g.handValue(hand("A", "K")), 21);
  assert.equal(g.handValue(hand("A", "A", "9")), 21);
  assert.equal(g.handValue(hand("A", "5", "K")), 16);
  assert.equal(g.handValue(hand("K", "Q", "5")), 25);
});

test("dealer hits below 17 and stands on 17", () => {
  assert.equal(g.dealerShouldHit(hand("10", "6")), true);
  assert.equal(g.dealerShouldHit(hand("10", "7")), false);
  assert.equal(g.dealerShouldHit(hand("A", "6")), false, "soft 17 stands");
});

test("blackjack payouts", () => {
  assert.equal(g.blackjackPayout(hand("A", "K"), hand("10", "9"), 10), 25, "natural pays 3:2");
  assert.equal(g.blackjackPayout(hand("A", "K"), hand("10", "9"), 3), 7, "3:2 rounds down");
  assert.equal(g.blackjackPayout(hand("A", "K"), hand("A", "Q"), 10), 10, "two naturals push");
  assert.equal(g.blackjackPayout(hand("10", "9"), hand("A", "Q"), 10), 0, "dealer natural wins");
  assert.equal(g.blackjackPayout(hand("10", "9"), hand("10", "8"), 10), 20, "higher total wins");
  assert.equal(g.blackjackPayout(hand("10", "8"), hand("10", "8"), 10), 10, "tie pushes");
  assert.equal(g.blackjackPayout(hand("10", "8", "5"), hand("10", "6", "9"), 10), 0, "player bust loses even if dealer busts");
  assert.equal(g.blackjackPayout(hand("10", "8"), hand("10", "6", "9"), 10), 20, "dealer bust");
});

test("horse chances add up to 1 and pickWinner follows them", () => {
  const total = g.HORSES.reduce((sum, h) => sum + h.chance, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  assert.equal(g.pickWinner(() => 0), 0);
  assert.equal(g.pickWinner(() => 0.2), 0);
  assert.equal(g.pickWinner(() => 0.5), 1);
  assert.equal(g.pickWinner(() => 0.8), 2);
  assert.equal(g.pickWinner(() => 0.95), 3);
  assert.equal(g.pickWinner(() => 0.9999), 3);
});

test("americanOdds: pays 2x is +100, pays 8x is +700", () => {
  assert.equal(g.americanOdds(2), "+100");
  assert.equal(g.americanOdds(3), "+200");
  assert.equal(g.americanOdds(8), "+700");
});

test("Home odds board matches HORSES (names and odds are copied into index.html)", () => {
  const html = require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "index.html"), "utf8");
  const rows = [...html.matchAll(/<span class="runner">([^<]+)<\/span>\s*<a class="odds-btn" href="play\.html\?horse=(\d)#horse-racing"[^>]*>([^<]+)<\/a>/g)];
  assert.deepEqual(
    rows.map(([, name, index, odds]) => [name, Number(index), odds]),
    g.HORSES.map((horse, i) => [horse.name, i, g.americanOdds(horse.pays)]),
  );
});
