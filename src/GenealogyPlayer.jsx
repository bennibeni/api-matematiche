import React, { useEffect, useRef, useState } from 'react'
import {
  depthFirstScore,
  frequencyNote,
  startingNotes,
} from './genealogyMusic.js'
import MusicStaff from './MusicStaff.jsx'
import { scheduleBeeNote } from './beeTimbre.js'

const format = (value) =>
  value.toLocaleString('it-IT', { maximumFractionDigits: 2 })
const pitchLabel = (frequency) => {
  const pitch = frequencyNote(frequency)
  return `${pitch.label}${pitch.cents === 0 ? ' · 0 cent' : ` ${pitch.cents > 0 ? '+' : '−'}${format(Math.abs(pitch.cents))} cent`}`
}

export default function GenealogyPlayer({
  model,
  onStep,
  selectedIdentity = null,
}) {
  const [noteIndex, setNoteIndex] = useState(0)
  const [timbre, setTimbre] = useState('swarm')
  const [teleportTwins, setTeleportTwins] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(null)
  const [message, setMessage] = useState(
    'Partiamo da Ape 1, gen.0. Prima il ramo della madre, poi quello del padre, quando presente.',
  )
  const audio = useRef(null)
  const frame = useRef(null)
  const run = useRef(0)
  const note = startingNotes[noteIndex]
  const score = depthFirstScore(model, note.frequency, selectedIdentity, teleportTwins)

  function release() {
    run.current++
    cancelAnimationFrame(frame.current)
    frame.current = null
    const context = audio.current
    audio.current = null
    if (context && context.state !== 'closed')
      void context.close().catch(() => {})
  }
  useEffect(() => () => release(), [])
  useEffect(() => {
    release()
    setPlaying(false)
    setStep(null)
    onStep(null)
    setMessage('Percorso aggiornato. Avvia l’ascolto per esplorarlo.')
  }, [model, selectedIdentity, teleportTwins])

  function stop() {
    release()
    setPlaying(false)
    setStep(null)
    onStep(null)
    setMessage('Ascolto interrotto. Riparti dal maschio iniziale quando vuoi.')
  }

  async function play() {
    release()
    const token = run.current
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) {
      setMessage('Questo browser non supporta la riproduzione audio.')
      return
    }
    try {
      const context = new AudioContext()
      audio.current = context
      await context.resume()
      if (token !== run.current) return
      const start = context.currentTime + 0.08
      const duration = 0.5
      const master = context.createGain()
      master.gain.value = 0.12
      master.connect(context.destination)
      score.forEach((event, index) =>
        scheduleBeeNote(
          context,
          master,
          event.frequency,
          start + index * duration,
          timbre,
        ),
      )
      setPlaying(true)
      setMessage(
        'Visita in profondità in corso: ogni collegamento viene percorso all’andata e al ritorno.',
      )
      let lastIndex = -1
      function update() {
        if (token !== run.current) return
        const index = Math.floor((context.currentTime - start) / duration)
        if (index >= score.length) {
          release()
          setPlaying(false)
          setStep(null)
          onStep(null)
          setMessage(
            'Percorso concluso: siamo tornati ad Ape 1 e alla frequenza iniziale.',
          )
          return
        }
        if (index >= 0 && index !== lastIndex) {
          lastIndex = index
          const current = { ...score[index], index, total: score.length }
          setStep(current)
          onStep(current)
        }
        frame.current = requestAnimationFrame(update)
      }
      frame.current = requestAnimationFrame(update)
    } catch {
      if (token !== run.current) return
      release()
      setPlaying(false)
      setStep(null)
      onStep(null)
      setMessage(
        'Audio non disponibile. Puoi continuare a esplorare le api nel disegno.',
      )
    }
  }

  return (
    <section
      className="genealogy-player"
      aria-labelledby="genealogy-player-title"
    >
      <h3 id="genealogy-player-title">
        Percorriamo la genealogia, ascoltando i rapporti
      </h3>
      <p>
        <strong>Fibonacci ci offre un ponte fra genealogia e musica.</strong> I
        numeri 1, 1, 2, 3, 5, 8, 13 emergono dalle regole genealogiche;
        scegliamo di usarne i rapporti per costruire gli intervalli del brano.
      </p>
      <p>
        {selectedIdentity === null
          ? 'Nessuna ape selezionata: suoniamo l’intera genealogia.'
          : 'Hai scelto ' +
            model.individuals.get(selectedIdentity).label +
            ': suoniamo i percorsi che passano da questa ape, dai collegamenti con il maschio iniziale fino ai suoi antenati.'}{' '}
        La visita segue ogni ramo in profondità e suona anche i ritorni.
      </p>
      <label className="prominent-check">
        <input type="checkbox" checked={teleportTwins} disabled={playing}
          onChange={event => setTeleportTwins(event.target.checked)} />
        Teletrasporto tra gemelli
      </label>
      <p>Chiamiamo gemelli due nodi che rappresentano la stessa ape. Con il
        teletrasporto attivo, all’arrivo saltiamo al gemello, esploriamo tutti
        i suoi rami e torniamo al nodo originale per proseguire anche i suoi.
        Ogni salto alza la melodia di una quinta giusta (7 semitoni), per tutta
        l’escursione. Al ritorno si ripristina il registro precedente. Le
        quinte dei salti annidati si sommano. I ritorni non avviano nuovi salti.</p>
      <div className="music-timbre-choice">
        <label className="starting-note">
          Timbro
          <select
            value={timbre}
            disabled={playing}
            onChange={(event) => setTimbre(event.target.value)}
          >
            <option value="swarm">Ronzio</option>
            <option value="pure">Tono puro</option>
          </select>
        </label>
        <span>
          Ronzio accompagna ogni nota con un suono di volo; Tono puro permette di confrontare le sole altezze.
        </span>
      </div>
      <div className="shared-actions">
        <label className="starting-note">
          Nota di partenza
          <select
            value={noteIndex}
            disabled={playing}
            onChange={(event) => setNoteIndex(Number(event.target.value))}
          >
            {startingNotes.map((item, index) => (
              <option value={index} key={item.midi}>
                {item.label} · {format(item.frequency)} Hz
              </option>
            ))}
          </select>
        </label>
        <button onClick={play} disabled={playing}>
          Avvia il percorso musicale
        </button>
        <button onClick={stop} disabled={!playing}>
          Interrompi
        </button>
      </div>
      <MusicStaff score={score} index={step?.index ?? null} />
      {step && (
        <p className="music-current-note">
          <strong>Nota suonata: {pitchLabel(step.frequency)}</strong>
        </p>
      )}
      <details className="music-details">
        <summary>Note, frequenze e dettagli dell’esperimento</summary>
        <p>
          “Ronzio” combina una nota pura con un ronzio grave e
          irregolare, che si accende e si spegne insieme alla nota. Il ronzio
          mantiene il suo registro mentre la melodia segue Fibonacci: le
          frequenze mostrate si riferiscono alla nota, non alla texture.
          Il suono dura 0,36 secondi, seguito da 0,14 secondi di pausa.
          Il ronzio è sintetizzato.
          Il tono puro conserva 0,3 secondi di suono e 0,2 di pausa.
        </p>
        <div className="music-notes-scroll">
          <table className="music-notes">
            <caption>
              Le note delle generazioni senza trasposizione · riferimento: temperamento equabile,
              La4 = 440 Hz
            </caption>
            <thead>
              <tr>
                <th scope="col">Generazione</th>
                {model.counts.map((value, generation) => (
                  <th scope="col" key={generation}>
                    gen.{generation}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Numero assegnato</th>
                {model.counts.map((value, generation) => (
                  <td key={generation}>{value}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Nota più vicina</th>
                {model.counts.map((value, generation) => (
                  <td key={generation}>
                    <strong>
                      {frequencyNote(note.frequency * value).label}
                    </strong>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Scarto (cent)</th>
                {model.counts.map((value, generation) => {
                  const cents = frequencyNote(note.frequency * value).cents
                  return (
                    <td key={generation}>
                      {cents > 0 ? '+' : cents < 0 ? '−' : ''}
                      {format(Math.abs(cents))}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <th scope="row">Frequenza (Hz)</th>
                {model.counts.map((value, generation) => (
                  <td key={generation}>{format(note.frequency * value)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="music-note-explanation">
          Il nome indica la nota più vicina del pianoforte; il numero indica
          l’ottava (Do4 è il Do centrale). Un cent è un centesimo di semitono:
          “+” significa più acuto, “−” più grave, 0 coincide con la nota di
          riferimento. Suoniamo le frequenze dei rapporti, senza correggere
          questi scarti.
        </p>
        <p role="status">{message}</p>
        <div className="music-step" aria-live="off">
          {step ? (
            <>
              <strong>
                Passo {step.index + 1} / {step.total} ·{' '}
                {model.individuals.get(step.identity).label} · gen.
                {step.generation}
              </strong>
              <span>
                {step.direction === 'ancestor'
                  ? 'Verso gli antenati'
                  : step.direction === 'return'
                    ? 'Ritorno verso il maschio iniziale'
                    : step.direction === 'teleport'
                      ? 'Teletrasporto al gemello · +7 semitoni'
                      : step.direction === 'teleport-return'
                        ? 'Ritorno dal gemello · −7 semitoni'
                        : 'Partenza'}{' '}
                · numero {step.value} · trasposizione attuale +{step.transposeSemitones} semitoni
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
                {score.length} suoni · circa {Math.round(score.length / 2)}{' '}
                secondi
              </strong>
              <span>
                Do centrale = Do4. La nota iniziale predefinita è Do2, due ottave
                più in basso.
              </span>
            </>
          )}
        </div>
        {step && (
          <p className="music-current-note">
            <strong>Nota suonata: {pitchLabel(step.frequency)}</strong>
          </p>
        )}

        <details>
          <summary>
            Rapporti di frequenza e semitoni sono due regole diverse
          </summary>
          <p>
            Qui usiamo f(arrivo) = f(partenza) × numero(arrivo) /
            numero(partenza). Da 2 a 3 il rapporto è 3/2; al ritorno è 2/3. I
            fattori si semplificano lungo il percorso: in questa versione
            f(gen.g) = f(iniziale) × numero(gen.g) × 2^(s/12), dove s è
            la trasposizione accumulata nei salti al gemello ancora aperti.
            Ogni salto aggiunge 7 semitoni; il suo ritorno ripristina il valore
            precedente. Il buzz mantiene il proprio registro.
          </p>
          <p>
            Un intervallo di s semitoni nel temperamento equabile usa invece il
            rapporto 2^(s/12). Per esempio 3 semitoni danno circa 1,189, mentre
            il rapporto 3/2 corrisponde a circa 7,02 semitoni. La tua proposta
            di usare 2, 3, 5, 8 e 13 semitoni potrà diventare una modalità
            distinta.
          </p>
          <p>
            Scegliere la nota iniziale trasporta l’intero brano; non imposta
            ancora una tonalità maggiore o minore. Le altre frequenze non
            vengono arrotondate ai tasti del pianoforte. Con questi numeri per
            generazione, il teletrasporto aggiunge escursioni nei rami condivisi trasposte di una quinta. Disattivalo per ascoltare il percorso originale.
          </p>
        </details>
      </details>
      {playing && step && (
        <div
          className="music-transport"
          aria-label="Controlli durante l’ascolto"
        >
          <MusicStaff score={score} index={step.index} compact />
          <span>{pitchLabel(step.frequency)}
            {step.direction === 'teleport' && ' · Salto al gemello: +7 semitoni'}
            {step.direction === 'teleport-return' && ' · Ritorno dal gemello: −7 semitoni'}
          </span>
          <button onClick={stop}>Ferma l’ascolto</button>
        </div>
      )}
    </section>
  )
}
