import test from 'node:test';
import assert from 'node:assert/strict';
import {survivalExperiment,broodExperiment,selectedBrood} from './survival.js';
test('selection changes survival, never identity, sex, genotype or parents',()=>{
 const before=survivalExperiment(),after=survivalExperiment(true);
 for(let i=0;i<before.outcomes.length;i++){
  const {alive:b,...original}=before.outcomes[i];const {alive:a,...selected}=after.outcomes[i];
  assert.deepEqual(original,selected);assert.equal(b,true);
  assert.equal(a,selected.sex==='F');assert.equal(selected.parents.length,2);
 }
});
test('absolute female survival is unchanged while conditional female fraction doubles',()=>{
 const before=survivalExperiment(),after=survivalExperiment(true);
 assert.equal(before.survivingProbability,1);assert.equal(after.survivingProbability,.5);
 assert.equal(before.survivingFemaleProbability,.5);assert.equal(after.survivingFemaleProbability,.5);
 assert.equal(before.femaleShareAmongSurvivors,.5);assert.equal(after.femaleShareAmongSurvivors,1);
});
test('brood starts with 24 distinct larvae and loses only 8 diploid males',()=>{
 const before=broodExperiment(),after=broodExperiment(true);
 assert.equal(before.total,24);assert.equal(before.alive,24);assert.equal(before.removed,0);
 assert.equal(new Set(before.larvae.map(n=>n.id)).size,24);
 assert.equal(after.alive,16);assert.equal(after.removed,8);
 for(const group of ['haploid','diploid','worker'])assert.equal(before.larvae.filter(n=>n.group===group).length,8);
 for(let i=0;i<24;i++){
  const {alive,...rest}=after.larvae[i];const {alive:previous,...original}=before.larvae[i];
  assert.deepEqual(rest,original);assert.equal(previous,true);assert.equal(alive,rest.group!=='diploid');
  assert.equal(rest.parents.length,rest.group==='haploid'?1:2);
 }
 assert.equal(after.larvae.filter(n=>n.group==='worker'&&n.alive).length,8);
 assert.deepEqual(broodExperiment(),before);
});
test('individual eliminations remove exactly the selected diploid males',()=>{
 for(let count=0;count<=8;count++){
  const ids=Array.from({length:count},(_,i)=>`diploid-${i+1}`),b=selectedBrood(ids);
  assert.equal(b.alive,24-count);assert.equal(b.removed,count);
  assert.deepEqual(b.larvae.filter(n=>!n.alive).map(n=>n.id),ids);
  assert.ok(b.larvae.filter(n=>n.group!=='diploid').every(n=>n.alive));
 }
 assert.equal(selectedBrood(['diploid-1','diploid-1']).removed,1);
 assert.throws(()=>selectedBrood(['worker-1']));assert.throws(()=>selectedBrood(['unknown']));
});
