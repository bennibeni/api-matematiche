import test from 'node:test';
import assert from 'node:assert/strict';
import {descendants} from './descendants.js';
import {selectedBrood} from './survival.js';
test('Reduced population selection maps to the two descendant roots',()=>{
 const population=selectedBrood(['diploid-2'],2);
 assert.equal(population.total,6);
 assert.equal(population.alive,5);
 assert.deepEqual(population.larvae.filter(n=>!n.alive).map(n=>n.id),['diploid-2']);
 assert.throws(()=>selectedBrood(['diploid-3'],2));
});
test('Elimination removes only the selected father and his future lineage',()=>{
 assert.deepEqual(descendants().counts,[4,2,2,2,2]);
 const one=descendants(['diploid-1']);
 assert.deepEqual(one.counts,[3,1,1,1,1]);
 assert.deepEqual(one.nodes.filter(n=>!n.present).map(n=>n.id),['D1','F1','M1','F3','M3']);
 assert.deepEqual(descendants(['diploid-1','diploid-2']).counts,[2,0,0,0,0]);
 assert.deepEqual(descendants([]).counts,[4,2,2,2,2]);
 assert.equal(one.nodes.filter(n=>n.external&&n.present).length,2);
 for(const node of one.nodes.filter(n=>n.level>0&&!n.external)){
  assert.equal(one.edges.filter(([,to])=>to===node.id).length,node.sex==='F'?2:1);
 }
});
