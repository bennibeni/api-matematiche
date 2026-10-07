import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation, PageHeadingLabel, PageJourney } from './Navigation.jsx';
import { GenealogyBee } from './GenealogyBee.jsx';
import { sharedAncestry } from './sharedAncestry.js';
import GenealogyPlayer from './GenealogyPlayer.jsx';
import SharedGenealogyGraph from './SharedGenealogyGraph.jsx';
import SharedInsights from './SharedInsights.jsx';

const colors = ['#658779', '#b88735', '#87789d', '#458d92', '#b86b52', '#6f893e', '#a36885'];

export default function SharedAncestryPage() {
  const [shared, setShared] = useState(true);
  const [view, setView] = useState('graph');
  const [selected, setSelected] = useState(null);
  const [highlightPaths, setHighlightPaths] = useState(true);
  const [sounding, setSounding] = useState(null);
  const diagram = useRef(null);
  const model = useMemo(() => sharedAncestry(shared), [shared]);
  const byId = new Map(model.points.map((point) => [point.id, point]));
  const identity = selected;
  const chosen = identity === null ? null : model.individuals.get(identity);
  const occurrences = chosen ? model.points.filter((point) => point.identity === identity) : [];
  const related = (point) =>
    sounding !== null ||
    !highlightPaths ||
    !chosen ||
    occurrences.some(
      (other) => point.path.startsWith(other.path) || other.path.startsWith(point.path),
    );
  const final = model.rows[6];

  function showStep(step) {
    setSounding(step);
    if (step?.index === 0) setView('spiral');
  }

  const isPlaying = sounding !== null;
  useEffect(() => {
    if (!isPlaying) return;
    const frame = requestAnimationFrame(() => {
      diagram.current?.querySelector('svg')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  function selectIdentity(value) {
    setSelected(value === selected ? null : value);
  }

  function changeSharing(event) {
    setShared(event.target.checked);
    setSelected(null);
    setSounding(null);
  }

  const pathControls = (
    <>
      <p className="shared-click-hint">
        Seleziona un’ape per evidenziare i suoi rami. Cliccala di nuovo per tornare a tutte le api.
        Più sotto puoi ascoltare il percorso scelto.
      </p>
      <label className="prominent-check shared-path-toggle">
        <input
          type="checkbox"
          checked={highlightPaths}
          disabled={!chosen || sounding !== null}
          onChange={(event) => setHighlightPaths(event.target.checked)}
        />
        Mostra solo i percorsi dell’ape selezionata
      </label>
      <p className="shared-selection" aria-live="polite">
        {sounding
          ? 'Durante l’ascolto sono visibili tutti i percorsi. Il cerchio arancione indica la posizione suonata; la linea arancione è il collegamento appena percorso. Il tratteggio indica un salto tra duplicati.'
          : chosen
            ? `${chosen.label} · gen.${chosen.generation} · ${chosen.occurrences.length} ${chosen.occurrences.length === 1 ? 'immagine' : 'immagini'} in ciascun disegno. Contorno rosso: ape selezionata. ${highlightPaths ? 'Sono visibili solo i percorsi che passano da lei.' : 'Tutti i percorsi restano visibili.'}`
            : 'Tutti i percorsi sono visibili.'}
      </p>
    </>
  );

  return (
    <main className="shared-ancestry-page">
      <header>
        <Navigation page="shared" />
      </header>
      <section className="colony-intro">
        <PageHeadingLabel page="shared" />
        <h1>
          Una stessa ape.
          <br />
          <em>Più percorsi.</em>
        </h1>
      </section>
      <aside className="reading-note" aria-label="Da tenere a mente">
        <strong>Da tenere a mente</strong>
        <p>
          Una <strong>stessa antenata può essere raggiunta attraverso più rami familiari</strong>:
          possiamo quindi avere 13 immagini sul grafo ma soltanto 8 api diverse. Il{' '}
          <strong>contorno viola</strong> segnala le api rappresentate in più posizioni. Queste
          immagini sono i <strong>duplicati della stessa ape</strong>: hanno la stessa etichetta
          (per esempio Ape 5) e rappresentano un unico individuo raggiunto da percorsi diversi.
        </p>
        <p>
          <strong>Le generazioni si contano a ritroso.</strong> Partiamo da Ape 1, in gen.0: gen.1
          indica i suoi genitori, gen.2 i nonni, gen.3 i bisnonni e così via. Un indice più alto
          indica quindi antenati più lontani nel passato.
        </p>
      </aside>
      <section className="lab" aria-labelledby="shared-spiral-title">
        <div className="lab-heading">
          <div>
            <h2 id="shared-spiral-title">Le stesse api, nel grafo e nella spirale</h2>
            <p className="shared-caption">
              Grafo e spirale mostrano le stesse api e gli stessi legami, disposti diversamente. La
              selezione si conserva cambiando vista.
            </p>
          </div>
        </div>
        <div
          hidden={isPlaying}
          className="shared-view-switch"
          role="group"
          aria-label="Scegli la rappresentazione"
        >
          <button aria-pressed={view === 'graph'} onClick={() => setView('graph')}>
            Grafo genealogico
          </button>
          <button aria-pressed={view === 'spiral'} onClick={() => setView('spiral')}>
            Spirale
          </button>
        </div>
        <div className="shared-counts" role="status">
          <div>
            <strong>{final.positions}</strong>
            <span>posizioni in gen.6</span>
          </div>
          <div>
            <strong>{final.unique}</strong>
            <span>api distinte in gen.6</span>
          </div>
          <div>
            <strong>{final.positions - final.unique}</strong>
            <span>occorrenze aggiuntive delle stesse api</span>
          </div>
        </div>
        <div className="uniparental-toggle">
          <label>
            <input type="checkbox" checked={shared} onChange={changeSharing} />
            Una madre condivisa in gen.3
          </label>
        </div>
        <p className="shared-premise">
          Con la casella attiva, i genitori di Ape 2 (gen.1) — la madre Ape 3 e il padre Ape 4
          (gen.2) — condividono la madre Ape 5 (gen.3): sono sorella e fratello per parte materna.
          Ape 5 è quindi la nonna di Ape 2 attraverso entrambi i genitori. Disattiva la casella: in
          gen.6 le posizioni restano 13, ma le api distinte passano da 8 a 13. Riattivala e
          seleziona Ape 5 per riconoscerne i duplicati nei due rami.
        </p>
        <div ref={diagram} className="shared-playing-diagram">
          {!isPlaying && view === 'graph' ? (
            <SharedGenealogyGraph
              model={model}
              identity={identity}
              related={related}
              onSelect={selectIdentity}
              step={sounding}
              controls={pathControls}
            />
          ) : (
            <>
              <section className="shared-spiral-view" aria-labelledby="shared-spiral-view-title">
                <h3 id="shared-spiral-view-title">Le stesse api sulla spirale</h3>
                <p className="shared-caption">
                  Verso gli antenati: dal centro all’esterno. Ogni ape mantiene la stessa etichetta
                  del grafo.
                </p>
                {pathControls}
                <svg
                  id="shared-spiral-score"
                  className="shared-spiral"
                  viewBox={model.viewBox}
                  role="group"
                  aria-label="Spirale delle posizioni genealogiche con antenata condivisa selezionabile"
                >
                  {model.segments.map((segment) => (
                    <path
                      key={segment.g}
                      d={segment.path}
                      fill="none"
                      stroke={colors[segment.g]}
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                      opacity=".22"
                    />
                  ))}
                  {model.points.flatMap((point) =>
                    point.parents.map((id) => {
                      const parent = byId.get(id);
                      const active = related(point) && related(parent);
                      if (!active) return null;
                      const cx = (point.x + parent.x) / 2 - (parent.y - point.y) * 0.12;
                      const cy = (point.y + parent.y) / 2 + (parent.x - point.x) * 0.12;
                      return (
                        <path
                          key={`${point.id}-${id}`}
                          d={`M ${point.x} ${point.y} Q ${cx} ${cy} ${parent.x} ${parent.y}`}
                          fill="none"
                          stroke={
                            sounding &&
                            ((sounding.id === id && sounding.fromId === point.id) ||
                              (sounding.id === point.id && sounding.fromId === id))
                              ? '#bd6717'
                              : '#526c58'
                          }
                          strokeWidth={
                            sounding &&
                            ((sounding.id === id && sounding.fromId === point.id) ||
                              (sounding.id === point.id && sounding.fromId === id))
                              ? 4
                              : 2
                          }
                          vectorEffect="non-scaling-stroke"
                          opacity=".7"
                        />
                      );
                    }),
                  )}
                  {sounding?.direction.startsWith('teleport') && (
                    <line
                      x1={byId.get(sounding.fromId).x}
                      y1={byId.get(sounding.fromId).y}
                      x2={byId.get(sounding.id).x}
                      y2={byId.get(sounding.id).y}
                      stroke="#bd6717"
                      strokeWidth="4"
                      strokeDasharray="8 6"
                      vectorEffect="non-scaling-stroke"
                    >
                      <title>Salto tra duplicati</title>
                    </line>
                  )}
                  {model.points.map((point) => {
                    const bee = model.individuals.get(point.identity);
                    const active = point.identity === identity;
                    if (!related(point)) return null;
                    return (
                      <g
                        key={point.id}
                        role="button"
                        tabIndex="0"
                        aria-pressed={active}
                        aria-label={`${bee.label}, ${point.type === 'F' ? 'femmina' : 'maschio aploide'}, gen.${point.generation}, posizione ${point.id + 1}, ${bee.occurrences.length} occorrenze`}
                        className="shared-bee"
                        onClick={() =>
                          setSelected(point.identity === selected ? null : point.identity)
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelected(point.identity === selected ? null : point.identity);
                          }
                        }}
                        opacity={related(point) ? 1 : 0.3}
                      >
                        <circle
                          className="shared-bee-outline"
                          cx={point.x}
                          cy={point.y}
                          r={active ? 24 : 22}
                          fill={bee.occurrences.length > 1 ? '#925c87' : '#fffdf6'}
                          stroke={
                            active
                              ? '#bc3434'
                              : bee.occurrences.length > 1
                                ? '#925c87'
                                : colors[point.generation]
                          }
                          strokeWidth={active ? 5 : 2}
                        />
                        <GenealogyBee type={point.type} x={point.x} y={point.y} />
                        {sounding?.id === point.id && (
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="29"
                            fill="none"
                            stroke="#bd6717"
                            strokeWidth="4"
                            className="music-cursor"
                          />
                        )}
                        <text
                          x={point.x}
                          y={point.y + 35}
                          textAnchor="middle"
                          className="shared-tree-label"
                        >
                          {bee.label}
                          <tspan x={point.x} dy="12">
                            n = {model.counts[point.generation]}
                          </tspan>
                        </text>
                        <title>
                          {bee.label} · gen.{point.generation} · {bee.occurrences.length} occorrenze
                        </title>
                      </g>
                    );
                  })}
                </svg>
              </section>
            </>
          )}
        </div>
        <div className="shared-table-scroll">
          <table className="shared-table">
            <thead>
              <tr>
                <th scope="col">Conteggio</th>
                {model.rows.map((row) => (
                  <th scope="col" key={row.generation}>
                    gen.{row.generation}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Posizioni genealogiche</th>
                {model.rows.map((row) => (
                  <td key={row.generation}>{row.positions}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Api distinte</th>
                {model.rows.map((row) => (
                  <td
                    key={row.generation}
                    className={row.unique !== row.positions ? 'shared-different' : undefined}
                  >
                    {row.unique}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <GenealogyPlayer
          key={String(shared)}
          model={model}
          onStep={showStep}
          selectedIdentity={selected}
        />
      </section>

      <SharedInsights
        model={model}
        chosen={selected === null ? null : model.individuals.get(selected)}
        shared={shared}
        showGenetics={false}
      />
      <PageJourney page="shared" />
    </main>
  );
}
