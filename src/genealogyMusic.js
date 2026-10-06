// A walk on genealogical positions, not a search that skips shared identities.
// Twin excursions add a complete walk before resuming the original branch.
export function depthFirstScore(
  model,
  baseFrequency = 65.40639132515,
  selectedIdentity = null,
  teleportTwins = false,
) {
  if (!Number.isFinite(baseFrequency) || baseFrequency <= 0)
    throw new RangeError('Frequenza iniziale positiva richiesta.')
  const byId = new Map(model.points.map((point) => [point.id, point]))
  const score = []
  const occurrences =
    selectedIdentity === null
      ? []
      : model.points.filter((point) => point.identity === selectedIdentity)
  if (selectedIdentity !== null && !occurrences.length)
    throw new RangeError('Ape selezionata inesistente.')
  const included = (point) =>
    selectedIdentity === null ||
    occurrences.some(
      (other) =>
        point.path.startsWith(other.path) || other.path.startsWith(point.path),
    )
  let transposeSemitones = 0
  function append(id, fromId, direction) {
    const point = byId.get(id)
    const value = model.counts[point.generation]
    const previousValue =
      fromId === null ? value : model.counts[byId.get(fromId).generation]
    const frequency = (baseFrequency * value / model.counts[0]) * 2 ** (transposeSemitones / 12)
    const previousFrequency = score.at(-1)?.frequency ?? frequency
    score.push({
      id,
      fromId,
      identity: point.identity,
      generation: point.generation,
      value,
      previousValue,
      ratio: frequency / previousFrequency,
      frequency,
      transposeSemitones,
      direction,
    })
  }
  const twins = new Map()
  for (const point of model.points) {
    if (!twins.has(point.identity)) twins.set(point.identity, [])
    twins.get(point.identity).push(point.id)
  }
  // Only an arrival from a child starts an excursion. Returns resume the
  // suspended walk; a twin cannot bounce back while its identity is active.
  const activeTwins = new Set()
  function visit(id, excursion = false) {
    const identity = byId.get(id).identity
    if (teleportTwins && !activeTwins.has(identity)) {
      activeTwins.add(identity)
      for (const twin of twins.get(identity)) {
        if (twin === id) continue
        const previousTranspose = transposeSemitones
        transposeSemitones += 7
        append(twin, id, 'teleport')
        visit(twin, true)
        transposeSemitones = previousTranspose
        append(id, twin, 'teleport-return')
      }
      activeTwins.delete(identity)
    }
    for (const parent of byId.get(id).parents) {
      if (!excursion && !included(byId.get(parent))) continue
      append(parent, id, 'ancestor')
      visit(parent, excursion)
      append(id, parent, 'return')
    }
  }
  append(0, null, 'start')
  visit(0)
  return score
}

const noteNames = [
  'Do',
  'Do♯',
  'Re',
  'Mi♭',
  'Mi',
  'Fa',
  'Fa♯',
  'Sol',
  'La♭',
  'La',
  'Si♭',
  'Si',
]

// Reference naming only: the synthesizer keeps the original, unrounded pitch.
export function frequencyNote(frequency) {
  if (!Number.isFinite(frequency) || frequency <= 0)
    throw new RangeError('Frequenza positiva richiesta.')
  const midi = 69 + 12 * Math.log2(frequency / 440)
  const nearest = Math.round(midi)
  const rawCents = (midi - nearest) * 100
  return {
    label: `${noteNames[((nearest % 12) + 12) % 12]}${Math.floor(nearest / 12) - 1}`,
    cents: Math.abs(rawCents) < 1e-8 ? 0 : rawCents,
  }
}

export const startingNotes = noteNames.map((label, index) => ({
  label: `${label}2`,
  midi: 36 + index,
  frequency: 440 * 2 ** ((36 + index - 69) / 12),
}))
