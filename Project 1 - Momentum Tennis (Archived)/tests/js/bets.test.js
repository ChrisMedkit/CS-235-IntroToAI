import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateStake, makeBet, settle, settleNow, matchBettingOpen, betProbability } from '../../js/lib/bets.js';

// Sample: points 1-8 are game (1,1) won by player 1 on point 8;
// points 9-12 are game (1,2), won by player 1. Match winner: 1.
const sample = JSON.parse(readFileSync(new URL('../../data/tennis/match-sample.json', import.meta.url)));
const pts = sample.points;

test('validateStake refuses bad input with a message', () => {
  for (const raw of ['', '0', '-5', '10.5', 'abc', '2000', ' ']) {
    const r = validateStake(raw, 1000);
    assert.equal(r.ok, false, raw);
    assert.ok(r.error.length > 0);
  }
});

test('validateStake accepts a whole number within the balance', () => {
  assert.deepEqual(validateStake('50', 1000), { ok: true, stake: 50 });
  assert.deepEqual(validateStake(' 1000 ', 1000), { ok: true, stake: 1000 });
});

test('point bet targets the next unplayed point and settles once it is played', () => {
  const bet = makeBet({ mode: 'point', pick: 2, stake: 10, odds: 2, points: pts, idx: 1 });
  assert.equal(bet.target, 1);
  assert.equal(settle(bet, pts, 1, 1), null);           // point 2 not played yet
  assert.deepEqual(settle(bet, pts, 2, 1), { won: true, payout: 20 }); // point 2 won by player 2
  const lose = makeBet({ mode: 'point', pick: 2, stake: 10, odds: 2, points: pts, idx: 0 });
  assert.deepEqual(settle(lose, pts, 1, 1), { won: false, payout: 0 });
});

test('game bet mid-game targets the next game and settles on its last point', () => {
  const bet = makeBet({ mode: 'game', pick: 1, stake: 10, odds: 1.5, points: pts, idx: 3 });
  assert.deepEqual(bet.target, { set: 1, game: 2 });
  assert.equal(settle(bet, pts, 8, 1), null);   // game 1 over, game 2 not
  assert.equal(settle(bet, pts, 11, 1), null);
  assert.deepEqual(settle(bet, pts, 12, 1), { won: true, payout: 15 });
});

test('game bet at 0-0 targets the game about to start', () => {
  const bet = makeBet({ mode: 'game', pick: 1, stake: 10, odds: 1.5, points: pts, idx: 0 });
  assert.deepEqual(bet.target, { set: 1, game: 1 });
  assert.deepEqual(settle(bet, pts, 8, 1), { won: true, payout: 15 });
});

test('game bet is impossible when no later game exists', () => {
  assert.equal(makeBet({ mode: 'game', pick: 1, stake: 10, odds: 1.5, points: pts, idx: 9 }), null);
});

test('match bet settles only at the end', () => {
  const bet = makeBet({ mode: 'match', pick: 2, stake: 10, odds: 3, points: pts, idx: 0 });
  assert.equal(settle(bet, pts, 11, 1), null);
  assert.deepEqual(settle(bet, pts, 12, 1), { won: false, payout: 0 });
});

test('match betting closes once the final set begins', () => {
  assert.equal(matchBettingOpen({ sets: [1, 1] }), true);
  assert.equal(matchBettingOpen({ sets: [2, 1] }), true);
  assert.equal(matchBettingOpen({ sets: [2, 2] }), false);
});

test('betProbability picks the right number per mode', () => {
  assert.equal(betProbability('point', 1, pts, 0), pts[0].p_point[0]);
  assert.equal(betProbability('game', 1, pts, 0), pts[0].p_game[0]);       // game at 0-0
  assert.equal(betProbability('game', 2, pts, 3), pts[3].p_next_game[1]);  // mid-game
  assert.equal(betProbability('match', 2, pts, 5), pts[5].p_match[1]);
});

test('settleNow decides an open bet on the real result, so leaving early is not a free refund', () => {
  // Point bet on point 2 (won by player 2), placed before it was played.
  const point = makeBet({ mode: 'point', pick: 2, stake: 10, odds: 2, points: pts, idx: 1 });
  assert.deepEqual(settleNow(point, pts, 1), { won: true, payout: 20 });
  // Game bet on game (1,2), which player 1 wins: a bet on player 2 loses.
  const game = makeBet({ mode: 'game', pick: 2, stake: 10, odds: 3, points: pts, idx: 3 });
  assert.deepEqual(settleNow(game, pts, 1), { won: false, payout: 0 });
  // Match bet on the winner pays.
  const match = makeBet({ mode: 'match', pick: 1, stake: 10, odds: 1.5, points: pts, idx: 0 });
  assert.deepEqual(settleNow(match, pts, 1), { won: true, payout: 15 });
});
