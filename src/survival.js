import {csdCross} from './csd.js';

// Balanced illustrative cohort, not a random sample or typical colony ratio.
export function broodExperiment(removeDiploidMales=false){
 const larvae=['haploid','diploid','worker'].flatMap(group=>Array.from({length:8},(_,i)=>({
   id:`${group}-${i+1}`,group,alive:!(removeDiploidMales&&group==='diploid'),
   ploidy:group==='haploid'?1:2,sex:group==='worker'?'F':'M',caste:group==='worker'?'worker':null,
   alleles:group==='haploid'?[i%2?'B':'A']:group==='diploid'?['A','A']:['B','A'],
   parents:group==='haploid'?['queen']:['queen','father'],
 })));
 return {larvae,total:larvae.length,alive:larvae.filter(n=>n.alive).length,removed:larvae.filter(n=>!n.alive).length};
}

export function selectedBrood(eliminatedIds=[],perGroup=8){
 if(!Number.isInteger(perGroup)||perGroup<1||perGroup>8)throw new TypeError('Numero di individui non valido.');
 const base=broodExperiment();
 base.larvae=base.larvae.filter(n=>Number(n.id.split('-')[1])<=perGroup);
 const eligible=new Set(base.larvae.filter(n=>n.group==='diploid').map(n=>n.id));
 if(!Array.isArray(eliminatedIds)||eliminatedIds.some(id=>!eligible.has(id)))throw new TypeError('Si possono eliminare solo i maschi diploidi della covata.');
 const removed=new Set(eliminatedIds);
 const larvae=base.larvae.map(n=>({...n,alive:!removed.has(n.id)}));
 return {larvae,total:larvae.length,alive:larvae.length-removed.size,removed:removed.size};
}

// A controlled selection experiment. All female outcomes survive;
// diploid male outcomes survive iff removal is disabled. No other mortality.
export function survivalExperiment(removeDiploidMales=false){
 const outcomes=csdCross().map(o=>({...o,parents:[...o.parents],alive:!(removeDiploidMales&&o.sex==='M'&&o.ploidy===2)}));
 const survivingProbability=outcomes.filter(o=>o.alive).reduce((sum,o)=>sum+o.probability,0);
 const survivingFemaleProbability=outcomes.filter(o=>o.alive&&o.sex==='F').reduce((sum,o)=>sum+o.probability,0);
 return {outcomes,survivingProbability,survivingFemaleProbability,femaleShareAmongSurvivors:survivingProbability?survivingFemaleProbability/survivingProbability:0};
}

