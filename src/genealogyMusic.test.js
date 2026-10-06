import test from 'node:test'
import assert from 'node:assert/strict'
import {
  depthFirstScore,
  frequencyNote,
  startingNotes,
} from './genealogyMusic.js'
import { sharedAncestry } from './sharedAncestry.js'

test('Depth-first music visits every position and traverses every edge in both directions', () => {
  const model = sharedAncestry()
  const byId = new Map(model.points.map((point) => [point.id, point]))
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
    assert.ok(
      Math.abs(event.frequency - score[i - 1].frequency * event.ratio) < 1e-9,
    )
  }
  assert.equal(entered.size, model.points.length)
  assert.equal(edges.size, model.points.length - 1)
  assert.ok([...edges.values()].every((count) => count === 2))
  // The initial descent always follows the maternal branch to the depth limit.
  assert.deepEqual(
    score.slice(0, 7).map((event) => byId.get(event.id).path),
    ['', 'm', 'mm', 'mmm', 'mmmm', 'mmmmm', 'mmmmmm'],
  )
})

test('Generation weights transpose exactly and shared identities do not change this first score', () => {
  const model = sharedAncestry(true)
  const base = depthFirstScore(model, startingNotes[0].frequency)
  const transposed = depthFirstScore(model, startingNotes[9].frequency)
  const factor = startingNotes[9].frequency / startingNotes[0].frequency
  base.forEach((event, index) => {
    assert.equal(event.value, model.counts[event.generation])
    assert.ok(
      Math.abs(transposed[index].frequency / event.frequency - factor) < 1e-12,
    )
  })
  assert.deepEqual(
    base.map((event) => event.frequency),
    depthFirstScore(sharedAncestry(false), startingNotes[0].frequency).map(
      (event) => event.frequency,
    ),
  )
  assert.equal(
    new Set(
      base
        .filter((event) => event.generation === 6)
        .map((event) => event.frequency),
    ).size,
    1,
  )
  for (const value of [0, -1, NaN, Infinity])
    assert.throws(() => depthFirstScore(model, value))
})

test('Frequency naming distinguishes exact equal-tempered pitches from Fibonacci partials', () => {
  assert.deepEqual(frequencyNote(440), { label: 'La4', cents: 0 })
  const c3 = startingNotes[0].frequency * 2
  assert.deepEqual(frequencyNote(c3 * 8), { label: 'Do6', cents: 0 })
  assert.equal(frequencyNote(c3 * 3).label, 'Sol4')
  assert.ok(Math.abs(frequencyNote(c3 * 3).cents - 1.9550008654) < 1e-7)
  assert.equal(frequencyNote(c3 * 5).label, 'Mi5')
  assert.ok(Math.abs(frequencyNote(c3 * 5).cents + 13.6862861352) < 1e-7)
  assert.equal(frequencyNote(c3 * 13).label, 'La♭6')
  assert.ok(Math.abs(frequencyNote(c3 * 13).cents - 40.5276617693) < 1e-7)
  assert.deepEqual(frequencyNote(startingNotes[11].frequency * 2), {
    label: 'Si3',
    cents: 0,
  })
  assert.deepEqual(frequencyNote(c3 * 2), { label: 'Do4', cents: 0 })
  for (const value of [0, -1, NaN, Infinity])
    assert.throws(() => frequencyNote(value))
})

test('Selecting a shared bee plays both family paths and returns to the initial male', () => {
  const model = sharedAncestry(true)
  const score = depthFirstScore(model, 130, 'mmmmp')
  assert.equal(score.length, 23)
  assert.equal(new Set(score.map((event) => event.id)).size, 12)
  assert.equal(
    new Set(
      score
        .filter((event) => event.identity === 'mmmmp')
        .map((event) => event.id),
    ).size,
    2,
  )
  assert.equal(score.at(-1).id, 0)
  assert.equal(score.at(-1).frequency, 130)
  const byId = new Map(model.points.map((point) => [point.id, point]))
  for (const event of score.slice(1)) {
    assert.ok(
      byId.get(event.fromId).parents.includes(event.id) ||
        byId.get(event.id).parents.includes(event.fromId),
    )
  }
  assert.deepEqual(depthFirstScore(model, 130, ''), depthFirstScore(model, 130))
  assert.throws(() => depthFirstScore(model, 130, 'missing'))
})

test('Twin excursions transpose by fifths and restore each suspended register', () => {
  const model = sharedAncestry(true)
  const byId = new Map(model.points.map(point => [point.id, point]))
  for (const selected of [null, 'mmmmp', 'mmm', 'mmp']) {
    const score = depthFirstScore(model, 130, selected, true)
    const stack = []
    for (let i = 1; i < score.length; i++) {
      const event = score[i]
      assert.equal(event.fromId, score[i - 1].id)
      assert.ok(Math.abs(event.frequency - 130 * event.value * 2 ** (event.transposeSemitones / 12)) < 1e-9)
      assert.ok(Math.abs(event.frequency - score[i - 1].frequency * event.ratio) < 1e-9)
      if (event.direction.startsWith('teleport')) {
        assert.equal(byId.get(event.id).identity, byId.get(event.fromId).identity)
        assert.notEqual(event.id, event.fromId)
        const semitones = event.direction === 'teleport' ? 7 : -7
        assert.ok(Math.abs(event.ratio - 2 ** (semitones / 12)) < 1e-12)
        assert.equal(event.transposeSemitones, score[i - 1].transposeSemitones + semitones)
        if (event.direction === 'teleport') {
          assert.ok(!stack.some(item => item.identity === event.identity))
          stack.push(event)
        } else {
          const outward = stack.pop()
          assert.equal(event.id, outward.fromId)
          assert.equal(event.fromId, outward.id)
          assert.equal(event.transposeSemitones, outward.transposeSemitones - 7)
        }
      } else {
        assert.equal(event.transposeSemitones, score[i - 1].transposeSemitones)
        assert.ok(byId.get(event.id).parents.includes(event.fromId) || byId.get(event.fromId).parents.includes(event.id))
      }
    }
    assert.equal(stack.length, 0)
    assert.equal(score.at(-1).transposeSemitones, 0)
    assert.equal(score.at(-1).id, 0)
    assert.equal(score.at(-1).frequency, 130)
  }
  const score = depthFirstScore(model, 130, null, true)
  assert.ok(score.length > depthFirstScore(model, 130).length)
  assert.ok(score.some(event => event.transposeSemitones >= 14))
  const first = score.findIndex(event => event.direction === 'teleport')
  const jump = score[first]
  const end = score.findIndex((event, index) => index > first && event.direction === 'teleport-return' && event.id === jump.fromId)
  const visited = new Set(score.slice(first, end).map(event => event.id))
  const twin = byId.get(jump.id)
  for (const point of model.points.filter(point => point.path.startsWith(twin.path))) assert.ok(visited.has(point.id))
  assert.equal(score[end + 1].id, byId.get(jump.fromId).parents[0])
  const separate = sharedAncestry(false)
  assert.deepEqual(depthFirstScore(separate, 130, null, true), depthFirstScore(separate, 130))
})


test('Starting pitches span the lowered octave with matching labels', () => {
  assert.equal(startingNotes[0].label, 'Do2')
  assert.equal(startingNotes[11].label, 'Si2')
  for (const note of startingNotes) {
    assert.deepEqual(frequencyNote(note.frequency), { label: note.label, cents: 0 })
    assert.equal(note.frequency, 440 * 2 ** ((note.midi - 69) / 12))
  }
  assert.ok(Math.abs(startingNotes[0].frequency - 65.40639132515) < 1e-9)
})
