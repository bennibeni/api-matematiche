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

## Eliminazione larvale

La pagina `#/genealogia-e-sopravvivenza` confronta due grafi della stessa famiglia: 24 discendenti iniziali e gli individui rimasti dopo le eliminazioni selezionate. I nodi D1–D8 si possono eliminare e ripristinare singolarmente; tre comandi selezionano nessuna, una o tutte le otto eliminazioni. I collegamenti del grafo iniziale conservano la genealogia.

Il campione illustrativo è fissato: 8 maschi aploidi, 8 maschi diploidi e 8 future operaie, con regina A/B e padre A. Non rappresenta una distribuzione tipica della colonia. Le eliminazioni riguardano le larve; le immagini adulte identificano i gruppi. Non sono simulate generazioni successive. Regina e padre sono esclusi dal conteggio.

Le illustrazioni naturalistiche di fuco, operaia e regina sono in `public/assets/bees`; il README della cartella documenta i prompt. I due gruppi maschili condividono il disegno: la ploidia è indicata dalle etichette. I test verificano selezioni da zero a otto, identità, parentela e mantenimento degli altri gruppi.

### Discendenza controllata
La pagina ora mostra sei api selezionabili per gruppo (due maschi aploidi, due diploidi e due operaie: sei in totale) e un grafo collegato alle eliminazioni di D1/D2. Il grafo ha due coppie iniziali, una figlia riproduttrice per coppia e un figlio aploide per figlia. La riproduzione dei diploidi è un controfattuale matematico dichiarato, non un modello genetico realistico. Le partner Q1/Q2 sono esterne alla popolazione iniziale; non si sostituiscono padri assenti. Il grafo ha al massimo otto nodi e tre livelli; i nodi non realizzati rimangono tratteggiati per il confronto.
