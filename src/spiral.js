import { buildTree } from './model.js'
export const PHI = (1 + Math.sqrt(5)) / 2
export function spiralPoint(theta) {
  const r = 20 * Math.exp((2 * Math.log(PHI) * theta) / Math.PI)
  return { x: r * Math.cos(theta), y: -r * Math.sin(theta), r }
}
export function buildSpiral(depth = 7) {
  if (!Number.isInteger(depth) || depth < 2 || depth > 9)
    throw new RangeError('Profondità da 2 a 9.')
  const ancestry = buildTree(depth),
    points = [],
    segments = []
  ancestry.levels.forEach((level, g) => {
    const start = (g * Math.PI) / 2,
      end = ((g + 1) * Math.PI) / 2
    const samples = Array.from({ length: 65 }, (_, i) =>
      spiralPoint(start + ((end - start) * i) / 64),
    )
    segments.push({
      g,
      samples,
      path: samples.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' '),
    })
    level.forEach((node, i) =>
      points.push({
        ...node,
        ...spiralPoint(start + ((i + 0.5) * (end - start)) / level.length),
      }),
    )
  })
  const all = segments.flatMap((s) => s.samples),
    xs = all.map((p) => p.x),
    ys = all.map((p) => p.y),
    pad = 30
  return {
    points,
    segments,
    counts: ancestry.counts,
    total: points.length,
    viewBox: [
      Math.min(...xs) - pad,
      Math.min(...ys) - pad,
      Math.max(...xs) - Math.min(...xs) + 2 * pad,
      Math.max(...ys) - Math.min(...ys) + 2 * pad,
    ].join(' '),
  }
}
