import test from 'node:test'
import assert from 'node:assert/strict'
import { sharedAncestry } from './sharedAncestry.js'

test('One shared mother preserves positions and merges her entire ancestry', () => {
  const separate = sharedAncestry(false)
  const shared = sharedAncestry(true)
  assert.deepEqual(
    shared.rows.map((row) => row.positions),
    [1, 1, 2, 3, 5, 8, 13],
  )
  assert.deepEqual(
    shared.rows.map((row) => row.unique),
    [1, 1, 2, 2, 3, 5, 8],
  )
  assert.ok(separate.rows.every((row) => row.positions === row.unique))
  for (const [identity, individual] of shared.individuals) {
    assert.equal(individual.label, separate.individuals.get(identity).label)
  }
  assert.deepEqual(
    shared.points.map((p) => [p.id, p.x, p.y, p.parents]),
    separate.points.map((p) => [p.id, p.x, p.y, p.parents]),
  )
  const points = new Map(shared.points.map((point) => [point.id, point]))
  for (const point of shared.points) {
    const individual = shared.individuals.get(point.identity)
    assert.equal(individual.type, point.type)
    assert.equal(individual.generation, point.generation)
    assert.deepEqual(
      point.parents.map((id) => points.get(id).identity),
      individual.parents,
    )
    assert.equal(
      point.parents.length,
      point.generation === 6 ? 0 : point.type === 'F' ? 2 : 1,
    )
  }
  // Independently unfold the unique graph to recover the Fibonacci positions.
  let identities = ['']
  for (const row of shared.rows) {
    assert.equal(identities.length, row.positions)
    assert.equal(new Set(identities).size, row.unique)
    identities = identities.flatMap((id) => shared.individuals.get(id).parents)
  }
})

test('Expected nuclear ancestry conserves each level and weights shared paths differently', () => {
  for (const shared of [false, true]) {
    const model = sharedAncestry(shared)
    for (const row of model.rows) {
      const total = [...model.individuals.values()]
        .filter((bee) => bee.generation === row.generation)
        .flatMap((bee) => bee.occurrences)
        .reduce((sum, id) => sum + model.contributions.get(id), 0)
      assert.equal(total, 1)
    }
    const contribution = (identity) =>
      model.individuals
        .get(identity)
        .occurrences.map((id) => model.contributions.get(id))
    assert.deepEqual(contribution('mmm'), shared ? [0.25, 0.5] : [0.25])
    if (!shared) assert.deepEqual(contribution('mpm'), [0.5])
    assert.equal(model.contributions.get(0), 1)
  }
})
