import test from 'node:test'
import assert from 'node:assert/strict'
import { ancestralRatios } from './ancestralRatios.js'
import { buildTree } from './model.js'
import { PHI } from './spiral.js'

test('Sex counts match the actual genealogy and handle zero denominators', () => {
  const rows = ancestralRatios()
  buildTree(10).levels.forEach((level, g) => {
    assert.equal(rows[g].females, level.filter((n) => n.type === 'F').length)
    assert.equal(rows[g].males, level.filter((n) => n.type === 'M').length)
  })
  assert.equal(rows[0].ratio, 0)
  assert.equal(rows[1].ratio, null)
  assert.equal(rows[1].errorPercent, null)
})
test('Ratios alternate around phi and first reach 0.01 percent at generation 11', () => {
  const rows = ancestralRatios()
  assert.equal(
    rows.find((r) => r.errorPercent !== null && r.errorPercent < 0.01)
      .generation,
    11,
  )
  assert.equal(rows[11].ratio, 89 / 55)
  for (let g = 2; g < 16; g++) {
    assert.ok(Math.abs(rows[g + 1].ratio - (1 + 1 / rows[g].ratio)) < 1e-12)
    assert.ok((rows[g].ratio - PHI) * (rows[g + 1].ratio - PHI) < 0)
    assert.ok(rows[g + 1].errorPercent < rows[g].errorPercent)
  }
})
