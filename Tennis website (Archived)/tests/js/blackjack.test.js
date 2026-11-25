import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newDeck, handValue, isBlackjack, dealerShouldHit, settleHand } from '../../js/lib/blackjack-rules.js';

const c = (rank, suit = '♠') => ({ rank, suit });
const hand = (...ranks) => ranks.map((r) => c(r));

test('handValue counts aces as 11 or 1', () => {
  assert.deepEqual(handValue(hand('A', 'K')), { total: 21, soft: true });
  assert.deepEqual(handValue(hand('A', 'A', '9')), { total: 21, soft: true });
  assert.deepEqual(handValue(hand('A', '9', '5')), { total: 15, soft: false });
  assert.deepEqual(handValue(hand('K', 'Q', '5')), { total: 25, soft: false });
});

test('isBlackjack is only a two-card 21', () => {
  assert.equal(isBlackjack(hand('A', 'Q')), true);
  assert.equal(isBlackjack(hand('7', '7', '7')), false);
});

test('dealer hits below 17 and stands on all 17s', () => {
  assert.equal(dealerShouldHit(hand('10', '6')), true);
  assert.equal(dealerShouldHit(hand('A', '6')), false);
  assert.equal(dealerShouldHit(hand('10', '7')), false);
});

test('settleHand pays 3:2 blackjack, pushes, busts and doubles', () => {
  assert.deepEqual(settleHand(hand('A', 'K'), hand('10', 'Q'), 10, false), { result: 'blackjack', returned: 25 });
  assert.deepEqual(settleHand(hand('A', 'K'), hand('A', 'J'), 10, false), { result: 'push', returned: 10 });
  assert.deepEqual(settleHand(hand('10', '6', '9'), hand('10', '6', '8'), 10, false), { result: 'lose', returned: 0 });
  assert.deepEqual(settleHand(hand('10', '9'), hand('10', '8'), 10, true), { result: 'win', returned: 40 });
  assert.deepEqual(settleHand(hand('10', '8'), hand('10', '6', '9'), 10, false), { result: 'win', returned: 20 });
  assert.deepEqual(settleHand(hand('10', '7'), hand('10', '8'), 10, false), { result: 'lose', returned: 0 });
  assert.deepEqual(settleHand(hand('10', '8'), hand('A', 'K'), 10, false), { result: 'lose', returned: 0 });
});

test('newDeck has 52 unique cards', () => {
  const deck = newDeck();
  assert.equal(deck.length, 52);
  assert.equal(new Set(deck.map((k) => k.rank + k.suit)).size, 52);
});
