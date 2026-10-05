export const daughters = Array.from({ length: 6 }, (_, i) => ({
  id: `O${i + 1}`,
  father: i < 3 ? 'A' : 'B',
}))
// Expected identity by descent, with unrelated, non-inbred parents.
export function sisterRelatedness(a, b) {
  if (!a || !b || a.id === b.id)
    throw new Error('Seleziona due operaie distinte.')
  const maternal = 0.25,
    paternal = a.father === b.father ? 0.5 : 0
  return { maternal, paternal, total: maternal + paternal }
}
