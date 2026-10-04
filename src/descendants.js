// Counterfactual mathematical reproduction, not diploid-male genetics.
export function descendants(eliminated=[]){
 const nodes=[],edges=[];
 for(let i=1;i<=2;i++){
  const absent=eliminated.includes(`diploid-${i}`),x=i===1?160:440;
  nodes.push({id:`Q${i}`,sex:'F',level:0,x:x-54,y:55,present:true},{id:`D${i}`,sex:'M',level:0,x:x+54,y:55,present:!absent},{id:`F${i}`,sex:'F',level:1,x,y:195,present:!absent},{id:`M${i}`,sex:'M',level:2,x,y:335,present:!absent});
  edges.push([`Q${i}`,`F${i}`],[`D${i}`,`F${i}`],[`F${i}`,`M${i}`]);
 }
 return {nodes,edges,counts:[0,1,2].map(level=>nodes.filter(n=>n.level===level&&n.present).length)};
}
