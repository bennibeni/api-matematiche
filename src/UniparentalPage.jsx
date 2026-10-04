import React,{useMemo,useState} from 'react';
import {Navigation} from './Navigation.jsx';
import {singleEvent} from './uniparental.js';

function Ancestry({tree,standard,focalId,changed,label}) {
  const width=560, height=492;
  // Keep positions fixed across the two histories so the change is directly visible.
  const x=n=>92+(n.x-135)/(standard.width-170)*440;
  const y=n=>35+n.generation*70;
  const byId=new Map(tree.nodes.map(n=>[n.id,n]));
  return <div className="comparison-scroll" tabIndex="0" role="region" aria-label={label}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}: ${tree.counts.join(', ')} individui`}>
      {tree.levels.map((level,g)=><g key={g}><line x1="78" x2="547" y1={35+g*70} y2={35+g*70} stroke="#ece8dc" strokeDasharray="3 5"/><text x="10" y={33+g*70} className="generation">g{g}</text><text x="10" y={49+g*70} className="row-count">{level.length} {level.length===1?'ape':'api'}</text></g>)}
      {tree.nodes.flatMap(n=>n.parents.map(id=>{const p=byId.get(id);return <path key={`${n.id}-${id}`} d={`M${x(n)} ${y(n)+11} C${x(n)} ${y(n)+35},${x(p)} ${y(p)-35},${x(p)} ${y(p)-11}`} fill="none" stroke={n.id===focalId?'#b78c40':'#c6cdbd'} strokeWidth={n.id===focalId?2:1.3}/>;}))}
      {tree.nodes.map(n=><g key={n.id}><title>{n.type} · g{n.generation}{n.id===focalId?(changed?' · nascita uniparentale':' · nascita sessuata'):''}</title>{n.id===focalId&&<circle cx={x(n)} cy={y(n)} r="17" fill="none" stroke="#b78c40" strokeWidth="1.5" strokeDasharray={changed?undefined:'3 2'}/>}<circle cx={x(n)} cy={y(n)} r="10.5" fill={n.type==='F'?'#f7d888':'#dbe8e2'} stroke={n.type==='F'?'#c8a45d':'#91ab9e'}/><text x={x(n)} y={y(n)+3.5} textAnchor="middle" fontSize="9" fill="#4c5c48">{n.type}</text></g>)}
    </svg>
  </div>;
}

export default function UniparentalPage(){
  const [active,setActive]=useState(true);
  const experiment=useMemo(()=>singleEvent(6),[]);
  const {standard,alternative,focalId}=experiment;
  const current=active?alternative:standard;
  return <main className="uniparental-page">
    <header><a href="#/" className="brand">✳ API MATEMATICHE</a><Navigation page="uniparental"/></header>
    <section className="intro"><p className="eyebrow">ESPERIMENTO 02 / UN SOLO EVENTO</p><h1>Una femmina.<br/><em>Nessun padre.</em></h1><p>Che cosa cambia se la madre del fuco nasce da un uovo non fecondato?<br className="desktop"/> Un solo legame cambia. La storia di sua madre rimane intatta.</p></section>
    <section className="event-control" aria-labelledby="event-heading"><div><h2 id="event-heading">Cambiamo la nascita della F in g1</h2><p>Partiamo sempre da un maschio. La femmina cerchiata è sua madre: nell’esperimento nasce da una sola madre, senza padre.</p></div><label className="event-switch"><input type="checkbox" role="switch" checked={active} onChange={e=>setActive(e.target.checked)}/><span>Nascita uniparentale</span><strong>{active?'Attiva':'Disattivata'}</strong></label></section>
    <p className="history-note">Sono due storie alternative: il confronto non rappresenta una mutazione che cancella un padre già esistito. L’evento riguarda la nascita della F cerchiata, non tutte le sue discendenti.</p>
    <section className="comparison-grid" aria-label="Confronto delle genealogie"><article className="lab"><div className="comparison-heading"><p className="eyebrow">IL RIFERIMENTO</p><h2>Tutte le regole standard</h2><p>La F cerchiata ha una madre F e un padre M.</p></div><Ancestry tree={standard} standard={standard} focalId={focalId} changed={false} label="Genealogia standard"/></article><article className={`lab ${active?'event-active':''}`}><div className="comparison-heading"><p className="eyebrow">L’ESPERIMENTO</p><h2>{active?'Una nascita senza padre':'Stesse regole del riferimento'}</h2><p>{active?'La F cerchiata ha una madre F. Tutto il resto segue le regole standard.':'Attiva l’evento per cambiare la nascita della F cerchiata.'}</p></div><Ancestry tree={current} standard={standard} focalId={focalId} changed={active} label="Genealogia dell’esperimento"/></article></section>
    <p className="history-note">F = femmina, M = maschio. I nodi mantengono la stessa posizione nei due disegni. Ogni nodo è un individuo distinto; tutti i nodi fino a g6 sono visibili scorrendo lateralmente. g6 è il limite della vista.</p>
    <section className="event-results lab" aria-labelledby="counts-heading"><div className="comparison-heading"><p className="eyebrow">CONTARE GLI INDIVIDUI</p><h2 id="counts-heading">La crescita rallenta. Non si ferma.</h2></div><div className="event-table-scroll"><table className="event-table"><caption>Individui distinti in ciascuna generazione</caption><thead><tr><th scope="col">Genealogia</th>{standard.counts.map((_,g)=><th key={g} scope="col">g{g}</th>)}</tr></thead><tbody><tr><th scope="row">Standard</th>{standard.counts.map((n,g)=><td key={g}>{n}</td>)}</tr><tr className="experiment-row"><th scope="row">Esperimento</th>{current.counts.map((n,g)=><td key={g}>{n}</td>)}</tr><tr><th scope="row">Differenza</th>{standard.counts.map((n,g)=><td key={g}>{n-current.counts[g]}</td>)}</tr></tbody></table></div><p className="event-feedback" role="status">{active?'I primi due livelli restano 1, 1. In g2 manca il padre della F: da lì i totali diventano 1, 2, 3, 5, 8… La madre della F continua ad avere due genitori.':'L’evento è disattivato: i due alberi coincidono e seguono entrambi 1, 1, 2, 3, 5, 8, 13.'}</p></section>
    <section className="event-lessons"><article><p className="eyebrow">COSA CAMBIA NEL GRAFO</p><h2>Un ramo in meno,<br/>non una linea sola.</h2><p>Nella storia alternativa non compare il padre della F in g1, né il suo ramo ancestrale. Il ramo materno conserva tutte le sue biforcazioni.</p><p>La differenza fra i conteggi, da g2 in poi, è <strong>1, 1, 2, 3, 5…</strong>: proprio la genealogia standard del maschio che avrebbe occupato quella posizione.</p><p>Per ottenere sempre un solo individuo a ogni livello, dovremmo imporre una nascita uniparentale a <strong>ogni</strong> passaggio della linea ancestrale.</p></article><article><p className="eyebrow">IL LEGAME CON LA BIOLOGIA</p><h2>La telitochia,<br/>senza confonderla con un clone.</h2><p>La nascita di una femmina da un uovo non fecondato si chiama <strong>partenogenesi telitoca</strong>. Nell’ape del Capo può avvenire attraverso la fusione di prodotti della meiosi materna, ripristinando la diploidia.</p><p>Un solo genitore non significa necessariamente un patrimonio genetico identico al suo. In questa pagina rappresentiamo soltanto il <strong>numero di genitori</strong>: non simuliamo cromosomi, ricombinazione o ereditarietà della telitochia.</p><p className="source-note">Approfondimento: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2535687/" target="_blank" rel="noreferrer">studio sulla telitochia e la ricombinazione nell’ape del Capo</a>.</p></article></section>
    <footer><a href="#/">← Torna a Fibonacci</a><p>Un evento locale, antenati distinti, nessuna casualità. Il modello standard resta il riferimento.</p></footer>
  </main>;
}
