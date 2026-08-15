/**
 * Structural vocabulary of the azb corpus, measured across all 1189 chapters.
 * Counts are from the survey that justified this package; they are documentation,
 * not assertions — a future corpus may shift them.
 */

/** Block-level classes seen on `<div>`: q 23077, p 5567, s 2188, b 1960, r 534, … */
export const ALLOWED_BLOCK_CLASSES = [
  "p",
  "q",
  "s",
  "s2",
  "b",
  "r",
  "mr",
  "li",
  "m",
  "mi",
  "d",
  "qs",
  "pi",
  "sp",
  "nb",
] as const;

/**
 * Classes allowed on inline `<span>` inside a block. `sc` (small caps) occurs
 * exactly once in the corpus, inside a heading in `apps/az/html/azb/12/14.html` —
 * it is inline, NOT a block, and a parser that treats it as one corrupts that file.
 */
export const ALLOWED_INLINE_CLASSES = ["sc", "verse", "v"] as const;

/**
 * Blocks that carry apparatus rather than scripture: section headings, parallel
 * references, psalm descriptions, speaker labels. These get attached to the
 * FOLLOWING verse when they sit on a verse boundary (2379 times in azb) and stay
 * with the current verse when they interrupt one (10 times, mostly `sp` in Song of
 * Songs). `b` is a blank spacer and travels with them.
 */
export const STRUCTURAL_CLASSES = new Set<string>([
  "s",
  "s2",
  "r",
  "mr",
  "d",
  "sp",
  "b",
  "qs",
]);

export type BlockClass = (typeof ALLOWED_BLOCK_CLASSES)[number];

const BLOCK_CLASS_SET = new Set<string>(ALLOWED_BLOCK_CLASSES);

export function isAllowedBlockClass(cls: string): boolean {
  return BLOCK_CLASS_SET.has(cls);
}
