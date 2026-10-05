import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSpiral, spiralPoint, PHI } from './spiral.js'
import { fibonacciLevels } from './model.js'
test('Spiral preserves individuals, generations and parent edges', () => {
  for (let depth = 2; depth <= 9; depth++) {
    const s = buildSpiral(depth),
      ids = new Set(s.points.map((n) => n.id))
    assert.deepEqual(s.counts, fibonacciLevels(depth))
    assert.equal(ids.size, s.total)
    for (const n of s.points) {
      assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y))
      for (const id of n.parents) {
        const p = s.points.find((a) => a.id === id)
        assert.equal(p.generation, n.generation + 1)
      }
      assert.ok(
        n.r > spiralPoint((n.generation * Math.PI) / 2).r &&
          n.r < spiralPoint(((n.generation + 1) * Math.PI) / 2).r,
      )
    }
  }
  for (const angle of [0, 1, 3, 9])
    assert.ok(
      Math.abs(
        spiralPoint(angle + Math.PI / 2).r / spiralPoint(angle).r - PHI,
      ) < 1e-12,
    )
})
