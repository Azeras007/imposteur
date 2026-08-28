/** Minuscules, sans accents, sans ponctuation, espaces normalisés. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diag + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diag = tmp;
    }
  }
  return prev[b.length];
}

/**
 * Le mot proposé par Mr Black est-il le bon ?
 * Tolérant aux fautes de frappe, aux accents et aux articles (« la casserole »).
 */
export function matchesWord(guess: string, target: string): boolean {
  const g = normalize(guess);
  const t = normalize(target);
  if (!g) return false;
  if (g === t) return true;

  const strip = (s: string) => s.replace(/^(le|la|les|l|un|une|des|du|de|d)\s+/, '');
  const gs = strip(g);
  const ts = strip(t);
  if (gs === ts) return true;

  // Tolérance aux fautes de frappe, proportionnelle à la longueur du mot.
  const budget = ts.length >= 8 ? 2 : ts.length >= 5 ? 1 : 0;
  return levenshtein(gs, ts) <= budget;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
