/**
 * Verse-level representation of a chapter.
 *
 * The azb corpus is USFM-derived: verses are NOT nested inside blocks. A verse's
 * text is the run of nodes between two `<span class="verse">` markers, and 41% of
 * verses (12 866 of 31 072) spill across more than one block — up to 11 of them,
 * mostly poetry lines. That is why a verse body is a list of segments rather than
 * a single string: flattening it would destroy the poetic line breaks.
 */

/** One `<div class='X'>…</div>` worth of markup. */
export type Block = {
  /** USFM paragraph class: p, q, s, b, r, li, m, d, qs, pi, sp, mi, s2, mr, nb. */
  cls: string;
  /** Inner HTML of the block, verbatim (minus the verse marker itself). */
  html: string;
};

/**
 * A slice of one verse living inside one block.
 *
 * `newBlock: false` on the FIRST segment means the verse started part-way through
 * a block that the previous verse had already opened — the renderer appends it to
 * the div it just emitted instead of opening a new one.
 */
export type Segment = Block & { newBlock: boolean };

export type VerseRecord = {
  /** Numeric key, from `id="V{n}"`. Always a single integer, ascending, unique. */
  v: number;
  /**
   * Last verse covered by this record. Greater than `v` only for the 30 azb
   * markers that label a merged range (e.g. "16-17" under `id="V16"`), which is
   * what makes 27 chapters look like they skip a number.
   *
   * There is deliberately no stored label: the marker text is exactly
   * `v` (or `v-vEnd`) plus a non-breaking space in all 31 072 verses, so storing
   * it would be a second copy of these two numbers that could drift out of sync.
   * `verseMarkerLabel` reconstitutes it.
   */
  vEnd: number;
  /** Heading/reference blocks (s, s2, r, mr, d, sp) emitted just before this verse. */
  before: Block[];
  /** The verse body, one entry per block it occupies. Never empty. */
  segs: Segment[];
};

export type ChapterDoc = {
  /** Blocks carrying real text before the first verse marker (1186 of 1189 chapters have none). */
  preamble: Block[];
  verses: VerseRecord[];
};

export type RenderOptions = {
  /**
   * Wrap each verse segment in `<span class="v" data-v="n">` so the frontend has
   * something to highlight. Off by default because the round-trip check needs
   * byte-comparable output against the original chapter HTML.
   */
  wrapVerses?: boolean;
};
