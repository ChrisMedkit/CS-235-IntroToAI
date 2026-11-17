import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWallet, START_BALANCE } from '../../js/lib/wallet.js';

// Minimal localStorage stand-in.
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
  };
}

test('starts at 1000 with empty storage', () => {
  assert.equal(START_BALANCE, 1000);
  assert.equal(createWallet(fakeStorage()).getBalance(), 1000);
});

test('falls back to 1000 when stored value is junk', () => {
  for (const junk of ['abc', '-50', 'NaN', '12.5', '']) {
    assert.equal(createWallet(fakeStorage({ mt_wallet: junk })).getBalance(), 1000, junk);
  }
});

test('works with null storage', () => {
  const w = createWallet(null);
  assert.ok(w.debit(100));
  w.credit(30);
  assert.equal(w.getBalance(), 930);
});

test('storage that throws does not crash', () => {
  const angry = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const w = createWallet(angry);
  assert.equal(w.getBalance(), 1000);
  assert.ok(w.debit(10));
  assert.equal(w.getBalance(), 990);
});

test('debit refuses more than balance, zero, negative, non-integer', () => {
  const w = createWallet(fakeStorage());
  for (const bad of [1001, 0, -5, 10.5, NaN]) {
    assert.equal(w.debit(bad), false, String(bad));
  }
  assert.equal(w.getBalance(), 1000);
  assert.equal(w.canAfford(1000), true);
  assert.equal(w.canAfford(1001), false);
});

test('credit then reload from same storage persists', () => {
  const s = fakeStorage();
  createWallet(s).credit(250);
  assert.equal(createWallet(s).getBalance(), 1250);
});

test('reset returns to 1000 and notifies listeners', () => {
  const w = createWallet(fakeStorage());
  const seen = [];
  w.onChange((b) => seen.push(b));
  w.debit(400);
  w.reset();
  assert.equal(w.getBalance(), 1000);
  assert.deepEqual(seen, [600, 1000]);
});
