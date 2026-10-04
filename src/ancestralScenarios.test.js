import test from 'node:test';
import assert from 'node:assert/strict';
import {ancestralScenario,formulaAncestry,editableAncestors} from './ancestralScenarios.js';
import {fibonacciLevels} from './model.js';
test('All eight ploidy combinations obey the recurrence and keep editable nodes',()=>{
 for(let mask=0;mask<8;mask++){
  const active=editableAncestors.filter((_,i)=>mask&(1<<i)),t=formulaAncestry(active);
  assert.equal(t.nodes.filter(n=>n.diploid).length,active.length);
  assert.equal(t.nodes.filter(n=>n.editable).length,3);
  assert.equal(new Set(t.nodes.map(n=>n.id)).size,t.nodes.length);
  for(let g=1;g<6;g++)assert.equal(t.counts[g+1],t.counts[g]+t.counts[g-1]+t.diploidCounts[g]);
 }
 assert.deepEqual(formulaAncestry([]).counts,[1,1,2,3,5,8,13]);
 assert.deepEqual(formulaAncestry().counts,[1,1,2,4,7,12,19]);
});
test('Alternative scenarios obey local rules and the corrected recurrence',()=>{
 for(const filtered of [false,true])for(let depth=3;depth<=8;depth++){
  const t=ancestralScenario(filtered,depth);
  assert.equal(new Set(t.nodes.map(n=>n.id)).size,t.nodes.length);
  const parentIds=t.nodes.flatMap(n=>n.parents.map(p=>p.id));
  assert.equal(new Set(parentIds).size,parentIds.length);
  for(const n of t.nodes.filter(n=>n.g<depth)){
   assert.equal(n.parents.length,n.sex==='F'||n.diploid?2:1);
   assert.equal(n.parents[0].sex,'F');
   if(n.parents[1])assert.equal(n.parents[1].sex,'M');
  }
  for(let g=1;g<depth;g++)assert.equal(t.counts[g+1],t.counts[g]+t.counts[g-1]+t.diploidCounts[g]);
  if(filtered)assert.deepEqual(t.counts,fibonacciLevels(depth));
 }
 assert.deepEqual(ancestralScenario(false).counts,[1,1,2,4,6,10,16]);
 assert.deepEqual(ancestralScenario(true).counts,[1,1,2,3,5,8,13]);
 assert.equal(ancestralScenario(false).nodes.filter(n=>n.diploid).length,1);
 assert.ok(ancestralScenario(true).nodes.every(n=>!n.extra&&!n.diploid));
});
