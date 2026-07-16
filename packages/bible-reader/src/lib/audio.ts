/**
 * Per-chapter audio recordings. Files live outside git (~5.2 GB) and are served
 * straight from `apps/az/public/audio/`, so the browser gets Range requests
 * (seeking) for free — see scripts/move-az-audio.sh and scripts/rsync-az-audio.sh.
 */

/** Bible keys that have a recording for every chapter. */
const AUDIO_BIBLES = new Set(["azb"]);

/**
 * Where the recordings are served from. Overridable so the files can move to a
 * CDN/subdomain later without touching this code.
 */
const AUDIO_BASE = process.env.NEXT_PUBLIC_AUDIO_BASE_PATH ?? "/audio";

export function hasChapterAudio(bibleKey: string): boolean {
  return AUDIO_BIBLES.has(bibleKey);
}

/**
 * Recordings follow the same padding as the chapter HTML: two digits, or three
 * for books with 100+ chapters (19 - Zəbur → 001.mp3 … 150.mp3). Books with
 * fewer than ten chapters still pad to two (Amos → 09.mp3), hence the min of 2.
 */
export function chapterAudioFileName(chapterId: string, maxChapterId: number): string {
  const width = Math.max(2, String(maxChapterId).length);
  return `${chapterId.padStart(width, "0")}.mp3`;
}

export function buildChapterAudioUrl(
  bibleKey: string,
  bookId: string,
  chapterId: string,
  maxChapterId: number,
): string {
  return `${AUDIO_BASE}/${bibleKey}/${bookId}/${chapterAudioFileName(chapterId, maxChapterId)}`;
}
