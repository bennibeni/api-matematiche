import test from 'node:test'
import assert from 'node:assert/strict'
import { singleEvent } from './uniparental.js'
import { fibonacciLevels } from './model.js'

test('one event changes only one parent list and retains the entire maternal history', () => {
  for (let depth = 2; depth <= 10; depth++) {
    const { standard, alternative, focalId, fatherId } = singleEvent(depth)
    for (const n of alternative.nodes) {
      assert.equal(n.type, standard.nodes[n.id].type)
      assert.deepEqual(
        n.parents,
        n.id === focalId
          ? [standard.nodes[n.id].parents[0]]
          : standard.nodes[n.id].parents,
      )
    }
    assert.ok(!alternative.nodes.some((n) => n.id === fatherId))
    assert.equal(alternative.nodes.find((n) => n.id === focalId).type, 'F')
    const mother = alternative.nodes.find(
      (n) => n.id === standard.nodes[focalId].parents[0],
    )
    if (depth > 2) assert.equal(mother.parents.length, 2)
    assert.deepEqual(standard.counts, fibonacciLevels(depth))
  }
})
test('single event does not turn the ancestry into a constant sequence', () => {
  const { alternative } = singleEvent(8)
  assert.deepEqual(alternative.counts, [1, 1, 1, 2, 3, 5, 8, 13, 21])
})
test('the difference is exactly the missing paternal ancestral subtree', () => {
  for (let depth = 2; depth <= 10; depth++) {
    const { standard, alternative, removedIds, fatherId } = singleEvent(depth)
    const missing = []
    function walk(id) {
      missing.push(id)
      standard.nodes[id].parents.forEach(walk)
    }
    walk(fatherId)
    assert.deepEqual(
      [...removedIds].sort((a, b) => a - b),
      missing.sort((a, b) => a - b),
    )
    for (let g = 2; g <= depth; g++)
      assert.equal(
        standard.counts[g] - alternative.counts[g],
        fibonacciLevels(depth - 2)[g - 2],
      )
  }
})
