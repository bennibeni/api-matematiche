import React from 'react'
import { buildTree } from './model.js'
import { GenealogyBee } from './GenealogyBee.jsx'

// Same occurrence IDs as the spiral; only the coordinates change.
const layout = buildTree(6)
const y = generation => 45 + generation * 85

export default function SharedGenealogyGraph({ model, identity, related, onSelect, step }) {
  return <section className="shared-tree-view" aria-labelledby="shared-tree-title">
    <h3 id="shared-tree-title">Il grafo genealogico</h3>
    <p className="shared-caption">Verso gli antenati ↓ · La stessa etichetta indica la stessa ape, anche quando compare in due rami.</p>
    <div className="shared-tree-scroll" tabIndex="0" role="region" aria-label="Grafo genealogico scorribile orizzontalmente">
      <svg viewBox={`0 0 ${layout.width} 625`} role="group" aria-label="Grafo delle stesse api rappresentate sulla spirale">
        {model.rows.map(row => <text key={row.generation} x="18" y={y(row.generation) + 4} className="generation">gen.{row.generation}</text>)}
        {model.points.flatMap(point => point.parents.map(id => {
          const parent = model.points.find(node => node.id === id)
          const active = related(point) && related(parent)
          if (!active) return null
          const x1 = layout.nodes[point.id].x, x2 = layout.nodes[id].x
          const y1 = y(point.generation), y2 = y(parent.generation), middle = (y1 + y2) / 2
          return <path key={`${point.id}-${id}`} d={`M ${x1} ${y1} C ${x1} ${middle}, ${x2} ${middle}, ${x2} ${y2}`} fill="none" stroke={step && ((step.id===id && step.fromId===point.id) || (step.id===point.id && step.fromId===id)) ? '#bd6717' : '#526c58'} strokeWidth={step && ((step.id===id && step.fromId===point.id) || (step.id===point.id && step.fromId===id)) ? 4 : 2} opacity=".7" />
        }))}
        {model.points.map(point => {
          const bee = model.individuals.get(point.identity)
          const active = point.identity === identity
          const x = layout.nodes[point.id].x
          const cy = y(point.generation)
          if (!related(point)) return null
          return <g key={point.id} role="button" tabIndex="0" aria-pressed={active} aria-label={`Grafo: ${bee.label}, gen.${point.generation}, posizione ${point.id + 1}`} className="shared-bee" opacity={related(point) ? 1 : .3} onClick={() => onSelect(point.identity)} onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelect(point.identity)
            }
          }}>
            <circle className="shared-bee-outline" cx={x} cy={cy} r={active ? 24 : 21} fill={bee.occurrences.length > 1 ? '#925c87' : '#fffdf6'} stroke={active ? '#bc3434' : bee.occurrences.length > 1 ? '#925c87' : '#9ca98d'} strokeWidth={active ? 5 : 2} />
            <GenealogyBee type={point.type} x={x} y={cy} />
            {step?.id===point.id && <circle cx={x} cy={cy} r="29" fill="none" stroke="#bd6717" strokeWidth="4" className="music-cursor" />}
            <text x={x} y={cy + 34} textAnchor="middle" className="shared-tree-label">{bee.label}<tspan x={x} dy="12">n = {model.counts[point.generation]}</tspan></text>
          </g>
        })}
      </svg>
    </div>
  </section>
}
