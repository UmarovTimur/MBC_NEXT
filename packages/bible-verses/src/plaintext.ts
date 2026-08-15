import type { ChapterDoc, VerseRecord } from "./types";

const ENTITIES: Record<string, string> = {
  "&#160;": " ",
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (full, code: string) => {
      const n = Number(code);
      return n === 160 ? " " : String.fromCodePoint(n);
    })
    .replace(/&[a-zA-Z]+;/g, (e) => ENTITIES[e] ?? e);
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

/**
 * Tag-free text of a verse — the source of the full-text search index.
 *
 * Excludes `before` blocks: section headings are editorial apparatus, not
 * scripture, and indexing them would make a heading match look like a verse hit.
 *
 * Returns `""` for the 8 verses that carry a marker but no text (Matt 18:11,
 * Mark 9:44, 9:46, 15:28, Luke 17:36, John 5:4, Acts 8:37, 28:29 — omitted in
 * critical-text translations). That is expected, not an error.
 */
export function verseToPlainText(verse: VerseRecord): string {
  const raw = verse.segs.map((s) => s.html).join(" ");
  return decodeEntities(stripTags(raw)).replace(/\s+/g, " ").trim();
}

/** Plain text of a whole chapter, verses only, in reading order. */
export function chapterToPlainText(doc: ChapterDoc): string {
  return doc.verses
    .map(verseToPlainText)
    .filter((t) => t !== "")
    .join(" ");
}
