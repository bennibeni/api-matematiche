import { buildSpiral } from './spiral.js'

// One deliberate merger: the two mothers at gen.3 become the same individual.
// Their entire parental history must then agree, not only their displayed name.
export function sharedAncestry(shared = true) {
  const spiral = buildSpiral(6)
  const byId = new Map(spiral.points.map(node => [node.id, node]))
  const paths = new Map()
  function visit(id, path) {
    paths.set(id, path)
    byId.get(id).parents.forEach((parent, index) => visit(parent, path + (index ? 'p' : 'm')))
  }
  visit(0, '')
  const canonical = path => shared && path.startsWith('mpm') ? 'mmm' + path.slice(3) : path
  const points = spiral.points.map(node => ({
    ...node,
    path: paths.get(node.id),
    identity: canonical(paths.get(node.id)),
  }))
  const individuals = new Map()
  for (const [index, point] of points.entries()) {
    if (!individuals.has(point.identity)) {
      individuals.set(point.identity, {
        identity: point.identity,
        label: `Ape ${index + 1}`,
        type: point.type,
        generation: point.generation,
        occurrences: [],
        parents: point.parents.map(id => canonical(paths.get(id))),
      })
    }
    individuals.get(point.identity).occurrences.push(point.id)
  }
  const rows = spiral.counts.map((positions, generation) => ({
    generation,
    positions,
    unique: new Set(points.filter(point => point.generation === generation).map(point => point.identity)).size,
  }))
  // Expected nuclear ancestry of the focal male: mother-only transmission
  // contributes 1, while each parent of a female contributes 1/2.
  const contributions = new Map([[0, 1]])
  for (const point of points) {
    const weight = contributions.get(point.id)
    for (const id of point.parents) contributions.set(id, weight / point.parents.length)
  }
  return { ...spiral, points, individuals, rows, contributions }
}

