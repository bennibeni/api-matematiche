import test from 'node:test'
import assert from 'node:assert/strict'
import { resourceExperiment } from './resourceExperiment.js'
test('Fixed resource scenarios conserve budget and distinguish saving from reproductive gain', () => {
  const expected = {
    all: [4, 40, 0, 10],
    save: [2, 20, 20, 8],
    reinvest: [4, 40, 0, 16],
  }
  for (const [id, values] of Object.entries(expected)) {
    const s = resourceExperiment(id)
    assert.deepEqual([s.adults, s.spent, s.remaining, s.output], values)
    assert.equal(s.spent + s.remaining, s.budget)
    assert.equal(
      s.output,
      s.males
        .filter((n) => n.state === 'reared')
        .reduce((n, m) => n + m.capacity, 0),
    )
  }
  assert.ok(
    resourceExperiment('save').output < resourceExperiment('all').output,
  )
  assert.ok(
    resourceExperiment('save').efficiency >
      resourceExperiment('all').efficiency,
  )
  assert.throws(() => resourceExperiment('unknown'))
})
