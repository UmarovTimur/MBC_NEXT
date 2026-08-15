import type { VerseRecord } from "./types";

/**
 * The two forms a verse number takes.
 *
 * `verseMarkerLabel` is what goes back into the chapter markup: the number
 * followed by a non-breaking space, byte-identical to the source corpus. That
 * trailing `&#160;` is what separates the bold verse number from the text, so it
 * belongs to the markup — not to anything a human reads.
 *
 * `verseRefLabel` is the human form used in references like "Çıxış 1:7". It never
 * carries the entity; putting the markup form in front of a reader is how you end
 * up displaying "Çıxış 1:7&#160;".
 */

const NBSP_ENTITY = "&#160;";

export function verseRefLabel(v: number, vEnd?: number): string {
  return vEnd !== undefined && vEnd > v ? `${v}-${vEnd}` : String(v);
}

export function verseMarkerLabel(v: number, vEnd?: number): string {
  return `${verseRefLabel(v, vEnd)}${NBSP_ENTITY}`;
}

export function verseRecordRefLabel(verse: VerseRecord): string {
  return verseRefLabel(verse.v, verse.vEnd);
}

/** True when a marker's raw source text is exactly the canonical form. */
export function isCanonicalMarkerLabel(raw: string, v: number, vEnd: number): boolean {
  return raw === verseMarkerLabel(v, vEnd);
}
