import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextIndex } from '../../js/lib/carousel.js';

test('wraps forward and backward', () => {
  assert.equal(nextIndex(2, 3, 1), 0);
  assert.equal(nextIndex(0, 3, -1), 2);
  assert.equal(nextIndex(1, 3, 1), 2);
});
