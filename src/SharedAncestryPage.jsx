import React, { useMemo, useRef, useState } from 'react'
import { Navigation, PageHeadingLabel, PageJourney } from './Navigation.jsx'
import { GenealogyBee } from './GenealogyBee.jsx'
import { sharedAncestry } from './sharedAncestry.js'
import GenealogyPlayer from './GenealogyPlayer.jsx'
import SharedGenealogyGraph from './SharedGenealogyGraph.jsx'
import SharedInsights from './SharedInsights.jsx'

const colors = ['#658779', '#b88735', '#87789d', '#458d92', '#b86b52', '#6f893e', '#a36885']

export default function SharedAncestryPage() {
  const [shared, setShared] = useState(true)
  const [view, setView] = useState('graph')
  const [selected, setSelected] = useState(null)
  const [highlightPaths, setHighlightPaths] = useState(true)
  const [sounding, setSounding] = useState(null)
  const diagram = useRef(null)
  const model = useMemo(() => sharedAncestry(shared), [shared])
  const byId = new Map(model.points.map(point => [point.id, point]))
  const identity = selected
  const chosen = identity === null ? null : model.individuals.get(identity)
  const occurrences = chosen ? model.points.filter(point => point.identity === identity) : []
  const related = point => sounding !== null || !highlightPaths || !chosen || occurrences.some(other => point.path.startsWith(other.path) || other.path.startsWith(point.path))
  const final = model.rows[6]

  function showStep(step) {
    setSounding(step)
    if (step?.index === 0) diagram.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function selectIdentity(value) {
    setSelected(value === selected ? null : value)
  }

  function changeSharing(event) {
    setShared(event.target.checked)
    setSelected(null)
    setSounding(null)
  }

  return <main className="shared-ancestry-page">
    <header><Navigation page="shared" /></header>
    <section className="colony-intro">
      <PageHeadingLabel page="shared" />
      <h1>Una stessa ape.<br /><em>Più percorsi.</em></h1>
      <p>In questo esperimento, una <strong>stessa antenata può essere raggiunta attraverso due o più rami familiari diversi</strong>. Per questo possiamo avere ad esempio 13 immagini sul grafo ma soltanto 8 api diverse.</p>
    </section>
    <aside className="reading-note" aria-label="Da tenere a mente"><strong>Da tenere a mente</strong><p>Disattiva e riattiva la casella: le 13 immagini di gen.6 restano al loro posto, ma le api diverse passano da 13 a 8. Esploriamo questi percorsi come una partitura: i numeri assegnati alle generazioni determinano i suoni. Per ora la condivisione cambia le identità, ma non i numeri né la musica.</p></aside>
    <div className="uniparental-toggle"><label><input type="checkbox" checked={shared} onChange={changeSharing} />Una madre condivisa in gen.3</label></div>
    <p className="shared-premise">Con la casella attiva, la madre e il padre della femmina di gen.1 hanno la stessa madre: sono fratelli per parte materna. Abbiamo scelto questa singola condivisione per poterne osservare le conseguenze.</p>
    <section className="lab" aria-labelledby="shared-spiral-title">
      <div className="lab-heading"><div><h2 id="shared-spiral-title">Le stesse api, nel grafo e nella spirale</h2><p className="shared-caption">I due disegni mostrano le stesse api e gli stessi legami di parentela. Cambia soltanto la disposizione. Clicca un’ape per seguire i suoi percorsi. La selezione si conserva cambiando vista.</p></div></div>
      <div className="shared-view-switch" role="group" aria-label="Scegli la rappresentazione"><button aria-pressed={view==='graph'} onClick={() => setView('graph')}>Grafo genealogico</button><button aria-pressed={view==='spiral'} onClick={() => setView('spiral')}>Spirale</button></div>
      <div className="shared-counts" role="status"><div><strong>{final.positions}</strong><span>posizioni in gen.6</span></div><div><strong>{final.unique}</strong><span>api distinte in gen.6</span></div><div><strong>{final.positions - final.unique}</strong><span>occorrenze aggiuntive delle stesse api</span></div></div>
      <GenealogyPlayer key={String(shared)} model={model} onStep={showStep} selectedIdentity={selected} />
      <p className="shared-click-hint">Seleziona un’ape per scegliere i percorsi da suonare. Cliccala di nuovo per tornare al brano dell’intera genealogia.</p>
      <label className="prominent-check shared-path-toggle"><input type="checkbox" checked={highlightPaths} disabled={!chosen || sounding!==null} onChange={event => setHighlightPaths(event.target.checked)} />Mostra solo i percorsi dell’ape selezionata</label>
      <p className="shared-selection" aria-live="polite">{sounding ? 'Durante l’ascolto sono visibili tutti i percorsi. Il cerchio arancione indica la posizione suonata; la linea arancione è il collegamento appena percorso.' : chosen ? `${chosen.label} · gen.${chosen.generation} · ${chosen.occurrences.length} ${chosen.occurrences.length === 1 ? 'immagine' : 'immagini'} in ciascun disegno. Contorno rosso: ape selezionata. ${highlightPaths ? 'Sono visibili solo i percorsi che passano da lei.' : 'Tutti i percorsi restano visibili.'}` : 'Tutti i percorsi sono visibili. Il contorno viola identifica le api che compaiono in più posizioni.'}</p>
      <div ref={diagram} className="shared-playing-diagram">
      {view==='graph' ? <SharedGenealogyGraph model={model} identity={identity} related={related} onSelect={selectIdentity} step={sounding} /> : <>
      <section className="shared-spiral-view" aria-labelledby="shared-spiral-view-title">
      <h3 id="shared-spiral-view-title">Le stesse api sulla spirale</h3>
      <p className="shared-caption">Verso gli antenati: dal centro all’esterno. Ogni ape mantiene la stessa etichetta del grafo.</p>
      <svg className="shared-spiral" viewBox={model.viewBox} role="group" aria-label="Spirale delle posizioni genealogiche con antenata condivisa selezionabile">
        {model.segments.map(segment => <path key={segment.g} d={segment.path} fill="none" stroke={colors[segment.g]} strokeWidth="3" vectorEffect="non-scaling-stroke" opacity=".22" />)}
        {model.points.flatMap(point => point.parents.map(id => {
          const parent = byId.get(id)
          const active = related(point) && related(parent)
          if (!active) return null
          const cx = (point.x + parent.x) / 2 - (parent.y - point.y) * 0.12
          const cy = (point.y + parent.y) / 2 + (parent.x - point.x) * 0.12
          return <path key={`${point.id}-${id}`} d={`M ${point.x} ${point.y} Q ${cx} ${cy} ${parent.x} ${parent.y}`} fill="none" stroke={sounding && ((sounding.id===id && sounding.fromId===point.id) || (sounding.id===point.id && sounding.fromId===id)) ? '#bd6717' : '#526c58'} strokeWidth={sounding && ((sounding.id===id && sounding.fromId===point.id) || (sounding.id===point.id && sounding.fromId===id)) ? 4 : 2} vectorEffect="non-scaling-stroke" opacity=".7" />
        }))}
        {model.points.map(point => {
          const bee = model.individuals.get(point.identity)
          const active = point.identity === identity
          if (!related(point)) return null
          return <g key={point.id} role="button" tabIndex="0" aria-pressed={active} aria-label={`${bee.label}, ${point.type === 'F' ? 'femmina' : 'maschio aploide'}, gen.${point.generation}, posizione ${point.id + 1}, ${bee.occurrences.length} occorrenze`} className="shared-bee" onClick={() => setSelected(point.identity === selected ? null : point.identity)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(point.identity === selected ? null : point.identity) } }} opacity={related(point) ? 1 : .3}>
            <circle className="shared-bee-outline" cx={point.x} cy={point.y} r={active ? 24 : 22} fill={bee.occurrences.length > 1 ? '#925c87' : '#fffdf6'} stroke={active ? '#bc3434' : bee.occurrences.length > 1 ? '#925c87' : colors[point.generation]} strokeWidth={active ? 5 : 2} />
            <GenealogyBee type={point.type} x={point.x} y={point.y} />
            {sounding?.id===point.id && <circle cx={point.x} cy={point.y} r="29" fill="none" stroke="#bd6717" strokeWidth="4" className="music-cursor" />}
            <text x={point.x} y={point.y + 35} textAnchor="middle" className="shared-tree-label">{bee.label}<tspan x={point.x} dy="12">n = {model.counts[point.generation]}</tspan></text>
            <title>{bee.label} · gen.{point.generation} · {bee.occurrences.length} occorrenze</title>
          </g>
        })}
      </svg>
      </section></>}
      </div>
      <div className="shared-table-scroll"><table className="shared-table"><caption>Più immagini possono rappresentare la stessa ape.</caption><thead><tr><th scope="col">Conteggio</th>{model.rows.map(row => <th scope="col" key={row.generation}>gen.{row.generation}</th>)}</tr></thead><tbody><tr><th scope="row">Posizioni genealogiche</th>{model.rows.map(row => <td key={row.generation}>{row.positions}</td>)}</tr><tr><th scope="row">Api distinte</th>{model.rows.map(row => <td key={row.generation} className={row.unique !== row.positions ? 'shared-different' : undefined}>{row.unique}</td>)}</tr></tbody></table></div>
    </section>
    
    <SharedInsights model={model} chosen={selected===null ? null : model.individuals.get(selected)} shared={shared} showGenetics={false} />
    <PageJourney page="shared" />
  </main>
}
