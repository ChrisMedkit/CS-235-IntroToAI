import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toDecimalOdds, HOUSE_MARGIN } from '../../js/lib/odds.js';

test('house margin is 5%', () => assert.equal(HOUSE_MARGIN, 0.05));

test('even chance pays 1.90 after the margin', () => assert.equal(toDecimalOdds(0.5), 1.9));

test('near-certain picks are clamped and never below 1.01', () => {
  assert.equal(toDecimalOdds(0.99), 1.01);
  assert.equal(toDecimalOdds(1), 1.01);
});

test('long shots are clamped at 2%', () => {
  assert.equal(toDecimalOdds(0.001), 47.62);
  assert.equal(toDecimalOdds(0), 47.62);
});
