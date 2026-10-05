# Api matematiche

Applicazione React/JavaScript autonoma. Un solo modello deterministico: il nodo iniziale è M; ogni M ha una madre F; ogni F ha una madre F e un padre M. Ogni genitore è un nuovo individuo, senza condivisioni o cicli. L'unico controllo modifica la profondità visibile da g1 a g10. g0 conta l'individuo iniziale.

## Garanzia matematica

Se M_g e F_g contano gli individui di ogni tipo al livello g, allora M_(g+1)=F_g e F_(g+1)=M_g+F_g. Con M_0=1 e F_0=0 i totali sono 1,1,2,3,5,8,... . Per g>=2, N_g=N_(g-1)+N_(g-2). Nessun individuo è condiviso: il numero di nodi distinti coincide con il numero di posizioni genealogiche.

Il grafo viene costruito dalle regole locali, non dai numeri attesi. I test confrontano indipendentemente i conteggi con Fibonacci e verificano unicità, parentela e livelli a tutte le profondità supportate. Tutti i nodi sono disegnati; sui grafi larghi si scorre orizzontalmente. L'ultimo livello è un limite della vista, non una generazione senza genitori. Non è una simulazione demografica o genetica.

## Uso

Node 20.19+ oppure 22.12+.

```sh
npm install
npm run dev -- --port 5179
npm test
npm run build
```

Questo progetto è separato da `genealogie-fibonacci` e non lo modifica.

## Una femmina senza padre

La pagina `#/una-femmina-senza-padre` confronta il modello standard con una sola nascita uniparentale: la madre F del fuco iniziale, in g1. Il suo ramo paterno è assente nella storia alternativa; la madre della F conserva la genealogia standard. Identità e posizioni dei nodi mantenuti coincidono fra i due disegni. Non viene simulata una cancellazione retroattiva di un padre esistente, né l'ereditarietà di una mutazione.

La vista è fissa fino a g6 e un solo interruttore attiva/disattiva l'evento. I conteggi alternativi sono 1,1,1,2,3,5,8. La differenza da g2 è la successione 1,1,2,3,5 del ramo paterno assente. I test verificano la conservazione di ogni altra lista di genitori e l'identità esatta del sottoalbero assente. Le fonti biologiche sono collegate nella pagina; il modello riguarda solo i legami genealogici.

## Larve e risorse

La pagina `#/genealogia-e-sopravvivenza` usa `resourceExperiment.js` per confrontare tre scenari a parametri fissi. Con 40 unità disponibili e un costo di 10 per maschio allevato:

| Scenario | Maschi allevati | Cibo impiegato | Cibo rimasto | Figli attesi |
| --- | ---: | ---: | ---: | ---: |
| Senza eliminazioni | 4 | 40 | 0 | 10 |
| Eliminare e conservare | 2 | 20 | 20 | 8 |
| Eliminare e riutilizzare | 4 | 40 | 0 | 16 |

Il contributo convenzionale è di quattro figli per maschio aploide e uno per maschio diploide, per periodi riproduttivi della stessa durata. Le due larve aploidi aggiuntive sono disponibili per un allevamento successivo. Il modello assume tempo e opportunità riproduttive sufficienti; non simula eredità genetica, crescita della colonia o sopravvivenza. I test verificano il bilancio e distinguono risparmio, efficienza e contributo totale.

## Organizzazione del codice

- `pages.js`: percorso, etichette del menu e route condivise.
- `Navigation.jsx`: menu, etichette sopra i titoli e collegamenti fra pagine.
- `model.js`, `uniparental.js`, `polyandry.js`, `csd.js`, `resourceExperiment.js`, `ancestralScenarios.js`, `spiral.js`: modelli delle sette pagine e relativi test.
- `GenealogyBee.jsx`: simboli dei grafi genealogici; `beeAssets.js`: illustrazioni della popolazione.
- `style.css`: stili condivisi e regole responsive. L'ordine delle regole fa parte della cascata: preservarlo quando si riordinano gli stili.

I modelli delle precedenti versioni della colonia sono stati rimossi insieme ai soli test che li riguardavano. I controlli della ricorrenza operano direttamente su `formulaAncestry`.
