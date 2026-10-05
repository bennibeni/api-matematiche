import { PHI } from './spiral.js'

// Count parents by sex without constructing an exponentially growing tree.
export function ancestralRatios(depth = 16) {
  if (!Number.isInteger(depth) || depth < 0 || depth > 30)
    throw new RangeError('Generazione da 0 a 30.')
  let females = 0,
    males = 1
  return Array.from({ length: depth + 1 }, (_, generation) => {
    const ratio = males === 0 ? null : females / males
    const row = {
      generation,
      females,
      males,
      ratio,
      errorPercent: ratio === null ? null : (100 * Math.abs(ratio - PHI)) / PHI,
    }
    ;[females, males] = [females + males, females]
    return row
  })
}
