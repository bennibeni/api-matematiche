import test from 'node:test';
import assert from 'node:assert/strict';
import {
  depthFirstScore,
  frequencyNote,
  startingNotes,
  phraseScore,
  varyDuplicates,
  identityNotes,
  GOLDEN_PEAK,
  generationFrequency,
} from './genealogyMusic.js';
import { sharedAncestry } from './sharedAncestry.js';

test('Depth-first music visits every position and traverses every edge in both directions', () => {
  const model = sharedAncestry();
  const byId = new Map(model.points.map((point) => [point.id, point]));
  const score = depthFirstScore(model, 130);
  assert.equal(score.length, 2 * model.points.length - 1);
  assert.equal(score[0].id, 0);
  assert.equal(score.at(-1).id, 0);
  assert.equal(score.at(-1).frequency, 130);
  const edges = new Map();
  const entered = new Set([0]);
  for (let i = 1; i < score.length; i++) {
    const event = score[i];
    assert.equal(event.fromId, score[i - 1].id);
    const previous = byId.get(event.fromId);
    const current = byId.get(event.id);
    if (event.direction === 'ancestor') {
      assert.ok(previous.parents.includes(event.id));
      assert.ok(!entered.has(event.id));
      entered.add(event.id);
    } else {
      assert.ok(current.parents.includes(event.fromId));
    }
    const key = [event.id, event.fromId].sort((a, b) => a - b).join(':');
    edges.set(key, (edges.get(key) || 0) + 1);
    assert.ok(Math.abs(event.frequency - score[i - 1].frequency * event.ratio) < 1e-9);
  }
  assert.equal(entered.size, model.points.length);
  assert.equal(edges.size, model.points.length - 1);
  assert.ok([...edges.values()].every((count) => count === 2));
  // The initial descent always follows the maternal branch to the depth limit.
  assert.deepEqual(
    score.slice(0, 7).map((event) => byId.get(event.id).path),
    ['', 'm', 'mm', 'mmm', 'mmmm', 'mmmmm', 'mmmmmm'],
  );
});

test('Generation weights transpose exactly and shared identities do not change this first score', () => {
  const model = sharedAncestry(true);
  const base = depthFirstScore(model, startingNotes[0].frequency);
  const transposed = depthFirstScore(model, startingNotes[9].frequency);
  const factor = startingNotes[9].frequency / startingNotes[0].frequency;
  base.forEach((event, index) => {
    assert.equal(event.value, model.counts[event.generation]);
    assert.ok(Math.abs(transposed[index].frequency / event.frequency - factor) < 1e-12);
  });
  assert.deepEqual(
    base.map((event) => event.frequency),
    depthFirstScore(sharedAncestry(false), startingNotes[0].frequency).map(
      (event) => event.frequency,
    ),
  );
  assert.equal(
    new Set(base.filter((event) => event.generation === 6).map((event) => event.frequency)).size,
    1,
  );
  for (const value of [0, -1, NaN, Infinity]) assert.throws(() => depthFirstScore(model, value));
});

test('Frequency naming distinguishes exact equal-tempered pitches from Fibonacci partials', () => {
  assert.deepEqual(frequencyNote(440), { label: 'La4', cents: 0 });
  const c3 = startingNotes[0].frequency * 4;
  assert.deepEqual(frequencyNote(c3 * 8), { label: 'Do6', cents: 0 });
  assert.equal(frequencyNote(c3 * 3).label, 'Sol4');
  assert.ok(Math.abs(frequencyNote(c3 * 3).cents - 1.9550008654) < 1e-7);
  assert.equal(frequencyNote(c3 * 5).label, 'Mi5');
  assert.ok(Math.abs(frequencyNote(c3 * 5).cents + 13.6862861352) < 1e-7);
  assert.equal(frequencyNote(c3 * 13).label, 'La♭6');
  assert.ok(Math.abs(frequencyNote(c3 * 13).cents - 40.5276617693) < 1e-7);
  assert.deepEqual(frequencyNote(startingNotes[11].frequency * 4), {
    label: 'Si3',
    cents: 0,
  });
  assert.deepEqual(frequencyNote(c3 * 2), { label: 'Do4', cents: 0 });
  for (const value of [0, -1, NaN, Infinity]) assert.throws(() => frequencyNote(value));
});

test('Selecting a shared bee plays both family paths and returns to the initial male', () => {
  const model = sharedAncestry(true);
  const score = depthFirstScore(model, 130, 'mmmmp');
  assert.equal(score.length, 23);
  assert.equal(new Set(score.map((event) => event.id)).size, 12);
  assert.equal(
    new Set(score.filter((event) => event.identity === 'mmmmp').map((event) => event.id)).size,
    2,
  );
  assert.equal(score.at(-1).id, 0);
  assert.equal(score.at(-1).frequency, 130);
  const byId = new Map(model.points.map((point) => [point.id, point]));
  for (const event of score.slice(1)) {
    assert.ok(
      byId.get(event.fromId).parents.includes(event.id) ||
        byId.get(event.id).parents.includes(event.fromId),
    );
  }
  assert.deepEqual(depthFirstScore(model, 130, ''), depthFirstScore(model, 130));
  assert.throws(() => depthFirstScore(model, 130, 'missing'));
});

test('Twin excursions alternate two registers and restore each suspended register', () => {
  const model = sharedAncestry(true);
  const byId = new Map(model.points.map((point) => [point.id, point]));
  for (const selected of [null, 'mmmmp', 'mmm', 'mmp']) {
    const score = depthFirstScore(model, 130, selected, true);
    const stack = [];
    for (let i = 1; i < score.length; i++) {
      const event = score[i];
      assert.equal(event.fromId, score[i - 1].id);
      assert.ok(
        Math.abs(event.frequency - 130 * event.value * 2 ** (event.transposeSemitones / 12)) < 1e-9,
      );
      assert.ok(Math.abs(event.frequency - score[i - 1].frequency * event.ratio) < 1e-9);
      if (event.direction.startsWith('teleport')) {
        assert.equal(byId.get(event.id).identity, byId.get(event.fromId).identity);
        assert.notEqual(event.id, event.fromId);
        const semitones = score[i - 1].transposeSemitones === 0 ? 5 : -5;
        assert.ok(Math.abs(event.ratio - 2 ** (semitones / 12)) < 1e-12);
        assert.equal(event.transposeSemitones, score[i - 1].transposeSemitones + semitones);
        if (event.direction === 'teleport') {
          assert.ok(!stack.some((item) => item.identity === event.identity));
          stack.push(event);
        } else {
          const outward = stack.pop();
          assert.equal(event.id, outward.fromId);
          assert.equal(event.fromId, outward.id);
          assert.equal(event.transposeSemitones, outward.transposeSemitones === 0 ? 5 : 0);
        }
      } else {
        assert.equal(event.transposeSemitones, score[i - 1].transposeSemitones);
        assert.ok(
          byId.get(event.id).parents.includes(event.fromId) ||
            byId.get(event.fromId).parents.includes(event.id),
        );
      }
    }
    assert.equal(stack.length, 0);
    assert.equal(score.at(-1).transposeSemitones, 0);
    assert.equal(score.at(-1).id, 0);
    assert.equal(score.at(-1).frequency, 130);
  }
  const score = depthFirstScore(model, 130, null, true);
  assert.ok(score.length > depthFirstScore(model, 130).length);
  assert.deepEqual(new Set(score.map((event) => event.transposeSemitones)), new Set([0, 5]));
  const first = score.findIndex((event) => event.direction === 'teleport');
  const jump = score[first];
  const end = score.findIndex(
    (event, index) =>
      index > first && event.direction === 'teleport-return' && event.id === jump.fromId,
  );
  const visited = new Set(score.slice(first, end).map((event) => event.id));
  const twin = byId.get(jump.id);
  for (const point of model.points.filter((point) => point.path.startsWith(twin.path)))
    assert.ok(visited.has(point.id));
  assert.equal(score[end + 1].id, byId.get(jump.fromId).parents[0]);
  const separate = sharedAncestry(false);
  assert.deepEqual(depthFirstScore(separate, 130, null, true), depthFirstScore(separate, 130));
});

test('Starting pitches span the lowered octave with matching labels', () => {
  assert.equal(startingNotes[0].label, 'Do1');
  assert.equal(startingNotes[11].label, 'Si1');
  for (const note of startingNotes) {
    assert.deepEqual(frequencyNote(note.frequency), { label: note.label, cents: 0 });
    assert.equal(note.frequency, 440 * 2 ** ((note.midi - 69) / 12));
  }
  assert.ok(Math.abs(startingNotes[0].frequency - 32.703195662575) < 1e-9);
});

test('Semitone mode uses absolute offsets and retains the same walk in both jump modes', () => {
  const model = sharedAncestry(true);
  const base = 130.8127826503;
  const offsets = [0, 1, 2, 3, 5, 8, 13];
  for (const jumps of [false, true]) {
    for (const selected of [null, 'mmm']) {
      const score = depthFirstScore(model, base, selected, jumps, 'semitones');
      const ratios = depthFirstScore(model, base, selected, jumps, 'ratios');
      assert.deepEqual(
        score.map((e) => [e.id, e.direction]),
        ratios.map((e) => [e.id, e.direction]),
      );
      for (const event of score) {
        const offset = 12 * Math.log2(event.frequency / base);
        assert.ok(Math.abs(offset - offsets[event.generation] - event.transposeSemitones) < 1e-10);
        assert.ok([0, 5].includes(event.transposeSemitones));
      }
      assert.equal(score.at(-1).frequency, base);
    }
  }
  assert.throws(() => generationFrequency(model.counts, 0, base, 'missing'));
});

test('Phrasing creates a legato timeline with softer returns and a sustained ending', () => {
  for (const mode of ['ratios', 'semitones'])
    for (const jumps of [false, true]) {
      const raw = depthFirstScore(sharedAncestry(), 130, null, jumps, mode);
      for (const timbre of ['pure', 'swarm']) {
        const score = phraseScore(raw, timbre);
        assert.equal(score[0].onset, 0);
        for (let i = 0; i < score.length; i++) {
          const e = score[i];
          assert.ok(
            e.final
              ? e.soundDuration < e.duration
              : Math.abs(e.soundDuration - e.duration - 0.02) < 1e-12,
          );
          if (i) assert.equal(e.onset, score[i - 1].onset + score[i - 1].duration);
          if (!e.final) {
            assert.equal(e.soundDuration, 0.52);
            assert.equal(e.velocity, e.direction.includes('return') ? 0.65 : 1);
            assert.equal(e.duration, 0.5);
          }
        }
        assert.equal(score.at(-1).soundDuration, 0.75);
        assert.equal(score.at(-1).duration, 1);
        assert.deepEqual(
          score.map((e) => e.frequency),
          raw.map((e) => e.frequency),
        );
      }
    }
});

test('Identity notes follow Fibonacci modulo seven and survive sharing and selection', () => {
  const separate = sharedAncestry(false),
    shared = sharedAncestry(true);
  const base = startingNotes[0].frequency;
  const rows = identityNotes(separate, base);
  assert.deepEqual(
    rows.slice(0, 8).map((r) => r.degree),
    [0, 1, 1, 2, 3, 5, 1, 6],
  );
  for (const row of rows.slice(0, 16))
    assert.equal(row.degree, rows[row.index + 16]?.degree ?? row.degree);
  for (const row of identityNotes(shared, base)) {
    assert.equal(row.frequency, rows.find((r) => r.identity === row.identity).frequency);
  }
  for (const scale of ['major', 'minor'])
    for (const jumps of [false, true]) {
      const notes = new Map(
        identityNotes(shared, base, scale).map((r) => [r.identity, r.frequency]),
      );
      for (const selected of [null, 'mmm']) {
        const score = depthFirstScore(shared, base, selected, jumps, 'identity', scale);
        for (const event of score) {
          assert.equal(event.frequency, notes.get(event.identity));
          assert.equal(event.transposeSemitones, 0);
          assert.ok(event.frequency >= base && event.frequency < base * 2);
        }
        assert.equal(score.at(-1).frequency, base);
      }
    }
  assert.notDeepEqual(identityNotes(shared, base, 'major'), identityNotes(shared, base, 'minor'));
  assert.ok(Math.abs(GOLDEN_PEAK - 0.61803398875) < 1e-12);
});

test('Transitions through Ape 2 have no extra pauses', () => {
  const model = sharedAncestry();
  const score = phraseScore(depthFirstScore(model));
  const transitions = score.slice(0, -1).map((e, i) => ({
    from: model.individuals.get(e.identity).label,
    to: model.individuals.get(score[i + 1].identity).label,
    gap: score[i + 1].onset - e.onset,
  }));
  for (const target of ['Ape 4', 'Ape 1']) {
    const transition = transitions.find((t) => t.from === 'Ape 2' && t.to === target);
    assert.ok(transition);
    assert.equal(transition.gap, 0.5);
  }
});

test('Ornaments always mark Ape 8 and Ape 9 outbound jumps, with spacing for other bees', () => {
  const base = 65.40639132515;
  for (const scale of ['major', 'minor'])
    for (const selected of [null, 'mmm']) {
      const raw = depthFirstScore(sharedAncestry(), base, selected, true, 'identity', scale);
      const decorated = varyDuplicates(raw, 'ornament', scale, base);
      const starts = decorated.filter((e) => e.ornamentPart === 1);
      starts.forEach((e, i) => {
        assert.equal(e.direction, 'teleport');
        assert.ok(e.generation <= 4);
        if (i && !['Ape 8', 'Ape 9'].includes(e.beeLabel))
          assert.ok(e.pathNodeIndex - starts[i - 1].pathNodeIndex >= 4);
      });
      if (selected === null) {
        assert.deepEqual(
          starts.map((e) => e.pathNodeIndex + 1),
          [5, 7, 75, 120, 188, 249, 251, 319, 364, 432],
        );
        assert.equal(starts.length, 10);
      }
      for (const label of ['Ape 8', 'Ape 9']) {
        assert.equal(
          starts.filter((e) => e.beeLabel === label).length,
          raw.filter((e) => e.beeLabel === label && e.direction === 'teleport').length,
        );
      }
      assert.equal(decorated.length, raw.length + 2 * starts.length);
      assert.ok(
        Math.abs(phraseScore(decorated).at(-1).onset - phraseScore(raw).at(-1).onset) < 1e-8,
      );
      const notes = decorated.filter((e) => e.ornamentPart);
      for (let i = 0; i < notes.length; i += 3) {
        assert.equal(notes[i].frequency, notes[i + 2].frequency);
        assert.ok(notes[i + 1].frequency > notes[i].frequency);
      }
      const retimed = varyDuplicates(
        raw.map((e) => ({ ...e, beatDuration: 0.1 })),
        'ornament',
        scale,
        base,
      );
      assert.deepEqual(
        retimed.filter((e) => e.ornamentPart === 1).map((e) => e.pathNodeIndex),
        starts.map((e) => e.pathNodeIndex),
      );
      assert.equal(varyDuplicates(raw, 'none'), raw);
    }
  const plain = depthFirstScore(sharedAncestry(false), base, null, true, 'identity');
  assert.ok(varyDuplicates(plain, 'ornament').every((e) => !e.ornamentPart));
});
