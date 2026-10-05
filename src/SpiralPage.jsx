import React,{useState} from 'react';
import {Navigation,PageJourney,PageHeadingLabel} from './Navigation.jsx';
import {GenealogyBee,beeLabel} from './GenealogyBee.jsx';
import {buildSpiral} from './spiral.js';
import GoldenConvergence from './GoldenConvergence.jsx';
const colors=['#658779','#b88735','#87789d','#458d92','#b86b52','#6f893e','#a36885','#687fc2','#bd903f','#437c64'];
export default function SpiralPage(){
 const [depth,setDepth]=useState(7),[highlight,setHighlight]=useState(null),[parents,setParents]=useState(false);
 const spiral=buildSpiral(depth);
 function change(delta){setDepth(depth+delta);setHighlight(null);}
 return <main className="spiral-page"><header><Navigation page="spiral"/></header>
 <section className="colony-intro"><PageHeadingLabel page="spiral"/><h1>Gli antenati,<br/><em>lungo una spirale.</em></h1><p>Possiamo disporre 1, 1, 2, 3, 5, 8… individui su una spirale logaritmica? Sì: ogni quarto di giro ospita una generazione.</p></section>
 <aside className="reading-note" aria-label="Da tenere a mente"><strong>Da tenere a mente</strong><p>Qui manteniamo la genealogia standard e cambiamo soltanto la disposizione dei nodi. I numeri vengono dalle regole di parentela; la scelta della spirale è nostra.</p></aside>
 <section className="lab"><div className="lab-heading"><div><p className="eyebrow">UNA SPIRALE AUREA</p></div><div className="stepper" aria-label="Numero di generazioni"><button onClick={()=>change(-1)} disabled={depth===2} aria-label="Mostra una generazione in meno">−</button><span>Fino a <strong>gen.{depth}</strong></span><button onClick={()=>change(1)} disabled={depth===9} aria-label="Mostra una generazione in più">+</button></div></div>
 <div className="spiral-generations" aria-label="Evidenzia una generazione">{spiral.counts.map((n,g)=><button key={g} aria-pressed={highlight===g} onClick={()=>setHighlight(highlight===g?null:g)} style={{'--generation-color':colors[g]}}><span>gen.{g}</span><strong>{n}</strong><small>{n===1?'individuo':'individui'}</small></button>)}</div>
 <div className="spiral-options"><p>Clicca un conteggio per evidenziare la sua generazione. Verso gli antenati: dal centro all’esterno.</p><label className="prominent-check"><input type="checkbox" checked={parents} onChange={e=>setParents(e.target.checked)}/> Mostra i legami di parentela</label></div>
 <svg className="spiral-canvas" viewBox={spiral.viewBox} role="img" aria-label={`Spirale aurea con ${spiral.total} individui: ${spiral.counts.join(', ')} per generazione`}>
 {parents&&spiral.points.flatMap(n=>n.parents.map(id=>{const p=spiral.points.find(a=>a.id===id);return <line key={`${n.id}-${id}`} x1={n.x} y1={n.y} x2={p.x} y2={p.y} stroke="#8c977e" strokeWidth="1.8" vectorEffect="non-scaling-stroke" opacity=".45"/>;}))}
 {spiral.segments.map(s=><path key={s.g} d={s.path} fill="none" stroke={colors[s.g]} strokeWidth="4" vectorEffect="non-scaling-stroke" opacity={highlight===null||highlight===s.g?.8:.13}/>)}
 {spiral.points.map(n=><g key={n.id} opacity={highlight===null||highlight===n.generation?1:.15}><title>{beeLabel(n.type)} · gen.{n.generation} · individuo {n.id+1}</title><circle cx={n.x} cy={n.y} r="19" fill="#fffdf6" stroke={colors[n.generation]} strokeWidth="2"/><GenealogyBee type={n.type} x={n.x} y={n.y}/></g>)}
 </svg><div className="graph-footer"><span role="status">{highlight===null?`${spiral.total} individui in totale · ${depth+1} livelli`:`gen.${highlight}: ${spiral.counts[highlight]} individui`}</span><span>La curva indica la disposizione; i collegamenti opzionali indicano i genitori.</span></div></section>
 <GoldenConvergence generation={highlight??depth}/>
 <section className="scenario-explanation"><div><h2>Perché proprio questa spirale?</h2><p>Una spirale logaritmica ha equazione r(θ) = r₀ eᵇᶿ. Scegliamo b = 2 ln(φ) / π, con φ = (1 + √5) / 2 ≈ 1,618. Il raggio cresce quindi di un fattore φ ogni quarto di giro.</p><p className="scenario-formula">r(θ + π/2) = φ · r(θ)</p><p>Anche la lunghezza dei tratti successivi cresce di un fattore φ. Il rapporto fra numeri di Fibonacci consecutivi tende allo stesso valore: questo rende naturale confrontare le due crescite.</p></div><div><h2>Che cosa abbiamo scelto?</h2><p>Le regole genealogiche stabiliscono quanti individui appartengono a ogni generazione. Noi scegliamo di distribuire quei punti a intervalli angolari uguali nel relativo quarto di giro; non sono distanze uguali lungo la curva.</p><p>I numeri di Fibonacci non impongono una spirale e non determinano la posizione delle api. La spirale aurea è logaritmica; non è l’approssimazione costruita con archi di cerchio nei quadrati di Fibonacci.</p></div></section>
 <section className="reading-conclusion"><h2>Che cosa cambia rispetto all’albero?</h2><p>Restano gli stessi individui, gli stessi genitori e gli stessi conteggi. Cambiano soltanto le posizioni. I tratti colorati seguono la spirale; i collegamenti opzionali mostrano chi è genitore di chi.</p></section>
 <PageJourney page="spiral"/></main>;
}
