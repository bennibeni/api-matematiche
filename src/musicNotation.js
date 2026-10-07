// Keep each three-note ornament on the same staff page.
export function staffPage(score, index = null) {
  const target = index ?? 0;
  let first = 0;
  while (first < score.length) {
    let end = first;
    while (end < score.length) {
      const size = score[end].ornamentPart === 1 ? 3 : 1;
      if (end + size - first > 8) break;
      end += size;
    }
    if (target < end) return { first, notes: score.slice(first, end) };
    first = end;
  }
  return { first: 0, notes: [] };
}
