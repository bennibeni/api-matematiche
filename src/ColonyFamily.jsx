import React from 'react';
import {beeAssets} from './ColonyGraph.jsx';
const xs=[270,400,530,660,790,920];
export function ColonyFamily({family,onToggle,onToggleThird}){
 const positions=Object.fromEntries(family.brood.larvae.map((n,i)=>[n.id,xs[i]]));
 const card=(id,x,y,asset,label,sub)=> <g key={id}><rect x={x-40} y={y-36} width="80" height="94" rx="12" fill="#fffdf6" stroke="#dad9c9"/><image href={beeAssets[asset]} x={x-29} y={y-32} width="58" height="58"/><text x={x} y={y+40} textAnchor="middle">{label}</text><text x={x} y={y+53} textAnchor="middle" className="family-small">{sub}</text></g>;
 return <div className="family-scroll" tabIndex="0" role="region" aria-label="Tre livelli della famiglia, scorribili orizzontalmente"><svg className="family-svg" viewBox="0 0 1000 660" role="group" aria-label={`Terzo livello: ${family.alive} individui presenti, ${12-family.born} non nati`}>
 <text x="20" y="24" className="family-level">LIVELLO 1 · GENITORI</text>
 <path d="M340 137 V235 M230 243 V235 H960 V243" fill="none" stroke="#b28b40" strokeWidth="2.5"><title>La regina è madre di tutti e sei i figli del secondo livello.</title></path>
 {family.brood.larvae.filter(n=>n.parents.includes('father')).map(n=><path key={`father-${n.id}`} d={`M510 137 C510 185 ${positions[n.id]} 185 ${positions[n.id]} 249`} fill="none" stroke="#70958b" strokeWidth="2" opacity={n.alive?.5:.15}/>)}
 <path d="M70 343 V518 H991 V525 M70 518 H9 V525" fill="none" stroke="#b28b40" strokeWidth="2.5"><title>La regina esterna è madre di tutti gli individui del terzo livello.</title></path>
 {family.offspring.filter(n=>n.father).map(n=>{const i=family.offspring.indexOf(n),x=49+i*82;return <path key={n.id} d={`M${positions[n.father]} 343 C${positions[n.father]} 420 ${x} 420 ${x} 530`} fill="none" stroke="#628e85" strokeWidth="2.5" opacity={n.born?.65:.15} strokeDasharray={n.born?undefined:'5 5'}/>;})}
 {card('queen',340,79,'queen','Regina','madre')}{card('father',510,79,'haploid','Fuco','padre')}
 <text x="230" y="213" className="family-level">LIVELLO 2 · SEI FIGLI INIZIALI</text>
 {family.brood.larvae.map((n,i)=>{const short=`${n.group==='haploid'?'M':n.group==='diploid'?'D':'O'}${n.id.split('-')[1]}`;return n.group==='diploid'?<foreignObject key={n.id} x={xs[i]-40} y="249" width="80" height="98"><button className="family-toggle" aria-label={`${n.alive?'Elimina':'Ripristina'} maschio diploide ${n.id.split('-')[1]}`} aria-pressed={!n.alive} onClick={()=>onToggle(n.id)}>{n.alive?<img src={beeAssets.diploid} alt=""/>:<span className="family-cross">×</span>}<strong>{short}</strong><small>{n.alive?'M · 2n':'eliminato'}</small></button></foreignObject>:card(n.id,xs[i],285,n.group,short,n.group==='haploid'?'M · n':'operaia');})}
 {card('external',70,285,'queen','Regina esterna','madre condivisa')}
 <text x="100" y="490" className="family-level">LIVELLO 3 · FEMMINE, MASCHI DIPLOIDI E MASCHI APLOIDI</text>
 {family.offspring.map((n,i)=>{const x=49+i*82,label=n.group==='worker'?`O${i/2+3}`:n.group==='diploid'?`D${(i-1)/2+3}`:`M${i-5}`;return !n.born?<g key={n.id}><rect x={x-40} y="530" width="80" height="94" rx="12" fill="#f6f3eb" stroke="#c9c5b4" strokeDasharray="5 5"/><text x={x} y="578" textAnchor="middle">non {n.group==='worker'?'nata':'nato'}</text></g>:n.group==='diploid'?<foreignObject key={n.id} x={x-40} y="530" width="80" height="98"><button className="family-toggle" aria-label={`${n.alive?'Elimina':'Ripristina'} maschio diploide ${label} del livello 3`} aria-pressed={!n.alive} onClick={()=>onToggleThird(n.id)}>{n.alive?<img src={beeAssets.diploid} alt=""/>:<span className="family-cross">×</span>}<strong>{label}</strong><small>{n.alive?'M · 2n':'eliminato'}</small></button></foreignObject>:card(n.id,x,566,n.group,label,n.group==='worker'?'operaia':'solo madre');})}
 </svg></div>;
}
