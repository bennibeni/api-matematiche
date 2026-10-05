import React, { useId, useRef } from 'react'

const number = value => value.toLocaleString('it-IT', { maximumFractionDigits: 4 })

export default function SharedInsights({ model, chosen, shared, showGenetics = false }) {
  const ratioDialog = useRef(null)
  const ratioTitle = useId()
  const bee = chosen
  const weights = bee ? bee.occurrences.map(id => model.contributions.get(id)) : []
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const ratios = model.rows.map(row => {
    const positions = model.points.filter(point => point.generation === row.generation)
    const unique = [...model.individuals.values()].filter(point => point.generation === row.generation)
    const count = nodes => ({ females: nodes.filter(n => n.type === 'F').length, males: nodes.filter(n => n.type === 'M').length })
    return { generation: row.generation, positions: count(positions), unique: count(unique) }
  })
  const ratioText = counts => counts.males ? `${counts.females} / ${counts.males} = ${number(counts.females / counts.males)}` : 'Non definito (nessun maschio)'

  return <>
    {showGenetics && bee && <section className="shared-insight" aria-labelledby="shared-genetics-title">
      <h2 id="shared-genetics-title">Quanto può contribuire l’ape selezionata al patrimonio genetico del maschio iniziale?</h2>
      <p>Calcoliamo il <strong>contributo atteso al DNA nucleare del maschio iniziale</strong>, non la percentuale del suo DNA che lei trasmette.</p>
      <div className="shared-genetic-result" role="status"><strong>{bee.label} · gen.{bee.generation}</strong><p>{weights.map(weight => `${number(weight * 100)}%`).join(' + ')}{weights.length > 1 ? ` = ${number(total * 100)}%` : ''}</p><span>{weights.length === 1 ? 'Un percorso genealogico.' : `${weights.length} percorsi, i cui contributi si sommano.`}</span></div>
      <p>Risaliamo i legami partendo dal 100% del maschio iniziale. Un maschio aploide riceve tutto il proprio DNA nucleare dalla madre; per una femmina il contributo si divide a metà fra madre e padre. A ogni passaggio moltiplichiamo queste quote.</p>
      <p>{shared ? 'L’antenata condivisa di gen.3 contribuisce per il 25% lungo il ramo della figlia e per il 50% lungo quello del figlio: in totale il 75% atteso. Due percorsi non significano due quote uguali, né due terzi del DNA.' : 'Senza condivisione, le due antenate di gen.3 sono diverse: una contribuisce per il 25%, l’altra per il 50%. Attivando la casella, questi contributi fanno capo alla stessa ape.'}</p>
      <details><summary>Come interpretare queste percentuali</summary><p>Sono medie teoriche sotto trasmissione mendeliana, senza selezione o distorsioni della segregazione. Per un segmento concreto conta quale copia viene ereditata; la ricombinazione modifica la distribuzione dei segmenti. Non stiamo ancora generando cromosomi, misurando DNA condiviso o calcolando un coefficiente di parentela.</p><p>Le quote sommano al 100% considerando tutte le api di un singolo livello. Non vanno sommate fra generazioni: uno stesso materiale passa attraverso antenati successivi. Il DNA mitocondriale è escluso.</p><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7768778/" target="_blank" rel="noreferrer">Trasmissione paterna nelle api</a> · <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6707477/" target="_blank" rel="noreferrer">Ricombinazione e trasmissione materna</a></p></details>
    </section>}
    <section className="shared-insight" aria-labelledby="shared-ratio-title">
      <h2 id="shared-ratio-title">Dalla genealogia alla musica, attraverso Fibonacci</h2>
      <p><strong>La successione di Fibonacci emerge dalle regole del modello genealogico.</strong> Contando le posizioni, ogni maschio ha una madre e ogni femmina ha una madre e un padre: otteniamo 1, 1, 2, 3, 5, 8, 13… Anche quando una stessa ape compare in più rami, questi conteggi restano invariati.</p>
      <p>I rapporti fra numeri consecutivi si avvicinano al <strong>rapporto aureo</strong><button type="button" className="info-button inline-info" aria-label="Come si calcola il rapporto aureo?" aria-haspopup="dialog" onClick={() => ratioDialog.current.showModal()}><svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" /><path d="M10 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="10" cy="6" r="1" fill="currentColor" /></svg></button>. Questa convergenza nasce dalla stessa ricorrenza.</p>
      <p><strong>Il risultato dell’esperimento è trasformare questa struttura numerica in un percorso musicale.</strong> Assegniamo a ogni generazione il suo numero di Fibonacci e, percorrendo i legami, usiamo il rapporto fra i numeri di arrivo e partenza per cambiare la frequenza. La genealogia fornisce i numeri; la regola musicale che abbiamo scelto li rende udibili. Non occorre raggiungere esattamente il rapporto aureo per ottenere il brano.</p>
      <p>Grafo e spirale sono due disposizioni degli stessi dati. Il confronto matematico è invece fra <strong>contare tutte le immagini</strong> e <strong>contare ogni ape una sola volta</strong>.</p>
      <div className="shared-table-scroll"><table className="shared-table"><caption>Rapporto femmine / maschi nei livelli mostrati</caption><thead><tr><th>Generazione</th><th>Contando le immagini</th><th>Contando le api distinte</th></tr></thead><tbody>{ratios.slice(2).map(row => <tr key={row.generation}><th scope="row">gen.{row.generation}</th><td>{ratioText(row.positions)}</td><td>{ratioText(row.unique)}</td></tr>)}</tbody></table></div>
      <p><strong>Una sola condivisione non elimina necessariamente la convergenza.</strong> In questo esperimento, se proseguiamo senza altre condivisioni, entrambi i rapporti tendono a φ, ma con valori diversi nei singoli livelli.</p>
      <dialog ref={ratioDialog} className="rule-dialog csd-info-dialog" aria-labelledby={ratioTitle}>
        <div className="dialog-heading"><h2 id={ratioTitle}>Come si calcola il rapporto aureo?</h2><button className="close-info" aria-label="Chiudi approfondimento" onClick={() => ratioDialog.current.close()}>×</button></div>
        <div className="dialog-copy"><p>Contando le posizioni, ogni individuo aggiunge una madre e ogni femmina aggiunge un padre. Da gen.2, R(g + 1) = 1 + 1 / R(g).</p><p>Il limite positivo soddisfa R² − R − 1 = 0, quindi φ = (1 + √5) / 2 ≈ 1,618034. Il rapporto inverso maschi / femmine tende a 1 / φ ≈ 0,618034.</p><p><a href="#/spirale-aurea">Apri i calcoli della genealogia standard →</a></p></div>
        <form method="dialog"><button className="understood">Ho capito</button></form>
      </dialog>
    </section>
    <section className="shared-insight shared-next" aria-labelledby="shared-next-title">
      <h2 id="shared-next-title">Che cosa potremmo esplorare dopo?</h2>
      <p><strong>Altri antenati condivisi.</strong> Possiamo approfondire il confronto fra individui e percorsi, la partenza da una femmina e l’esportazione dei conteggi. Il prossimo scenario più utile è la condivisione ripetuta a ogni livello, per confrontare il limite φ con il rapporto costante 1.</p>
      <p><strong>Cromosomi e ricombinazione.</strong> Seguire segmenti colorati, distinguere contributi attesi e DNA effettivamente trasmesso, poi trasformare i segmenti ereditati in motivi musicali. L’ascolto attuale rimane una prima associazione fra identità e suono.</p>
      <p><strong>Sequenze ripetute nel DNA.</strong> Cercare motivi come CAG–CAG–CAG, distinguere ripetizioni perfette e imperfette e osservare come un algoritmo le riconosce. Le ripetizioni sono comuni: alcune espansioni in specifici geni sono associate a malattie umane, come Huntington e X fragile. Non sono un effetto automatico della condivisione di antenati e non sono simulate qui.</p>
      <p className="shared-caption"><a href="https://tandem.bu.edu/trf/desc" target="_blank" rel="noreferrer">Come funziona Tandem Repeats Finder</a> · <a href="https://www.ncbi.nlm.nih.gov/books/NBK1305/" target="_blank" rel="noreferrer">Huntington</a> · <a href="https://www.genome.gov/Genetic-Disorders/Fragile-X-Syndrome" target="_blank" rel="noreferrer">X fragile</a></p>
    </section>
  </>
}
