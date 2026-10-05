import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AncestralScenarioPage from './AncestralScenarioPage.jsx'
import CsdPage from './CsdPage.jsx'
import { GenealogyBee as Bee, beeLabel } from './GenealogyBee.jsx'
import { buildTree } from './model.js'
import { Navigation, PageHeadingLabel, PageJourney } from './Navigation.jsx'
import { journey, pageLabel } from './pages.js'
import PolyandryPage from './PolyandryPage.jsx'
import SpiralPage from './SpiralPage.jsx'
import SharedAncestryPage from './SharedAncestryPage.jsx'
import './style.css'
import SurvivalPage from './SurvivalPage.jsx'
import UniparentalPage from './UniparentalPage.jsx'

function RuleInfo({ number, title, children }) {
    const dialog = useRef(null),
        titleId = useId()
    return (
        <>
            <button
                className="info-button"
                aria-label={`Informazioni sulla regola ${number}`}
                aria-haspopup="dialog"
                onClick={() => dialog.current.showModal()}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                >
                    <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                    />
                    <path
                        d="M10 9v5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <circle cx="10" cy="6" r="1" fill="currentColor" />
                </svg>
            </button>
            <dialog className="rule-dialog" ref={dialog} aria-labelledby={titleId}>
                <div className="dialog-heading">
                    <p className="eyebrow">LA REGOLA {number} / APPROFONDIMENTO</p>
                    <button
                        className="close-info"
                        aria-label="Chiudi approfondimento"
                        onClick={() => dialog.current.close()}
                    >
                        ×
                    </button>
                </div>
                <h2 id={titleId}>{title}</h2>
                <div className="dialog-copy">{children}</div>
                <form method="dialog">
                    <button className="understood">Ho capito</button>
                </form>
            </dialog>
        </>
    )
}

function App() {
    const [depth, setDepth] = useState(6)
    const tree = useMemo(() => buildTree(depth), [depth])
    const count = tree.counts.at(-1)
    return (
        <main>
            <header>
                <Navigation page="fibonacci" />
            </header>
            <section className="intro">
                <PageHeadingLabel page="fibonacci" />
                <h1>
                    Di generazione
                    <br />
                    in <em>generazione.</em>
                </h1>
                <p>
                    Parti da un fuco e risali il suo albero genealogico.
                    <br className="desktop" /> Ogni generazione rivela il numero
                    successivo della successione.
                </p>
            </section>
            <aside className="reading-note" aria-label="Da tenere a mente">
                <strong>Da tenere a mente</strong>
                <p>
                    Quella illustrata è la nostra genealogia standard: un punto di
                    partenza semplice per capire le regole. Nelle pagine successive
                    esploriamo scenari più vicini alla complessità delle api reali,
                    cambiando alcune ipotesi alla volta.
                </p>
            </aside>
            <section className="rules" aria-label="Le regole del modello">
                <article>
                    <span className="sex male">M</span>
                    <div className="rule-summary">
                        <div className="rule-title">
                            <strong>Un maschio, una madre.</strong>
                            <RuleInfo number={1} title="Come nasce un fuco?">
                                <p>
                                    Nell’ape mellifera, il maschio è chiamato{' '}
                                    <strong>fuco</strong>. Normalmente nasce da un{' '}
                                    <strong>uovo non fecondato</strong>: lo sviluppo dell’embrione
                                    inizia senza che uno spermatozoo si unisca all’uovo. Questo
                                    processo si chiama <strong>partenogenesi arrenotoca</strong>.
                                </p>
                                <p>
                                    La madre produce l’uovo attraverso la <strong>meiosi</strong>,
                                    che riduce a metà il numero di cromosomi. Il fuco è quindi{' '}
                                    <strong>aploide</strong>: possiede una sola serie di 16
                                    cromosomi, ricevuta dalla madre. Le femmine sono invece
                                    normalmente diploidi, con due serie, per un totale di 32
                                    cromosomi.
                                </p>
                                <div className="info-example">
                                    Uovo materno non fecondato → fuco M<br />
                                    <span>Un solo genitore biologico: la madre F.</span>
                                </div>
                                <p>
                                    Il fuco non è una copia della madre: eredita una combinazione
                                    del suo patrimonio genetico. E non avere un padre non
                                    significa non avere un nonno: sua madre, nel nostro modello,
                                    ha a sua volta una madre e un padre.
                                </p>
                                <p className="model-note">
                                    <strong>Nel modello:</strong> rappresentiamo tutti i nodi M
                                    come fuchi aploidi. In natura esistono anche maschi diploidi;
                                    questa eccezione è esclusa dalle nostre regole.
                                </p>
                                <p className="info-source">
                                    Fonti:{' '}
                                    <a
                                        href="https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1000222"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Gempe et al., PLOS Biology (2009)
                                    </a>
                                    ;{' '}
                                    <a
                                        href="https://www.nature.com/articles/nature05260"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Honeybee Genome Sequencing Consortium, Nature (2006)
                                    </a>
                                    .
                                </p>
                            </RuleInfo>
                        </div>
                        <p>Ogni nodo M ha un solo genitore F.</p>
                    </div>
                </article>
                <article>
                    <span className="sex female">F</span>
                    <div className="rule-summary">
                        <div className="rule-title">
                            <strong>Una femmina, due genitori.</strong>
                            <RuleInfo number={2} title="Perché una femmina ha due genitori?">
                                <p>
                                    Nel ciclo riproduttivo rappresentato, una femmina nasce da un{' '}
                                    <strong>uovo fecondato</strong>. Alla serie di cromosomi
                                    dell’uovo materno si aggiunge quella dello spermatozoo
                                    paterno: l’individuo è <strong>diploide</strong>, con 32
                                    cromosomi.
                                </p>
                                <p>
                                    Ogni figlia ha una madre e un solo padre biologico. Il fatto
                                    che una regina possa accoppiarsi con più fuchi non assegna più
                                    padri a una singola figlia.
                                </p>
                                <div className="info-example">
                                    Uovo della madre F + spermatozoo del padre M<br />
                                    <span>
                                        Nel modello → figlia F, con due genitori distinti.
                                    </span>
                                </div>
                                <p className="model-note">
                                    <strong>Nel modello:</strong> ogni F nasce per riproduzione
                                    sessuata. Non includiamo la nascita di femmine senza
                                    fecondazione. Nelle api reali il sesso dipende anche dal gene{' '}
                                    <em>csd</em>: la fecondazione da sola non garantisce una
                                    femmina.
                                </p>
                                <p>
                                    Nel grafo, ogni nodo F apre quindi due rami: uno verso F e uno
                                    verso M. Questa regola, insieme a quella dei maschi, genera la
                                    successione di Fibonacci.
                                </p>
                                <p className="info-source">
                                    Fonte:{' '}
                                    <a
                                        href="https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1000222"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Gempe et al., PLOS Biology (2009)
                                    </a>
                                    .
                                </p>
                            </RuleInfo>
                        </div>
                        <p>Ogni nodo F ha una madre e un padre.</p>
                    </div>
                </article>
                <article>
                    <span className="distinct">↗</span>
                    <div className="rule-summary">
                        <div className="rule-title">
                            <strong>Ogni ape è un individuo distinto.</strong>
                            <RuleInfo number={3} title="Perché i rami non si riuniscono?">
                                <p>
                                    Questa è un’<strong>ipotesi matematica</strong>: ogni genitore
                                    aggiunto al grafo è un nuovo individuo. La stessa ape non
                                    compare mai come antenato lungo due percorsi diversi.
                                </p>
                                <div className="info-example">
                                    Una posizione nell’albero = un individuo distinto.
                                </div>
                                <p>
                                    In una genealogia reale, due rami possono risalire allo stesso
                                    antenato. In quel caso le posizioni nell’albero espanso e gli
                                    individui effettivi non sono più la stessa cosa: una persona o
                                    un’ape può occupare più posizioni genealogiche.
                                </p>
                                <p>
                                    Per esempio, se due nodi M dello stesso livello avessero la
                                    stessa madre, i loro due rami arriverebbero a una sola F: due
                                    posizioni, ma un solo individuo. Qui le due madri sono sempre
                                    distinte.
                                </p>
                                <p className="model-note">
                                    <strong>La garanzia:</strong> con questa ipotesi, le regole 1
                                    e 2 e un maschio iniziale, i numeri di Fibonacci contano
                                    davvero gli <strong>individui</strong> di ogni generazione,
                                    non soltanto i percorsi: 1, 1, 2, 3, 5, 8…
                                </p>
                            </RuleInfo>
                        </div>
                        <p>I rami non si riuniscono mai.</p>
                    </div>
                </article>
            </section>
            <section className="lab">
                <div className="lab-heading">
                    <div>
                        <p className="eyebrow">L’ALBERO DEGLI ANTENATI</p>
                        <h2>Una generazione alla volta</h2>
                    </div>
                    <div className="stepper" aria-label="Profondità del grafo">
                        <button
                            aria-label="Mostra una generazione in meno"
                            disabled={depth === 1}
                            onClick={() => setDepth((d) => d - 1)}
                        >
                            −
                        </button>
                        <span>
                            Fino a <strong>gen.{depth}</strong>
                        </span>
                        <button
                            aria-label="Mostra una generazione in più"
                            disabled={depth === 10}
                            onClick={() => setDepth((d) => d + 1)}
                        >
                            +
                        </button>
                    </div>
                </div>
                <div
                    className="sequence"
                    aria-label="Numero di individui per generazione"
                >
                    {tree.counts.map((n, g) => (
                        <div key={g} className={g === depth ? 'current' : ''}>
                            <span>gen.{g}</span>
                            <strong>{n}</strong>
                        </div>
                    ))}
                </div>
                <div className="graph-meta">
                    <p>Verso gli antenati ↓</p>
                    <div className="legend">
                        <span>
                            <i className="dot female" />
                            Femmina F
                        </span>
                        <span>
                            <i className="dot male" />
                            Maschio M·n
                        </span>
                    </div>
                </div>
                <div
                    className="graph-scroll"
                    tabIndex="0"
                    role="region"
                    aria-label="Albero completo, scorribile orizzontalmente"
                >
                    <svg
                        className="tree"
                        width={tree.width}
                        height={tree.height}
                        viewBox={`0 0 ${tree.width} ${tree.height}`}
                        role="img"
                        aria-label={`Albero genealogico del fuco: ${tree.counts.join(', ')} individui nelle generazioni da zero a ${depth}`}
                    >
                        {tree.levels.map((level, g) => (
                            <g key={g}>
                                <line
                                    x1="115"
                                    x2={tree.width - 15}
                                    y1={50 + g * 100}
                                    y2={50 + g * 100}
                                    stroke="#eeeade"
                                    strokeDasharray="3 6"
                                />
                                <text x="18" y={46 + g * 100} className="generation">
                                    gen.{g}
                                </text>
                                <text x="18" y={65 + g * 100} className="row-count">
                                    {level.length}{' '}
                                    {level.length === 1 ? 'individuo' : 'individui'}
                                </text>
                            </g>
                        ))}
                        {tree.nodes.flatMap((n) =>
                            n.parents.map((id) => {
                                const p = tree.nodes[id]
                                const y = 50 + n.generation * 100
                                return (
                                    <path
                                        key={`${n.id}-${id}`}
                                        d={`M${n.x} ${y + 16} C${n.x} ${y + 52},${p.x} ${y + 48},${p.x} ${y + 84}`}
                                        fill="none"
                                        stroke="#c6cdbd"
                                        strokeWidth="1.5"
                                    />
                                )
                            }),
                        )}
                        {tree.nodes.map((n) => (
                            <g key={n.id} className="bee-node">
                                <title>
                                    {n.type === 'M' ? 'Maschio' : 'Femmina'} · gen.{n.generation}{' '}
                                    · individuo {n.id + 1}
                                    {n.generation === depth ? ' · limite della vista' : ''}
                                </title>
                                <Bee type={n.type} x={n.x} y={50 + n.generation * 100} />
                                <text
                                    x={n.x}
                                    y={79 + n.generation * 100}
                                    textAnchor="middle"
                                    className="node-label"
                                >
                                    {beeLabel(n.type)}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
                <div className="graph-footer">
                    <span>
                        Tutte le api sono mostrate. Scorri lateralmente se l’albero supera
                        lo schermo.
                    </span>
                    <span>gen.0 è il fuco iniziale.</span>
                </div>
            </section>
            <section className="explanation">
                <div>
                    <p className="eyebrow">NON È UNA COINCIDENZA</p>
                    <h2>
                        Perché contiamo
                        <br />
                        numeri di Fibonacci?
                    </h2>
                    <p>
                        Ogni ape aggiunge una madre alla generazione precedente. Solo le
                        femmine aggiungono anche un padre. Per questo, dopo i primi due
                        livelli, ogni totale è la somma dei due precedenti.
                    </p>
                    <p className="boundary">
                        L’ultima riga è soltanto il limite della vista: anche quelle api
                        hanno antenati.
                    </p>
                </div>
                <div className="equation">
                    <p>ALLA GENERAZIONE gen.{depth}</p>
                    {depth >= 2 ? (
                        <>
                            <div>
                                <span>{tree.counts[depth - 2]}</span>
                                <i>+</i>
                                <span>{tree.counts[depth - 1]}</span>
                                <i>=</i>
                                <strong>{count}</strong>
                            </div>
                            <small>
                                gen.{depth - 2} <span>+</span> gen.{depth - 1} <span>→</span>{' '}
                                gen.{depth}
                            </small>
                        </>
                    ) : (
                        <>
                            <div>
                                <strong>1</strong>
                                <i>→</i>
                                <strong>1</strong>
                            </div>
                            <small>Un fuco, una madre: i due valori iniziali.</small>
                        </>
                    )}
                    <p className="formula">N(g) = N(g − 1) + N(g − 2), per g ≥ 2</p>
                </div>
            </section>
            <PageJourney page="fibonacci" />
            <footer className="projects-footer">
                <a href="https://links-page-bennibeni.vercel.app/">
                    &larr; All projects
                </a>
            </footer>
        </main>
    )
}
function Pages() {
    const [hash, setHash] = useState(window.location.hash)
    useEffect(() => {
        const change = () => {
            setHash(window.location.hash)
            window.scrollTo(0, 0)
        }
        window.addEventListener('hashchange', change)
        return () => window.removeEventListener('hashchange', change)
    }, [])
    const uniparental = hash === '#/una-femmina-senza-padre'
    const csd = hash === '#/alleli-e-sesso'
    const survival = hash === '#/genealogia-e-sopravvivenza'
    const scenarios = hash === '#/scenari-genealogici'
    const polyandry = hash === '#/poliandria'
    const spiral = hash === '#/spirale-aurea'
    const shared = hash === '#/antenati-condivisi'
    useEffect(() => {
        const id = journey.find((page) => page[1] === hash)?.[0] ?? 'fibonacci'
        document.title = pageLabel(id) + ' · Api matematiche'
    }, [hash])
    return shared ? (
        <SharedAncestryPage />
    ) : polyandry ? (
        <PolyandryPage />
    ) : spiral ? (
        <SpiralPage />
    ) : scenarios ? (
        <AncestralScenarioPage />
    ) : survival ? (
        <SurvivalPage />
    ) : csd ? (
        <CsdPage />
    ) : uniparental ? (
        <UniparentalPage />
    ) : (
        <App />
    )
}
createRoot(document.getElementById('root')).render(<Pages />)
