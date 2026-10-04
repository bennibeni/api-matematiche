import test from 'node:test';
import assert from 'node:assert/strict';
import {csdCross,csdSex} from './csd.js';
test('haploid, homozygous and heterozygous csd states',()=>{
  assert.equal(csdSex(['A']),'M');assert.equal(csdSex(['A','A']),'M');assert.equal(csdSex(['A','B']),'F');
  assert.equal(csdSex(['B','A']),csdSex(['A','B']));
});
test('shared paternal allele gives half diploid males, retaining two parents',()=>{
  const outcomes=csdCross();
  assert.deepEqual(outcomes.map(o=>o.sex),['M','F']);
  assert.equal(outcomes.filter(o=>o.sex==='M').reduce((s,o)=>s+o.probability,0),.5);
  assert.ok(outcomes.every(o=>o.ploidy===2&&o.parents.length===2));
});
test('distinct paternal allele gives only females and total probability one',()=>{
  const outcomes=csdCross(['A','B'],'C');assert.ok(outcomes.every(o=>o.sex==='F'));
  assert.equal(outcomes.reduce((s,o)=>s+o.probability,0),1);
  assert.deepEqual(outcomes.map(o=>o.alleles),[['A','C'],['B','C']]);
});
test('invalid maternal states cannot enter the crossing model',()=>{
  for(const mother of [[],['A'],['A','A'],['A','B','C']])assert.throws(()=>csdCross(mother));
});
