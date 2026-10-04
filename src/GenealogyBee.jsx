import React from 'react';
export const beeLabel=(type,diploid=false)=>type==='F'?'F':diploid?'M·2n':'M·n';
// The paired circles are a didactic marker, not a complete anatomical drawing.
export function GenealogyBee({type,diploid=false,x=0,y=0}){
 return <g transform={`translate(${x} ${y})`}><circle r="16" fill={type==='F'?'#f7d888':'#dbe8e2'} stroke={type==='F'?'#bd8b31':'#658779'}/><ellipse cx="-4" cy="-4" rx="4" ry="6" fill="#fffdf6" transform="rotate(-28)"/><ellipse cx="4" cy="-4" rx="4" ry="6" fill="#fffdf6" transform="rotate(28)"/><ellipse cy="3" rx="5" ry="8" fill={type==='F'?'#956a22':'#456e5d'}/><path d="M-4 1H4M-4 5H4" stroke="#fff6d9" strokeWidth="1.5"/>{type==='M'&&!diploid&&<g fill="#f8ddb0" stroke="#274c3c" strokeWidth=".5"><circle cx="-2" cy="4" r="1.65"/><circle cx="2" cy="4" r="1.65"/></g>}</g>;
}
