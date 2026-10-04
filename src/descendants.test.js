import test from 'node:test';
import assert from 'node:assert/strict';
import {descendants} from './descendants.js';
test('Elimination removes only the selected father and his future lineage',()=>{
 assert.deepEqual(descendants().counts,[4,2,2]);
 const one=descendants(['diploid-1']);
 assert.deepEqual(one.counts,[3,1,1]);
 assert.deepEqual(one.nodes.filter(n=>!n.present).map(n=>n.id),['D1','F1','M1']);
 assert.deepEqual(descendants(['diploid-1','diploid-2']).counts,[2,0,0]);
 assert.deepEqual(descendants([]).counts,[4,2,2]);
});
