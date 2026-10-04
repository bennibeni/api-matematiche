import React from 'react';
import {beeGroups} from './BeeIllustration.jsx';

export const beeAssets={haploid:'/assets/bees/drone-anatomy-medium.png',diploid:'/assets/bees/drone.png',worker:'/assets/bees/worker.png',queen:'/assets/bees/queen-large.png'};
const groupOrder=['haploid','diploid','worker'];
export function ColonyGraph({brood,interactive=false,onToggle}){
 const pos=n=>({x:100+groupOrder.indexOf(n.group)*200+((Number(n.id.split('-')[1])-1)%2===0?-37:37),y:225+Math.floor((Number(n.id.split('-')[1])-1)/2)*78});
 const bottom=brood.total===6?330:545;
 const parents={queen:{x:230,y:48},father:{x:370,y:48}};
 return <div className="colony-graph-scroll" tabIndex="0" role="region" aria-label={interactive?'Popolazione con eliminazioni selezionabili':'Popolazione senza eliminazioni'}><svg viewBox={`0 0 600 ${bottom}`} className="colony-svg" role="group" aria-label={`${brood.alive} discendenti presenti, ${brood.removed} eliminati`}>
 {brood.larvae.filter(n=>n.alive).flatMap(n=>n.parents.map(parent=>{const a=parents[parent],b=pos(n);return <path key={`${parent}-${n.id}`} d={`M${a.x} 100 C${a.x} 143,${b.x} 155,${b.x} ${b.y-26}`} fill="none" stroke={parent==='queen'?'#acb6a0':'#cfb487'} opacity=".43" strokeWidth="1.2"/>;}))}
 {Object.entries(parents).map(([id,p])=><g key={id}><rect x={p.x-48} y="2" width="96" height="106" rx="12" fill="#faf7ef" stroke="#e4dfcf"/><image href={beeAssets[id==='queen'?'queen':'haploid']} x={p.x-34} y="6" width="68" height="68"/><text x={p.x} y="86" textAnchor="middle" className="colony-parent-label">{id==='queen'?'Regina A/B':'Fuco A'}</text><text x={p.x} y="100" textAnchor="middle" className="colony-small-label">{id==='queen'?'madre':'padre'}</text></g>)}
 {groupOrder.map((group,i)=><g key={group}><rect x={i*200+8} y="172" width="184" height={bottom-185} rx="14" fill={beeGroups[group].background} fillOpacity=".65"/><text x={100+i*200} y="193" textAnchor="middle" className="colony-group-label">{group==='worker'?'Operaia':beeGroups[group].label}</text><text x={100+i*200} y={bottom-24} textAnchor="middle" className="colony-small-label">{brood.larvae.filter(n=>n.group===group&&n.alive).length} presenti</text></g>)}
 {brood.larvae.map(n=>{const p=pos(n),clickable=interactive&&n.group==='diploid',label=`${beeGroups[n.group].label} ${n.id.split('-')[1]}: ${n.alive?'presente':'eliminato'}`;return <g key={n.id} className={`colony-node ${clickable?'selectable':''}`} role={clickable?'button':'img'} tabIndex={clickable?0:undefined} aria-label={clickable?`${n.alive?'Elimina':'Ripristina'} maschio diploide ${n.id.split('-')[1]}`:label} aria-pressed={clickable?!n.alive:undefined} onClick={clickable?()=>onToggle(n.id):undefined} onKeyDown={clickable?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onToggle(n.id);}}:undefined}><title>{label}</title><circle cx={p.x} cy={p.y+8} r="32" fill={n.alive?'#fffdf9':'#f6f1eb'} stroke={n.alive?(clickable?'#c89e89':'#e2dece'):'#bc9b88'} strokeDasharray={n.alive?undefined:'4 4'}/>{n.alive?<image href={beeAssets[n.group]} x={p.x-29} y={p.y-22} width="58" height="58" pointerEvents="none"/>:<path d={`M${p.x-8} ${p.y}l16 16m0-16l-16 16`} stroke="#b0927e" strokeWidth="1.5"/>}<text x={p.x} y={p.y+51} textAnchor="middle" className="colony-small-label">{n.alive?`${n.group==='haploid'?'M':n.group==='diploid'?'D':'O'}${n.id.split('-')[1]}`:'eliminato'}</text></g>;})}
 </svg></div>;
}







