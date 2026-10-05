// A walk on genealogical positions, not a search that skips shared identities.
// Every edge is traversed once toward a parent and once on the return journey.
export function depthFirstScore(model, baseFrequency = 130.8127826503, selectedIdentity = null) {
  if (!Number.isFinite(baseFrequency) || baseFrequency <= 0) throw new RangeError('Frequenza iniziale positiva richiesta.')
  const byId = new Map(model.points.map(point => [point.id, point]))
  const score = []
  const occurrences = selectedIdentity === null ? [] : model.points.filter(point => point.identity === selectedIdentity)
  if (selectedIdentity !== null && !occurrences.length) throw new RangeError('Ape selezionata inesistente.')
  const included = point => selectedIdentity === null || occurrences.some(other => point.path.startsWith(other.path) || other.path.startsWith(point.path))
  function append(id, fromId, direction) {
    const point = byId.get(id)
    const value = model.counts[point.generation]
    const previousValue = fromId === null ? value : model.counts[byId.get(fromId).generation]
    score.push({ id, fromId, identity: point.identity, generation: point.generation,
      value, previousValue, ratio: value / previousValue,
      frequency: baseFrequency * value / model.counts[0], direction })
  }
  function visit(id) {
    for (const parent of byId.get(id).parents) {
      if (!included(byId.get(parent))) continue
      append(parent, id, 'ancestor')
      visit(parent)
      append(id, parent, 'return')
    }
  }
  append(0, null, 'start')
  visit(0)
  return score
}

const noteNames = ['Do', 'Do♯', 'Re', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Si♭', 'Si']

// Reference naming only: the synthesizer keeps the original, unrounded pitch.
export function frequencyNote(frequency) {
  if (!Number.isFinite(frequency) || frequency <= 0) throw new RangeError('Frequenza positiva richiesta.')
  const midi = 69 + 12 * Math.log2(frequency / 440)
  const nearest = Math.round(midi)
  const rawCents = (midi - nearest) * 100
  return {
    label: `${noteNames[((nearest % 12) + 12) % 12]}${Math.floor(nearest / 12) - 1}`,
    cents: Math.abs(rawCents) < 1e-8 ? 0 : rawCents,
  }
}

export const startingNotes = noteNames
  .map((label, index) => ({ label: `${label}3`, midi: 48 + index, frequency: 440 * 2 ** ((48 + index - 69) / 12) }))
