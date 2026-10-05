import React from 'react';
import {PHI} from './spiral.js';
import {ancestralRatios} from './ancestralRatios.js';

const rows=ancestralRatios(16);
const format=(n,digits=6)=>n.toLocaleString('it-IT',{maximumFractionDigits:digits});
const x=g=>55+(g-2)*43;
const y=ratio=>205-(ratio-1)*150;

export default function GoldenConvergence({generation}){
 const current=rows[generation];
 return <section className="golden-convergence" aria-labelledby="convergence-title">
  <h2 id="convergence-title">Quanto siamo vicini alla sezione aurea?</h2>
  <p>Il rapporto <strong>femmine / maschi</strong> tende a φ ≈ 1,618034. Seleziona una generazione sopra la spirale; senza una selezione, consideriamo l’ultima visibile.</p>
  <div className="convergence-values" role="status">
   <div><strong>gen.{generation}</strong><span>{current.females} femmine · {current.males} maschi</span></div>
   <div><strong>{current.ratio===null?'Non definito':format(current.ratio)}</strong><span>{current.males===0?'Nessun maschio: non si può dividere per zero.':`${current.females} / ${current.males} · femmine / maschi`}</span></div>
   <div><strong>{current.errorPercent===null?'—':`${format(current.errorPercent)}%`}</strong><span>errore relativo rispetto a φ</span></div>
  </div>
  <div className="convergence-scroll" tabIndex="0" role="region" aria-label="Grafico della convergenza, scorribile orizzontalmente">
   <svg viewBox="0 0 740 255" role="img" aria-label="Da gen.2 a gen.16 il rapporto femmine su maschi oscilla sopra e sotto la sezione aurea, avvicinandosi progressivamente. I valori esatti sono nella tabella seguente.">
    {[1,1.5,2].map(value=><g key={value}><line x1="50" x2="665" y1={y(value)} y2={y(value)} stroke="#d7ddc5"/><text x="40" y={y(value)+4} textAnchor="end">{format(value)}</text></g>)}
    <line x1="50" x2="665" y1={y(PHI)} y2={y(PHI)} stroke="#977027" strokeDasharray="6 4" strokeWidth="2"/>
    <text x="674" y={y(PHI)+4}>φ</text>
    <polyline points={rows.slice(2).map(r=>`${x(r.generation)},${y(r.ratio)}`).join(' ')} fill="none" stroke="#4d7866" strokeWidth="2.5"/>
    {rows.slice(2).map(r=><g key={r.generation}><circle cx={x(r.generation)} cy={y(r.ratio)} r={generation===r.generation?7:4} fill={generation===r.generation?'#a87528':'#4d7866'}><title>{`gen.${r.generation}: ${format(r.ratio)} · errore ${format(r.errorPercent)}%`}</title></circle><text x={x(r.generation)} y="231" textAnchor="middle">{r.generation}</text></g>)}
    <text x="55" y="251">Generazione (gen.)</text>
   </svg>
  </div>
  <p className="convergence-caption">Il grafico parte da gen.2: in gen.0 il rapporto è 0, in gen.1 non è definito. Proseguiamo i soli conteggi fino a gen.16, oltre i livelli disegnati nella spirale.</p>
  <details><summary>Valori esatti e precisione per generazione</summary><div className="convergence-scroll"><table><thead><tr><th>Generazione</th><th>Femmine / maschi</th><th>Rapporto</th><th>Errore relativo</th></tr></thead><tbody>{rows.slice(2).map(r=><tr key={r.generation}><th scope="row">gen.{r.generation}</th><td>{r.females} / {r.males}</td><td>{format(r.ratio,9)}</td><td>{format(r.errorPercent,7)}%</td></tr>)}</tbody></table></div></details>
  <p><strong>Da gen.11 l’errore è inferiore allo 0,01%:</strong> 89 femmine / 55 maschi ≈ 1,618182. Un rapporto tra interi non raggiunge mai esattamente φ, che è irrazionale.</p>
  <p>Ogni individuo aggiunge una madre; ogni femmina aggiunge anche un padre. Per g ≥ 2, il rapporto segue <strong>R(g + 1) = 1 + 1 / R(g)</strong>. Questa convergenza deriva dalle regole genealogiche, indipendentemente dalla disposizione sulla spirale. Il rapporto inverso, maschi / femmine, tende a 1 / φ ≈ 0,618034.</p>
 </section>;
}
