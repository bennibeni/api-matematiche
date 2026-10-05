import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTree, fibonacciLevels } from './model.js'
test('every supported depth contains exactly Fibonacci distinct individuals', () => {
  for (let depth = 1; depth <= 10; depth++) {
    const tree = buildTree(depth)
    assert.deepEqual(tree.counts, fibonacciLevels(depth))
    assert.equal(new Set(tree.nodes.map((n) => n.id)).size, tree.nodes.length)
    const incoming = new Map()
    for (const n of tree.nodes) {
      if (n.generation === depth) {
        assert.equal(n.parents.length, 0)
        continue
      }
      assert.deepEqual(
        n.parents.map((id) => tree.nodes[id].type),
        n.type === 'M' ? ['F'] : ['F', 'M'],
      )
      for (const id of n.parents) {
        assert.equal(tree.nodes[id].generation, n.generation + 1)
        incoming.set(id, (incoming.get(id) || 0) + 1)
      }
    }
    assert.equal(incoming.size, tree.nodes.length - 1)
    assert.ok([...incoming.values()].every((n) => n === 1))
  }
})
test('sequence and sex counts agree with the recurrence', () => {
  const tree = buildTree(8)
  assert.deepEqual(tree.counts, [1, 1, 2, 3, 5, 8, 13, 21, 34])
  for (let g = 1; g < tree.levels.length; g++) {
    assert.equal(
      tree.levels[g].filter((n) => n.type === 'F').length,
      tree.levels[g - 1].length,
    )
    assert.equal(
      tree.levels[g].filter((n) => n.type === 'M').length,
      tree.levels[g - 1].filter((n) => n.type === 'F').length,
    )
  }
})
test('layout includes every node and stays within the canvas', () => {
  for (let depth = 1; depth <= 10; depth++) {
    const t = buildTree(depth)
    assert.ok(
      t.nodes.every(
        (n) => Number.isFinite(n.x) && n.x > 110 && n.x < t.width - 10,
      ),
    )
  }
})
test('invalid depths are rejected', () => {
  for (const n of [0, 11, 2.5, NaN])
    assert.throws(() => buildTree(n), RangeError)
})
