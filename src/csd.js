// A, B and C denote functionally distinct csd alleles, not whole chromosomes.
export function csdSex(alleles) {
  if (
    !Array.isArray(alleles) ||
    ![1, 2].includes(alleles.length) ||
    !alleles.every((a) => typeof a === 'string' && a.length > 0)
  )
    throw new TypeError('Servono uno o due alleli identificati.')
  return alleles.length === 1 || alleles[0] === alleles[1] ? 'M' : 'F'
}
export function csdCross(mother = ['A', 'B'], father = 'A') {
  if (
    csdSex(mother) !== 'F' ||
    mother.length !== 2 ||
    typeof father !== 'string' ||
    !father
  )
    throw new TypeError(
      'La madre deve avere due alleli distinti e il padre un allele.',
    )
  return mother.map((allele, i) => ({
    id: `esito-${i}`,
    alleles: [allele, father],
    sex: csdSex([allele, father]),
    ploidy: 2,
    probability: 0.5,
    parents: ['madre', 'padre'],
  }))
}
