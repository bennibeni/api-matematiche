import test from 'node:test';
import assert from 'node:assert/strict';
import { staffPage } from './musicNotation.js';

test('Staff pages keep triplets intact at either page boundary', () => {
  for (const prefix of [6, 7, 8]) {
    const score = [
      ...Array.from({ length: prefix }, () => ({})),
      ...[1, 2, 3].map((ornamentPart) => ({ ornamentPart })),
      {},
      {},
    ];
    const pages = score.map((_, index) => staffPage(score, index));
    assert.equal(pages[prefix].first, pages[prefix + 2].first);
    assert.deepEqual(
      pages[prefix].notes.filter((n) => n.ornamentPart).map((n) => n.ornamentPart),
      [1, 2, 3],
    );
    for (let i = 0; i < score.length; i++) {
      assert.ok(pages[i].notes.length <= 8);
      assert.equal(pages[i].notes[i - pages[i].first], score[i]);
    }
  }
});
