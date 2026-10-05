export const journey=[
 ['fibonacci','#/','Regole genealogiche'],
 ['uniparental','#/una-femmina-senza-padre','Eccezione uniparentale'],
 ['polyandry','#/poliandria','Genitori condivisi'],
 ['csd','#/alleli-e-sesso','Determinazione del sesso'],
 ['survival','#/genealogia-e-sopravvivenza','Larve e risorse'],
 ['scenarios','#/scenari-genealogici','Genealogia e diploidia'],
 ['spiral','#/spirale-aurea','Rappresentazione geometrica'],
];

export function pageLabel(id){return journey.find(page=>page[0]===id)?.[2] ?? 'Regole genealogiche';}
