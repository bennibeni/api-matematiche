// Pure ancestral tree: every parent is a new, distinct individual.
export function fibonacciLevels(depth) {
  let a = 1,
    b = 1
  return Array.from({ length: depth + 1 }, () => {
    const value = a
    ;[a, b] = [b, a + b]
    return value
  })
}
export function buildTree(depth = 6) {
  if (!Number.isInteger(depth) || depth < 1 || depth > 10)
    throw new RangeError('La profondità deve essere un intero da 1 a 10.')
  const nodes = [],
    levels = Array.from({ length: depth + 1 }, () => [])
  function create(type, generation) {
    const node = { id: nodes.length, type, generation, parents: [], x: 0 }
    nodes.push(node)
    levels[generation].push(node)
    if (generation < depth) {
      node.parents.push(create('F', generation + 1).id)
      if (type === 'F') node.parents.push(create('M', generation + 1).id)
    }
    return node
  }
  const root = create('M', 0)
  const width = Math.max(760, levels[depth].length * 44 + 150)
  const left = 135,
    right = width - 35
  levels[depth].forEach((n, i) => {
    n.x = left + ((i + 0.5) * (right - left)) / levels[depth].length
  })
  for (let g = depth - 1; g >= 0; g--)
    for (const n of levels[g])
      n.x =
        n.parents.reduce((sum, id) => sum + nodes[id].x, 0) / n.parents.length
  return {
    nodes,
    levels,
    root,
    width,
    height: 100 + depth * 100,
    counts: levels.map((l) => l.length),
  }
}
