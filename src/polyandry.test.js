import test from 'node:test'
import assert from 'node:assert/strict'
import { daughters, sisterRelatedness } from './polyandry.js'
test('All sister pairs have the expected maternal and paternal contributions', () => {
  for (const a of daughters)
    for (const b of daughters) {
      if (a.id === b.id) {
        assert.throws(() => sisterRelatedness(a, b))
        continue
      }
      const r = sisterRelatedness(a, b)
      assert.equal(r.maternal, 0.25)
      assert.equal(r.total, a.father === b.father ? 0.75 : 0.25)
      assert.deepEqual(r, sisterRelatedness(b, a))
    }
})
