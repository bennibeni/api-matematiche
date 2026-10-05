import { buildTree } from './model.js'

// Two alternative histories. Identity and maternal ancestry remain stable.
// The only changed parent list belongs to the female at g1.
export function singleEvent(depth = 6) {
  const standard = buildTree(depth)
  const focalId = standard.root.parents[0]
  const fatherId = standard.nodes[focalId].parents[1]
  const changedNodes = standard.nodes.map((node) => ({
    ...node,
    parents: [...node.parents],
  }))
  changedNodes[focalId].parents = changedNodes[focalId].parents.slice(0, 1)
  const reached = new Set()
  function visit(id) {
    if (reached.has(id)) return
    reached.add(id)
    changedNodes[id].parents.forEach(visit)
  }
  visit(standard.root.id)
  const nodes = changedNodes.filter((n) => reached.has(n.id))
  const levels = standard.levels.map((level) =>
    level.filter((n) => reached.has(n.id)).map((n) => changedNodes[n.id]),
  )
  return {
    standard,
    alternative: { nodes, levels, counts: levels.map((l) => l.length) },
    focalId,
    fatherId,
    removedIds: standard.nodes
      .filter((n) => !reached.has(n.id))
      .map((n) => n.id),
  }
}
