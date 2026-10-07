export const GOLDEN_PEAK = (Math.sqrt(5) - 1) / 2;

export function identityNotes(model, base, scale = 'major') {
  const intervals =
    scale === 'major' ? [0, 2, 4, 5, 7, 9, 11] : scale === 'minor' ? [0, 2, 3, 5, 7, 8, 10] : null;
  if (!intervals) throw new RangeError('Scala sconosciuta.');
  return [...model.individuals.values()].map((bee) => {
    // Labels retain the original breadth-first position, even after identities merge.
    const index = Number(bee.label.split(' ')[1]) - 1;
    let a = 0,
      b = 1;
    for (let i = 0; i < index; i++) [a, b] = [b, a + b];
    return {
      identity: bee.identity,
      label: bee.label,
      index,
      fibonacci: a,
      degree: a % 7,
      frequency: base * 2 ** (intervals[a % 7] / 12),
    };
  });
}

export function generationFrequency(counts, generation, base, mode = 'ratios') {
  if (mode === 'semitones') return base * 2 ** ((generation === 0 ? 0 : counts[generation]) / 12);
  if (mode !== 'ratios') throw new RangeError('Modalità musicale sconosciuta.');
  return (base * counts[generation]) / counts[0];
}

// Outbound duplicate jumps through generation 4, spaced by four node transitions.
export function varyDuplicates(score, variation = 'none', scale = 'major', base = 65.40639132515) {
  if (!['none', 'ornament'].includes(variation)) throw new RangeError('Variazione sconosciuta.');
  if (variation === 'none') return score;
  const intervals = scale === 'minor' ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const result = [];
  let lastOrnamentNodeIndex = -Infinity;
  for (const [index, event] of score.entries()) {
    const eligible =
      event.generation <= 4 &&
      (['Ape 8', 'Ape 9'].includes(event.beeLabel) || index - lastOrnamentNodeIndex >= 4);
    if (event.direction === 'teleport' && eligible) {
      lastOrnamentNodeIndex = index;
      const offset = Math.round(12 * Math.log2(event.frequency / base));
      const degree = intervals.indexOf(((offset % 12) + 12) % 12);
      const next = degree === 6 ? 12 : intervals[degree + 1];
      const upper = event.frequency * 2 ** ((next - intervals[degree]) / 12);
      [event.frequency, upper, event.frequency].forEach((frequency, part) =>
        result.push({
          ...event,
          frequency,
          beatDuration: 0.5 / 3,
          ornamentPart: part + 1,
          pathNodeIndex: index,
        }),
      );
    } else {
      result.push({
        ...event,
        beatDuration: 0.5,
      });
    }
  }
  return result.map((event, i) => ({
    ...event,
    ratio: i ? event.frequency / result[i - 1].frequency : 1,
  }));
}

// Timing is part of the score, shared by audio and the visual cursor.
export function phraseScore(score, timbre = 'pure') {
  let onset = 0;
  return score.map((event, index) => {
    const final = index === score.length - 1;
    const duration = final ? 1 : (event.beatDuration ?? 0.5);
    const soundDuration = final ? 0.75 : duration + 0.02;
    const velocity = final ? 0.9 : event.direction.includes('return') ? 0.65 : 1;
    const result = { ...event, onset, duration, soundDuration, velocity, final };
    onset += duration;
    return result;
  });
}

// A walk on genealogical positions, not a search that skips shared identities.
// Twin excursions add a complete walk before resuming the original branch.
export function depthFirstScore(
  model,
  baseFrequency = 32.703195662575,
  selectedIdentity = null,
  teleportTwins = false,
  mode = 'ratios',
  scale = 'major',
) {
  if (!Number.isFinite(baseFrequency) || baseFrequency <= 0)
    throw new RangeError('Frequenza iniziale positiva richiesta.');
  const byId = new Map(model.points.map((point) => [point.id, point]));
  const score = [];
  const pitches =
    mode === 'identity'
      ? new Map(identityNotes(model, baseFrequency, scale).map((n) => [n.identity, n.frequency]))
      : null;
  const identityValues = new Map(
    identityNotes(model, baseFrequency, scale).map((n) => [n.identity, n.fibonacci]),
  );
  const occurrences =
    selectedIdentity === null
      ? []
      : model.points.filter((point) => point.identity === selectedIdentity);
  if (selectedIdentity !== null && !occurrences.length)
    throw new RangeError('Ape selezionata inesistente.');
  const included = (point) =>
    selectedIdentity === null ||
    occurrences.some(
      (other) => point.path.startsWith(other.path) || other.path.startsWith(point.path),
    );
  let transposeSemitones = 0;
  function append(id, fromId, direction) {
    const point = byId.get(id);
    const value = model.counts[point.generation];
    const previousValue = fromId === null ? value : model.counts[byId.get(fromId).generation];
    const frequency =
      (pitches
        ? pitches.get(point.identity)
        : generationFrequency(model.counts, point.generation, baseFrequency, mode)) *
      2 ** (transposeSemitones / 12);
    const previousFrequency = score.at(-1)?.frequency ?? frequency;
    score.push({
      id,
      fromId,
      identity: point.identity,
      generation: point.generation,
      fibonacci: identityValues.get(point.identity),
      beeLabel: model.individuals.get(point.identity).label,
      value,
      previousValue,
      ratio: frequency / previousFrequency,
      frequency,
      transposeSemitones,
      mode,
      direction,
    });
  }
  const twins = new Map();
  for (const point of model.points) {
    if (!twins.has(point.identity)) twins.set(point.identity, []);
    twins.get(point.identity).push(point.id);
  }
  // Only an arrival from a child starts an excursion. Returns resume the
  // suspended walk; a twin cannot bounce back while its identity is active.
  const activeTwins = new Set();
  function visit(id, excursion = false) {
    const identity = byId.get(id).identity;
    if (teleportTwins && !activeTwins.has(identity)) {
      activeTwins.add(identity);
      for (const twin of twins.get(identity)) {
        if (twin === id) continue;
        const previousTranspose = transposeSemitones;
        transposeSemitones = mode === 'identity' ? 0 : previousTranspose === 0 ? 5 : 0;
        append(twin, id, 'teleport');
        visit(twin, true);
        transposeSemitones = previousTranspose;
        append(id, twin, 'teleport-return');
      }
      activeTwins.delete(identity);
    }
    for (const parent of byId.get(id).parents) {
      if (!excursion && !included(byId.get(parent))) continue;
      append(parent, id, 'ancestor');
      visit(parent, excursion);
      append(id, parent, 'return');
    }
  }
  append(0, null, 'start');
  visit(0);
  return score;
}

const noteNames = ['Do', 'Do♯', 'Re', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Si♭', 'Si'];

// Reference naming only: the synthesizer keeps the original, unrounded pitch.
export function frequencyNote(frequency) {
  if (!Number.isFinite(frequency) || frequency <= 0)
    throw new RangeError('Frequenza positiva richiesta.');
  const midi = 69 + 12 * Math.log2(frequency / 440);
  const nearest = Math.round(midi);
  const rawCents = (midi - nearest) * 100;
  return {
    label: `${noteNames[((nearest % 12) + 12) % 12]}${Math.floor(nearest / 12) - 1}`,
    cents: Math.abs(rawCents) < 1e-8 ? 0 : rawCents,
  };
}

export const startingNotes = noteNames.map((label, index) => ({
  label: `${label}1`,
  midi: 24 + index,
  frequency: 440 * 2 ** ((24 + index - 69) / 12),
}));
