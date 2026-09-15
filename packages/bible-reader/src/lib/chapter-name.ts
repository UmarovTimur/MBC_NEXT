import { formatOrdinal } from "./ordinal";

/**
 * What a corpus calls its chapters. Plain data so it can ride along in the
 * client manifest: the audio player labels chapters in the browser and must
 * agree with the titles the server renders.
 */
export type ChapterNaming = {
  /** Drives the ordinal suffix; undefined = no ordinals. */
  locale?: string;
  /** The chapter noun alone ("fəsil"); the ordinal suffix is computed per chapter. */
  slug: string;
  mapping?: string[];
  introducingName?: string;
};

/** "3-cü fəsil", an explicit per-chapter name, or the intro name for chapter "0". */
export function formatChapterName(naming: ChapterNaming, chapterId: string): string {
  // An explicit name wins, but only per chapter: the arrays in the DB are
  // shorter than the books they cover (29 entries vs 150 psalms), so a missing
  // entry has to fall through to the computed form instead of rendering blank.
  const explicit = naming.mapping?.[Number(chapterId)];
  if (explicit) return explicit;
  if (chapterId === "0") return naming.introducingName ?? "0";

  const ordinal = formatOrdinal(Number(chapterId), naming.locale);
  // Non-breaking space keeps "3-cü fəsil" from wrapping apart.
  return `${ordinal}\u00A0${naming.slug}`.trim();
}
