import React from 'react';
export function Navigation({page}) {
  return <nav className="page-nav" aria-label="Pagine del laboratorio">
    <a href="#/" aria-current={page==='fibonacci'?'page':undefined}>Fibonacci</a>
    <a href="#/una-femmina-senza-padre" aria-current={page==='uniparental'?'page':undefined}>Una femmina senza padre</a>
    <a href="#/alleli-e-sesso" aria-current={page==='csd'?'page':undefined}>Alleli e sesso</a>
    <a href="#/genealogia-e-sopravvivenza" aria-current={page==='survival'?'page':undefined}>Eliminazione larvale</a>
  </nav>;
}
