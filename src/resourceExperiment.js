export const resourceScenarios=[
 {id:'all',label:'Allevare tutti',description:'Due aploidi e due diploidi.'},
 {id:'save',label:'Eliminare e conservare',description:'Due aploidi; il cibo risparmiato resta disponibile.'},
 {id:'reinvest',label:'Eliminare e riallocare',description:'Il risparmio permette di allevare altri due aploidi.'},
];
export function resourceExperiment(scenario='all'){
 if(!resourceScenarios.some(s=>s.id===scenario))throw new Error('Scenario non valido');
 const males=['M1','M2','D1','D2','M3','M4'].map((id,i)=>{
  const group=id.startsWith('D')?'diploid':'haploid';
  const state=i<2?'reared':i<4?(scenario==='all'?'reared':'removed'):(scenario==='reinvest'?'reared':'reserve');
  return {id,group,state,x:240+i*135,capacity:group==='haploid'?4:1};
 });
 const adults=males.filter(n=>n.state==='reared');
 const spent=adults.length*10,output=adults.reduce((s,n)=>s+n.capacity,0);
 return {males,budget:40,spent,remaining:40-spent,adults:adults.length,output,efficiency:output/spent};
}
