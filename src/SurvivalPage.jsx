import React,{useState} from 'react';
import {Navigation} from './Navigation.jsx';

import {beeGroups} from './BeeIllustration.jsx';
import {ColonyGraph,beeAssets} from './ColonyGraph.jsx';
import {selectedBrood} from './survival.js';



export default function SurvivalPage(){
 const [eliminated,setEliminated]=useState([]);
 const current=selectedBrood(eliminated,2);
 const toggle=id=>setEliminated(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);
 return <main className="survival-page colony-page"><header><a href="#/" className="brand">✳ API MATEMATICHE</a><Navigation page="survival"/></header>
 <section className="colony-intro"><div><p className="eyebrow">ESPERIMENTO 04 / LA COLONIA</p><h1>La popolazione della <em>colonia.</em></h1><p>Le immagini rappresentano api adulte. Seleziona quali maschi diploidi non raggiungono questo stadio.</p></div></section>
 <section className="species-strip" aria-label="Quattro gruppi di api">{Object.entries(beeGroups).map(([group,info])=><article key={group} data-bee={group}><img src={beeAssets[group]} alt={info.label} width="112" height="112"/><div><span className="species-code" style={{color:info.color}}>{info.short}</span><h2>{info.label}</h2></div></article>)}</section>
 <div className="population-workspace"><section className="colony-lab colony-single" aria-labelledby="comparison-heading"><div className="colony-toolbar"><div><h2 id="comparison-heading">Seleziona i maschi diploidi da eliminare</h2><p>Clicca un’ape diploide per sostituirla con una croce; clicca di nuovo per ripristinarla.</p></div></div>
 <article className="lab colony-edited"><div className="colony-panel-heading"><h3>Popolazione presente</h3><span><strong>{current.alive}</strong> discendenti</span></div><ColonyGraph brood={current} interactive onToggle={toggle}/></article> <div className="colony-summary" role="status"><span><strong>{current.removed}</strong> {current.removed===1?'eliminato':'eliminati'}</span><span><strong>2</strong> maschi aploidi</span><span><strong>{2-current.removed}</strong> {2-current.removed===1?'maschio diploide':'maschi diploidi'}</span><span><strong>2</strong> operaie</span></div>
 <p className="colony-caption">Nel maschio aploide, la piccola sezione mostra i testicoli interni con proporzioni indicative. Sono raffigurati adulti, non larve. La croce indica un individuo eliminato prima di diventare adulto. Le sagome tratteggiate permettono di ripristinare gli individui esclusi dalla popolazione presente.</p></section>
 </div><details className="colony-assumptions"><summary>Composizione e regole del modello</summary><p>Regina A/B e padre aploide A. Mostriamo 6 discendenti: 2 maschi aploidi da uova non fecondate, 2 maschi diploidi A/A e 2 operaie A/B da uova fecondate. Le proporzioni sono fissate per questo esperimento, non descrivono una colonia tipica. Regina e padre non rientrano nel conteggio dei discendenti; il padre è rappresentato come partner riproduttivo, non come membro residente.</p><p>Le linee collegano i genitori ai figli: i maschi aploidi hanno solo la madre; gli altri individui hanno entrambi i genitori. Operaia e regina sono caste femminili, normalmente diploidi. Le femmine rappresentate in questa popolazione sono operaie.</p><p>La sezione anatomica è mostrata solo nel maschio aploide per scelta illustrativa: la sua assenza nel disegno del maschio diploide non indica assenza di testicoli. Le eliminazioni non modificano le parentele della popolazione iniziale.</p><p className="source-note">Fonti: <a href="https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1000222" target="_blank" rel="noreferrer">determinazione del sesso</a>; <a href="https://canr.udel.edu/maarec/honey-bee-biology/the-colony-and-its-organization/" target="_blank" rel="noreferrer">caste e organizzazione della colonia</a>.</p></details>
 <footer><a href="#/alleli-e-sesso">← Alleli e sesso</a><p>Una popolazione ridotta · sei individui iniziali.</p></footer></main>;
}









