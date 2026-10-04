import React from 'react';
export function Navigation({page}) {
  return <nav className="page-nav" aria-label="Pagine del laboratorio">
    <a href="#/" aria-current={page==='fibonacci'?'page':undefined}>Fibonacci</a>
    <a href="#/una-femmina-senza-padre" aria-current={page==='uniparental'?'page':undefined}>Una femmina senza padre</a>
    <a href="#/alleli-e-sesso" aria-current={page==='csd'?'page':undefined}>Alleli e sesso</a>
    <a href="#/scenari-genealogici" aria-current={page==='scenarios'?'page':undefined}>Fibonacci e diploidia</a>
    <a href="#/genealogia-e-sopravvivenza" aria-current={page==='survival'?'page':undefined}>Eliminazione larvale</a>
    <a href="#/spirale-aurea" aria-current={page==='spiral'?'page':undefined}>Fibonacci e spirale</a>
    <a href="#/poliandria" aria-current={page==='polyandry'?'page':undefined}>Poliandria</a>
  </nav>;
}

