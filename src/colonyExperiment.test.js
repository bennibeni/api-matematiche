import test from 'node:test';
import assert from 'node:assert/strict';
import {colonyExperiment,survivorAncestry} from './colonyExperiment.js';
test('Elimination blocks births without rewriting surviving genealogies',()=>{
 const before=survivorAncestry('S4');
 for(let mask=0;mask<8;mask++){
  const removed=['D1','D2','D3'].filter((_,i)=>mask&(1<<i)),p=colonyExperiment(removed);
  assert.equal(p.present,16-3*removed.length);assert.equal(p.unborn,2*removed.length);assert.equal(p.survivors.length,4-removed.length);
  assert.deepEqual(survivorAncestry('S4',removed),before);
  for(let i=1;i<=3;i++)if(removed.includes(`D${i}`))assert.throws(()=>survivorAncestry(`S${i}`,removed));
  for(const s of p.survivors){const t=survivorAncestry(s.id,removed);assert.equal(new Set(t.nodes.map(n=>n.id)).size,t.nodes.length);for(let g=1;g<6;g++)assert.equal(t.counts[g+1],t.counts[g]+t.counts[g-1]+t.diploidCounts[g]);}
 }
 assert.deepEqual(before.counts,[1,1,2,3,5,8,13]);assert.deepEqual(survivorAncestry('S1').counts,[1,1,2,4,6,10,16]);
 assert.equal(colonyExperiment().nodes.filter(n=>n.diploid).length,3);
});
