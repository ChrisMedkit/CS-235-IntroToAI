import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYMBOLS, PAYTABLE, spin, payout, expectedReturn } from '../../js/lib/slots-rules.js';

// Small seeded random generator so the simulation is repeatable.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('long-run return is between 90% and 98%', () => {
  const rtp = expectedReturn();
  assert.ok(rtp > 0.9 && rtp < 0.98, `rtp ${rtp}`);
});

test('payout follows the pay table', () => {
  assert.equal(payout(['trophy', 'trophy', 'trophy'], 10), 10 * PAYTABLE.three.trophy);
  assert.equal(payout(['ball', 'ball', 'shoe'], 10), 10 * PAYTABLE.twoBalls);
  assert.equal(payout(['ball', 'shoe', 'net'], 10), 0);
  assert.equal(payout(['shoe', 'shoe', 'net'], 10), 0);
});

test('spin maps random numbers onto weighted symbols', () => {
  assert.deepEqual(spin(() => 0), [SYMBOLS[0].id, SYMBOLS[0].id, SYMBOLS[0].id]);
  assert.deepEqual(spin(() => 0.9999), [SYMBOLS.at(-1).id, SYMBOLS.at(-1).id, SYMBOLS.at(-1).id]);
});

test('simulated return matches the exact return', () => {
  const rng = mulberry32(42);
  let paid = 0;
  const n = 200_000;
  for (let i = 0; i < n; i++) paid += payout(spin(rng), 1);
  assert.ok(Math.abs(paid / n - expectedReturn()) < 0.02, `sim ${paid / n} vs ${expectedReturn()}`);
});
