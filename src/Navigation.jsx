import React from 'react'
import { journey, pageLabel } from './pages.js'
export function Navigation({ page }) {
  return (
    <nav className="page-nav" aria-label="Pagine del laboratorio">
      {journey.map(([id, href, label]) => (
        <a key={id} href={href} aria-current={page === id ? 'page' : undefined}>
          {label}
        </a>
      ))}
    </nav>
  )
}
export function PageHeadingLabel({ page }) {
  return <p className="page-heading-label">{pageLabel(page)}</p>
}
export function PageJourney({ page }) {
  const i = journey.findIndex((p) => p[0] === page),
    previous = journey[i - 1],
    next = journey[i + 1]
  return (
    <nav className="page-journey" aria-label="Continua il percorso">
      {previous ? <a href={previous[1]}>← {previous[2]}</a> : <span />}
      {next ? (
        <a href={next[1]}>{next[2]} →</a>
      ) : (
        <a href="#/">Torna alla genealogia standard ↺</a>
      )}
    </nav>
  )
}
