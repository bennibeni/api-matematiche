export const editableAncestors=['mp','mmp','mmmp'];
export function formulaAncestry(active=editableAncestors,depth=6){
 if(!Number.isInteger(depth)||depth<3||depth>8)throw new RangeError('Profondità da 3 a 8.');
 if(active.some(path=>!editableAncestors.includes(path)))throw new TypeError('Nodo non modificabile.');
 const nodes=[],levels=Array.from({length:depth+1},()=>[]);
 function add(sex,g,path){
  const diploid=active.includes(path);
  const node={id:path||'root',sex,diploid,g,path,parents:[],x:0,editable:editableAncestors.includes(path),extra:active.some(p=>path.startsWith(p+'p'))};
  nodes.push(node);levels[g].push(node);
  if(g<depth){node.parents.push(add('F',g+1,path+'m'));if(sex==='F'||diploid)node.parents.push(add('M',g+1,path+'p'));}
  return node;
 }
 add('M',0,'');
 const width=Math.max(780,levels[depth].length*44+140);
 levels[depth].forEach((n,i)=>n.x=120+(i+.5)*(width-150)/levels[depth].length);
 for(let g=depth-1;g>=0;g--)for(const n of levels[g])n.x=n.parents.reduce((sum,p)=>sum+p.x,0)/n.parents.length;
 return {nodes,levels,counts:levels.map(l=>l.length),diploidCounts:levels.map(l=>l.filter(n=>n.diploid).length),width,height:depth*94+95};
}
