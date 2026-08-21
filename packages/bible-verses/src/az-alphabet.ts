/**
 * The 32 letters of the Azerbaijani Latin alphabet, in dictionary order.
 *
 * Distinct from ASCII order in several places Postgres's default (`C`) collation
 * gets wrong: `Ç` sorts right after `C`, `Ə` right after `E`, `Ğ` after `G`, `İ`
 * (dotted) sorts after `I` (dotless) — the reverse of Unicode codepoint order —
 * and `Ö`, `Ş`, `Ü` sort after `O`, `S`, `U` respectively rather than at the very
 * end where a plain `ORDER BY word` would put them.
 */
export const AZ_ALPHABET: readonly string[] = [
  "a", "b", "c", "ç", "d", "e", "ə", "f", "g", "ğ", "h", "x", "ı", "i", "j", "k",
  "q", "l", "m", "n", "o", "ö", "p", "r", "s", "ş", "t", "u", "ü", "v", "y", "z",
];

const LETTER_INDEX = new Map<string, number>(AZ_ALPHABET.map((letter, i) => [letter, i]));

/**
 * Orders two words the way an Azerbaijani dictionary would, using
 * {@link AZ_ALPHABET} instead of Postgres/JS default collation (which sorts by
 * Unicode codepoint and gets the letters above wrong). Characters outside the
 * alphabet (digits, punctuation) fall back to codepoint order and sort after
 * every known letter.
 */
export function compareAzWords(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const ca = a[i]!;
    const cb = b[i]!;
    if (ca === cb) continue;
    const ia = LETTER_INDEX.get(ca);
    const ib = LETTER_INDEX.get(cb);
    if (ia !== undefined && ib !== undefined) return ia - ib;
    if (ia !== undefined) return -1;
    if (ib !== undefined) return 1;
    return ca < cb ? -1 : 1;
  }
  return a.length - b.length;
}
