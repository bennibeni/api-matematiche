import React from 'react';
export const beeGroups={
 haploid:{label:'Maschio aploide',short:'M · n',color:'#5c8c85',background:'#e2efeb'},
 diploid:{label:'Maschio diploide',short:'M · 2n',color:'#b57868',background:'#f2e5df'},
 worker:{label:'Ape operaia',short:'F · 2n',color:'#bb933d',background:'#f6edd4'},
 queen:{label:'Ape regina',short:'F · 2n',color:'#8a789e',background:'#ece6f1'},
};
// Diagrammatic illustrations: ploidy is conveyed by labels, not anatomy.
export function BeeIllustration({group,larva=false}){
 const {label,color,background}=beeGroups[group];
 const male=group==='haploid'||group==='diploid',queen=group==='queen';
 return <svg className={larva?'larva-illustration':'bee-illustration'} viewBox="0 0 100 100" role="img" aria-label={larva?`Larva del gruppo ${label}`:label}>
 <circle cx="50" cy="50" r="46" fill={background}/>
 {larva?<><path d="M62 25 C35 16 20 44 29 66 C36 85 70 80 73 59 C75 47 62 43 53 48" fill="none" stroke={color} strokeWidth="19" strokeLinecap="round"/><path d="M42 25l1 14M29 37l13 7M27 56l15-2M36 72l7-12M55 76l-1-13M69 66l-12-6" stroke={background} strokeWidth="2.5"/><circle cx="66" cy="57" r="2" fill="#4b5246"/></>:<>
 {queen&&<path d="M39 15l-3-10 10 5 5-8 5 8 9-5-3 10Z" fill={color}/>}
 <path d="M39 45L22 36M39 56L19 59M41 67L28 81M61 45L78 36M61 56L81 59M59 67L72 81" stroke="#56634d" strokeWidth="2.3" strokeLinecap="round"/>
 <ellipse cx="50" cy={queen?62:59} rx={male?18:queen?12:14} ry={queen?29:male?23:22} fill={color}/>
 <path d={queen?'M39 55h22M38 64h24M41 73h18':'M34 55h32M34 65h32'} stroke={background} strokeWidth="5"/>
 <ellipse cx="32" cy="40" rx="12" ry="22" transform="rotate(-35 32 40)" fill="#fffdf8" fillOpacity=".88" stroke="#c6cdbb"/>
 <ellipse cx="68" cy="40" rx="12" ry="22" transform="rotate(35 68 40)" fill="#fffdf8" fillOpacity=".88" stroke="#c6cdbb"/>
 <ellipse cx="50" cy="40" rx="12" ry="13" fill="#637052"/><circle cx="50" cy="25" r={male?12:9} fill="#465340"/>
 <ellipse cx="44" cy="23" rx={male?4:2} ry="5" fill="#a7b29a"/><ellipse cx="56" cy="23" rx={male?4:2} ry="5" fill="#a7b29a"/>
 <path d="M46 17l-6-7M54 17l6-7" stroke="#465340" strokeWidth="2" strokeLinecap="round"/>
 {group==='worker'&&<><ellipse cx="27" cy="76" rx="5" ry="7" fill="#d9ab41"/><ellipse cx="73" cy="76" rx="5" ry="7" fill="#d9ab41"/></>}
 </>}
 </svg>;
}
