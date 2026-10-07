import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  depthFirstScore,
  frequencyNote,
  startingNotes,
  phraseScore,
  varyDuplicates,
  identityNotes,
  GOLDEN_PEAK,
} from './genealogyMusic.js';
import { beeAssets } from './beeAssets.js';
import MusicStaff from './MusicStaff.jsx';
import { scheduleBeeNote } from './beeTimbre.js';

const playableStartingNotes = startingNotes.map((note) => ({
  midi: note.midi + 12,
  frequency: note.frequency * 2,
  label: frequencyNote(note.frequency * 2).label,
}));

const format = (value) => value.toLocaleString('it-IT', { maximumFractionDigits: 2 });
const pitchLabel = (frequency) => {
  const pitch = frequencyNote(frequency);
  return `${pitch.label}${pitch.cents === 0 ? '' : ` ${pitch.cents > 0 ? '+' : '−'}${format(Math.abs(pitch.cents))} cent`}`;
};

export default function GenealogyPlayer({ model, onStep, selectedIdentity = null }) {
  const mode = 'identity';
  const variation = 'ornament';
  const scale = 'minor';
  const goldenShape = true;
  const [noteIndex, setNoteIndex] = useState(0);
  const timbre = 'swarm';
  const teleportTwins = true;
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(null);
  const [message, setMessage] = useState(
    'Partiamo da Ape 1, gen.0. Prima il ramo della madre, poi quello del padre, quando presente.',
  );
  const audio = useRef(null);
  const frame = useRef(null);
  const run = useRef(0);
  const queenPlay = useRef(null);
  const note = playableStartingNotes[noteIndex];
  const score = useMemo(
    () =>
      phraseScore(
        varyDuplicates(
          depthFirstScore(model, note.frequency, selectedIdentity, teleportTwins, mode, scale),
          variation,
          scale,
          note.frequency,
        ),
        timbre,
      ),
    [model, note.frequency, selectedIdentity, teleportTwins, mode, timbre, scale, variation],
  );

  const ornamentWindows = useMemo(
    () =>
      score
        .filter((event) => event.ornamentPart)
        .map((event) => ({
          start: event.onset,
          end: event.onset + event.soundDuration + 2,
        })),
    [score],
  );
  useEffect(() => {
    const image = new Image();
    image.src = beeAssets.queenWingsOpen;
  }, []);

  const totalDuration = score.at(-1).onset + score.at(-1).duration;
  const identityRows = identityNotes(model, note.frequency, scale);

  function release() {
    run.current++;
    cancelAnimationFrame(frame.current);
    frame.current = null;
    if (queenPlay.current) {
      queenPlay.current.style.transform = '';
      queenPlay.current.setAttribute('src', beeAssets.queen);
    }
    const context = audio.current;
    audio.current = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }
  useEffect(() => () => release(), []);
  useEffect(() => {
    release();
    setPlaying(false);
    setStep(null);
    onStep(null);
    setMessage('Percorso aggiornato. Avvia l’ascolto per esplorarlo.');
  }, [
    model,
    selectedIdentity,
    teleportTwins,
    mode,
    timbre,
    noteIndex,
    scale,
    goldenShape,
    variation,
  ]);

  function stop() {
    release();
    setPlaying(false);
    setStep(null);
    onStep(null);
    setMessage('Ascolto interrotto. Riparti dal maschio iniziale quando vuoi.');
  }

  async function play() {
    release();
    const token = run.current;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      setMessage('Questo browser non supporta la riproduzione audio.');
      return;
    }
    try {
      const context = new AudioContext();
      audio.current = context;
      await context.resume();
      if (token !== run.current) return;
      const start = context.currentTime + 0.08;
      const master = context.createGain();
      master.gain.value = 0.12;
      if (goldenShape) {
        master.gain.setValueAtTime(0.04, start);
        master.gain.linearRampToValueAtTime(0.16, start + totalDuration * GOLDEN_PEAK);
        master.gain.linearRampToValueAtTime(0.04, start + totalDuration);
      }
      master.connect(context.destination);
      score.forEach((event) =>
        scheduleBeeNote(context, master, event.frequency, start + event.onset, timbre, event),
      );
      setPlaying(true);
      setMessage(
        'Visita in profondità in corso: ogni collegamento viene percorso all’andata e al ritorno.',
      );
      let lastIndex = -1;
      function update() {
        if (token !== run.current) return;
        const elapsed = context.currentTime - start;
        let index = lastIndex;
        while (index + 1 < score.length && score[index + 1].onset <= elapsed) index++;
        if (elapsed >= totalDuration) {
          release();
          setPlaying(false);
          setStep(null);
          onStep(null);
          setMessage('Percorso concluso: siamo tornati ad Ape 1 e alla frequenza iniziale.');
          return;
        }
        // Use the audio clock for the requested rotation, including faster ornament notes.
        if (index >= 0) {
          const event = score[index];
          const progress = Math.min(1, Math.max(0, (elapsed - event.onset) / event.duration));
          const transform = `rotate(${(index + progress) * 90}deg)`;
          if (queenPlay.current) {
            queenPlay.current.style.transform = transform;
            const wingsOpen = ornamentWindows.some(
              ({ start, end }) => elapsed >= start && elapsed < end,
            );
            const source = wingsOpen ? beeAssets.queenWingsOpen : beeAssets.queen;
            if (queenPlay.current.getAttribute('src') !== source) {
              queenPlay.current.setAttribute('src', source);
            }
          }
        }
        if (index >= 0 && index !== lastIndex) {
          lastIndex = index;
          const current = { ...score[index], index, total: score.length };
          setStep(current);
          onStep(current);
        }
        frame.current = requestAnimationFrame(update);
      }
      frame.current = requestAnimationFrame(update);
    } catch {
      if (token !== run.current) return;
      release();
      setPlaying(false);
      setStep(null);
      onStep(null);
      setMessage('Audio non disponibile. Puoi continuare a esplorare le api nel disegno.');
    }
  }

  return (
    <section className="genealogy-player" aria-labelledby="genealogy-player-title">
      <h3 id="genealogy-player-title">Percorriamo la genealogia, ascoltando Fibonacci</h3>
      <div className="music-discovery">
        <p>
          <strong>Fibonacci ci offre un ponte fra genealogia e musica.</strong> Le regole
          genealogiche producono i conteggi 1, 1, 2, 3, 5, 8, 13… Per comporre il brano facciamo una
          scelta distinta: associamo a ogni ape un termine della successione, iniziando da F₀ = 0
          per Ape 1, F₁ = 1 per Ape 2, F₂ = 1 per Ape 3, F₃ = 2 per Ape 4 e così via. Usiamo la
          convenzione F₀ = 0, F₁ = 1: la successione è 0, 1, 1, 2, 3, 5…; nella presentazione che
          parte da F₁ lo zero iniziale viene omesso.
        </p>
        <p>
          <strong>Fibonacci modulo 7</strong> significa prendere il resto della divisione di quel
          numero per 7. Otteniamo un valore da 0 a 6, che sceglie uno dei sette gradi della scala
          minore naturale: 0 indica la tonica, 1 il secondo grado, fino a 6 per il settimo. Per
          esempio F₇ = 13: 13 diviso 7 dà resto 6, quindi Ape 8 suona il settimo grado — Si♭ se la
          tonica è Do.
        </p>
        <p>
          Le note di base si trovano nell’ottava che inizia con la nota di partenza scelta. Il
          percorso genealogico ne determina l’ordine: la stessa ape conserva la propria nota nei due
          disegni, nei duplicati e nei ritorni. Api diverse possono condividere una nota, perché i
          gradi sono soltanto sette. I numeri delle api restano stabili: condividere un’antenata
          riusa la sua nota senza rinumerare le altre. Questa associazione è una scelta compositiva,
          non una conseguenza obbligata della genealogia.
        </p>
      </div>
      <div className="shared-actions music-main-controls">
        <label className="starting-note">
          Nota di partenza
          <select
            value={noteIndex}
            disabled={playing}
            onChange={(event) => setNoteIndex(Number(event.target.value))}
          >
            {playableStartingNotes.map((item, index) => (
              <option value={index} key={item.midi}>
                {item.label} · {format(item.frequency)} Hz
              </option>
            ))}
          </select>
        </label>
        <button
          className={`queen-play${playing ? ' is-playing' : ''}`}
          onClick={playing ? stop : play}
          aria-label={playing ? 'Ferma il percorso musicale' : 'Avvia il percorso musicale'}
          aria-controls="shared-spiral-score"
        >
          <img ref={queenPlay} src={beeAssets.queen} alt="" />
          <span>{playing ? 'Ferma' : 'Avvia'}</span>
        </button>
      </div>
      <div className="music-progress">
        <span>
          {score.length} suoni · circa {Math.round(totalDuration)} secondi
        </span>
        {step && (
          <span>
            Passo {step.index + 1} di {score.length}
          </span>
        )}
        <progress
          aria-label="Avanzamento del percorso musicale"
          max={score.length}
          value={step ? step.index + 1 : 0}
        />
      </div>
      <p role="status">{message}</p>
      <MusicStaff score={score} index={step?.index ?? null} />
      {step && (
        <p className="music-current-note">
          <strong>Nota suonata: {pitchLabel(step.frequency)}</strong>
        </p>
      )}
      <details className="music-details">
        <summary>Note, frequenze e dettagli dell’esperimento</summary>
        <p>
          La nota scelta è la tonica della scala minore naturale e la prima nota del brano. La scala
          ha sette gradi: per esempio, da Do sono Do, Re, Mi♭, Fa, Sol, La♭, Si♭. Gli ornamenti
          possono raggiungere la tonica dell’ottava successiva: è la stessa classe di nota a
          un’altezza diversa, non un ottavo grado distinto. Il percorso ordina queste note in una
          melodia, anziché eseguire la scala in ordine.
        </p>
        <p>
          Le note normali iniziano ogni 0,50 secondi (120 movimenti al minuto) e suonano per 0,52
          secondi, con una sovrapposizione di 0,02 secondi. Ogni ornamento divide un movimento in
          tre note uguali — nota, grado superiore, nota — distanziate di circa 0,167 secondi e
          indicate come terzina di crome. Anche queste note si sovrappongono di 0,02 secondi. La
          nota finale suona per 0,75 secondi, seguita da 0,25 secondi prima della conclusione
          dell’esecuzione.
        </p>
        <p>
          Il timbro Ronzio unisce una melodia generata con un’onda triangolare a un ronzio
          sintetizzato. Il vibrato fa oscillare l’altezza della melodia sei volte al secondo (6 Hz),
          fino a 22 cent sopra e sotto la nota centrale. Un cent è un centesimo di semitono: ±22
          cent indica quindi un’escursione totale di 44 cent. Non è una variazione di volume.
          Pentagramma e frequenze mostrano l’altezza centrale, senza inseguire questa oscillazione.
        </p>
        <p>
          Le salite sono più marcate e i ritorni più delicati. Il crescendo aureo aumenta
          gradualmente il volume fino al 61,8% della durata, circa{' '}
          {format(totalDuration * GOLDEN_PEAK)} secondi, poi lo riduce fino alla fine. La tabella
          riporta le note di base delle api; durante gli ornamenti il pentagramma mostra anche il
          grado superiore.
        </p>
        <div className="music-notes-scroll">
          <table className="music-notes">
            <caption>Le note assegnate alle api a partire dalla nota scelta.</caption>
            <thead>
              <tr>
                <th>Ape</th>
                <th>Indice Fibonacci</th>
                <th>Resto / grado (0–6)</th>
                <th>Nota</th>
                <th>Hz</th>
              </tr>
            </thead>
            <tbody>
              {identityRows.map((row) => (
                <tr key={row.identity}>
                  <th scope="row">{row.label}</th>
                  <td>{row.index}</td>
                  <td>{row.degree}</td>
                  <td>{frequencyNote(row.frequency).label}</td>
                  <td>{format(row.frequency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="music-note-explanation">
          Il nome identifica la nota e il numero la sua ottava (Do4 è il Do centrale). Le frequenze
          centrali seguono il temperamento equabile, con La4 = 440 Hz.
        </p>
        <div className="music-step" aria-live="off">
          {step ? (
            <>
              <strong>
                Passo {step.index + 1} / {step.total} · {model.individuals.get(step.identity).label}{' '}
                · gen.
                {step.generation}
              </strong>
              <span>
                {step.direction === 'ancestor'
                  ? 'Verso gli antenati'
                  : step.direction === 'return'
                    ? 'Ritorno verso il maschio iniziale'
                    : step.direction === 'teleport'
                      ? 'Salto al duplicato'
                      : step.direction === 'teleport-return'
                        ? 'Ritorno dal duplicato'
                        : 'Partenza'}{' '}
                ·{' '}
                {step.ornamentPart === 2
                  ? 'grado superiore dell’ornamento'
                  : 'nota di base dell’ape'}
              </span>
              <span>
                {step.direction === 'start'
                  ? `${format(step.frequency)} Hz`
                  : `${format(step.frequency / step.ratio)} Hz × ${format(step.ratio)} = ${format(step.frequency)} Hz`}
              </span>
            </>
          ) : (
            <>
              <strong>
                {score.length} suoni · circa {Math.round(totalDuration)} secondi
              </strong>
              <span>
                Do centrale = Do4. La nota di partenza è {note.label} · {format(note.frequency)} Hz,
                la stessa suonata da Ape 1.
              </span>
            </>
          )}
        </div>
        {step && (
          <p className="music-current-note">
            <strong>Nota suonata: {pitchLabel(step.frequency)}</strong>
          </p>
        )}
      </details>
    </section>
  );
}
