import test from 'node:test';
import assert from 'node:assert/strict';
import {colonyThirdLevel} from './colonyThirdLevel.js';
test('Third level preserves maternal-only haploids and distinguishes prevented births from elimination',()=>{
 for(const ids of [[],['diploid-1'],['diploid-2'],['diploid-1','diploid-2']]){
  const f=colonyThirdLevel(ids);
  assert.equal(f.born,12-2*ids.length);
  assert.equal(f.total,18-3*ids.length);
  const males=f.offspring.filter(n=>n.group==='haploid');
  assert.equal(males.length,4);assert.ok(males.every(n=>n.alive&&n.father===null));
  for(const n of f.offspring)assert.equal(n.born,!ids.includes(n.father));
  const eligible=f.offspring.filter(n=>n.group==='diploid'&&n.born).map(n=>n.id);
  for(let mask=0;mask<2**eligible.length;mask++){
   const removed=eligible.filter((_,i)=>mask&(1<<i));
   const next=colonyThirdLevel(ids,removed);
   assert.equal(next.born,f.born);assert.equal(next.alive,f.born-removed.length);
   assert.ok(next.offspring.filter(n=>n.group==='worker').every(n=>n.alive===n.born));
  }
 }
 assert.throws(()=>colonyThirdLevel([],['third-haploid-1']));
 assert.throws(()=>colonyThirdLevel(['diploid-1'],['third-diploid-1-diploid']));
});
