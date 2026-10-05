import test from 'node:test'
import assert from 'node:assert/strict'
import { depthFirstScore, frequencyNote, startingNotes } from './genealogyMusic.js'
import { sharedAncestry } from './sharedAncestry.js'

test('Depth-first music visits every position and traverses every edge in both directions', () => {
  const model = sharedAncestry()
  const byId = new Map(model.points.map(point => [point.id, point]))
  const score = depthFirstScore(model, 130)
  assert.equal(score.length, 2 * model.points.length - 1)
  assert.equal(score[0].id, 0)
  assert.equal(score.at(-1).id, 0)
  assert.equal(score.at(-1).frequency, 130)
  const edges = new Map()
  const entered = new Set([0])
  for (let i = 1; i < score.length; i++) {
    const event = score[i]
    assert.equal(event.fromId, score[i - 1].id)
    const previous = byId.get(event.fromId)
    const current = byId.get(event.id)
    if (event.direction === 'ancestor') {
      assert.ok(previous.parents.includes(event.id))
      assert.ok(!entered.has(event.id))
      entered.add(event.id)
    } else {
      assert.ok(current.parents.includes(event.fromId))
    }
    const key = [event.id, event.fromId].sort((a, b) => a - b).join(':')
    edges.set(key, (edges.get(key) || 0) + 1)
    assert.ok(Math.abs(event.frequency - score[i - 1].frequency * event.ratio) < 1e-9)
  }
  assert.equal(entered.size, model.points.length)
  assert.equal(edges.size, model.points.length - 1)
  assert.ok([...edges.values()].every(count => count === 2))
  // The initial descent always follows the maternal branch to the depth limit.
  assert.deepEqual(score.slice(0, 7).map(event => byId.get(event.id).path), ['', 'm', 'mm', 'mmm', 'mmmm', 'mmmmm', 'mmmmmm'])
})

test('Generation weights transpose exactly and shared identities do not change this first score', () => {
  const model = sharedAncestry(true)
  const base = depthFirstScore(model, startingNotes[0].frequency)
  const transposed = depthFirstScore(model, startingNotes[9].frequency)
  const factor = startingNotes[9].frequency / startingNotes[0].frequency
  base.forEach((event, index) => {
    assert.equal(event.value, model.counts[event.generation])
    assert.ok(Math.abs(transposed[index].frequency / event.frequency - factor) < 1e-12)
  })
  assert.deepEqual(base.map(event => event.frequency), depthFirstScore(sharedAncestry(false), startingNotes[0].frequency).map(event => event.frequency))
  assert.equal(new Set(base.filter(event => event.generation === 6).map(event => event.frequency)).size, 1)
  for (const value of [0, -1, NaN, Infinity]) assert.throws(() => depthFirstScore(model, value))
})

test('Frequency naming distinguishes exact equal-tempered pitches from Fibonacci partials', () => {
  assert.deepEqual(frequencyNote(440), { label: 'La4', cents: 0 })
  const c3 = startingNotes[0].frequency
  assert.deepEqual(frequencyNote(c3 * 8), { label: 'Do6', cents: 0 })
  assert.equal(frequencyNote(c3 * 3).label, 'Sol4')
  assert.ok(Math.abs(frequencyNote(c3 * 3).cents - 1.9550008654) < 1e-7)
  assert.equal(frequencyNote(c3 * 5).label, 'Mi5')
  assert.ok(Math.abs(frequencyNote(c3 * 5).cents + 13.6862861352) < 1e-7)
  assert.equal(frequencyNote(c3 * 13).label, 'La♭6')
  assert.ok(Math.abs(frequencyNote(c3 * 13).cents - 40.5276617693) < 1e-7)
  assert.deepEqual(frequencyNote(startingNotes[11].frequency * 2), { label: 'Si4', cents: 0 })
  assert.deepEqual(frequencyNote(c3 * 2), { label: 'Do4', cents: 0 })
  for (const value of [0, -1, NaN, Infinity]) assert.throws(() => frequencyNote(value))
})

test('Selecting a shared bee plays both family paths and returns to the initial male', () => {
  const model = sharedAncestry(true)
  const score = depthFirstScore(model, 130, 'mmmmp')
  assert.equal(score.length, 23)
  assert.equal(new Set(score.map(event => event.id)).size, 12)
  assert.equal(new Set(score.filter(event => event.identity === 'mmmmp').map(event => event.id)).size, 2)
  assert.equal(score.at(-1).id, 0)
  assert.equal(score.at(-1).frequency, 130)
  const byId = new Map(model.points.map(point => [point.id, point]))
  for (const event of score.slice(1)) {
    assert.ok(byId.get(event.fromId).parents.includes(event.id) || byId.get(event.id).parents.includes(event.fromId))
  }
  assert.deepEqual(depthFirstScore(model, 130, ''), depthFirstScore(model, 130))
  assert.throws(() => depthFirstScore(model, 130, 'missing'))
})
