const colony=[],records=new Map();
function record(id,sex,diploid=false,parents=[]){const n={id,sex,diploid,parents};records.set(id,n);return n;}
for(let i=1;i<=4;i++){
 const father=i<4?`D${i}`:'H4';
 record(`Q${i}`,'F');record(father,'M',i<4);record(`F${i}`,'F',false,[`Q${i}`,father]);record(`S${i}`,'M',false,[`F${i}`]);
 colony.push({id:`Q${i}`,generation:0,x:130+(i-1)*235-46},{id:father,generation:0,x:130+(i-1)*235+46},{id:`F${i}`,generation:1,x:130+(i-1)*235},{id:`S${i}`,generation:2,x:130+(i-1)*235});
}
function extend(id,remaining){if(!remaining)return;const n=records.get(id);if(!n.parents.length){n.parents.push(record(`${id}-m`,'F').id);if(n.sex==='F'||n.diploid)n.parents.push(record(`${id}-p`,'M').id);}for(const p of n.parents)extend(p,remaining-1);}
for(let i=1;i<=4;i++)extend(`S${i}`,6);
export function colonyExperiment(eliminated=[]){
 if(eliminated.some(id=>!['D1','D2','D3'].includes(id)))throw new TypeError('Solo D1, D2 e D3 possono essere eliminati.');
 const removed=new Set(eliminated),status=new Map();
 for(const item of colony){const n=records.get(item.id);status.set(n.id,removed.has(n.id)?'eliminated':n.parents.some(p=>status.has(p)&&status.get(p)!=='present')?'unborn':'present');}
 const nodes=colony.map(n=>({...records.get(n.id),...n,status:status.get(n.id)}));
 return {nodes,survivors:nodes.filter(n=>n.generation===2&&n.status==='present'),present:nodes.filter(n=>n.status==='present').length,eliminated:removed.size,unborn:nodes.filter(n=>n.status==='unborn').length};
}
export function survivorAncestry(id,eliminated=[]){
 if(!colonyExperiment(eliminated).survivors.some(n=>n.id===id))throw new TypeError('Seleziona un discendente sopravvissuto.');
 const nodes=[],levels=Array.from({length:7},()=>[]);
 function visit(key,g){const source=records.get(key),node={...source,g,x:0,parents:[]};nodes.push(node);levels[g].push(node);if(g<6)node.parents=source.parents.map(p=>visit(p,g+1));return node;}
 visit(id,0);const width=Math.max(780,levels[6].length*44+140);
 levels[6].forEach((n,i)=>n.x=120+(i+.5)*(width-150)/levels[6].length);
 for(let g=5;g>=0;g--)for(const n of levels[g])n.x=n.parents.reduce((s,p)=>s+p.x,0)/n.parents.length;
 return {nodes,levels,width,height:659,counts:levels.map(l=>l.length),diploidCounts:levels.map(l=>l.filter(n=>n.diploid).length)};
}
