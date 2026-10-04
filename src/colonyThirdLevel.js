import {selectedBrood} from './survival.js';
export function colonyThirdLevel(eliminated=[],removedThird=[]){
 const brood=selectedBrood(eliminated,2);
 const offspring=brood.larvae.filter(n=>n.sex==='M').flatMap(father=>['worker','diploid'].map((group)=>({id:`third-${father.id}-${group}`,group,father:father.id,mother:'external-queen',born:father.alive})));
 offspring.push(...Array.from({length:4},(_,i)=>({id:`third-haploid-${i+1}`,group:'haploid',father:null,mother:'external-queen',born:true})));
 const eligible=new Set(offspring.filter(n=>n.born&&n.group==='diploid').map(n=>n.id));
 if(removedThird.some(id=>!eligible.has(id)))throw new Error('Si possono eliminare soltanto maschi diploidi nati.');
 const removed=new Set(removedThird);
 for(const n of offspring)n.alive=n.born&&!removed.has(n.id);
 const born=offspring.filter(n=>n.born).length,alive=offspring.filter(n=>n.alive).length;
 return {brood,offspring,born,alive,removedThird:removed.size,total:brood.alive+alive};
}
