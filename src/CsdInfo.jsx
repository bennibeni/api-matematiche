import React, { useId, useRef } from 'react'
export function CsdInfo() {
  const dialog = useRef(null),
    titleId = useId()
  return (
    <>
      <button
        type="button"
        className="info-button inline-info"
        aria-label="Che cos’è un allele csd?"
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
      <dialog
        ref={dialog}
        className="rule-dialog csd-info-dialog"
        aria-labelledby={titleId}
      >
        <div className="dialog-heading">
          <p className="eyebrow">GENETICA / LE PAROLE CHIAVE</p>
          <button
            className="close-info"
            aria-label="Chiudi approfondimento"
            onClick={() => dialog.current.close()}
          >
            ×
          </button>
        </div>
        <h2 id={titleId}>
          Che cos’è un allele <em>csd</em>?
        </h2>
        <div className="dialog-copy">
          <p>
            Un <strong>gene</strong> è un tratto di DNA. Un{' '}
            <strong>allele</strong> è una sua versione: lo stesso gene può
            esistere in forme diverse nella popolazione.
          </p>
          <p>
            <strong>
              <em>csd</em>
            </strong>{' '}
            significa <em>complementary sex determiner</em>, cioè «determinante
            complementare del sesso». Nell’ape mellifera questo gene fornisce un
            segnale iniziale per lo sviluppo sessuale.
          </p>
          <div className="info-example">
            Il gene è <em>csd</em>.<br />
            A, B e C sono nomi simbolici per tre suoi alleli.
            <br />
            <span>
              Indicano versioni funzionalmente diverse, non cromosomi interi.
            </span>
          </div>
          <p>
            Nel nostro modello, un individuo aploide possiede una sola copia del
            gene. Un individuo diploide nato da fecondazione ne possiede due:
            una ereditata dalla madre e una dal padre.
          </p>
          <ul>
            <li>
              <strong>A</strong>: una copia → maschio aploide.
            </li>
            <li>
              <strong>A/A</strong>: due alleli uguali → maschio diploide.
            </li>
            <li>
              <strong>A/B</strong>: due alleli diversi → femmina diploide.
            </li>
          </ul>
          <p>
            A/B si legge «due versioni del gene <em>csd</em>», non «due geni
            diversi». Due copie uguali possono essere ereditate dai genitori
            senza che si verifichi una nuova mutazione.
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
        </div>
        <form method="dialog">
          <button className="understood">Ho capito</button>
        </form>
      </dialog>
    </>
  )
}
