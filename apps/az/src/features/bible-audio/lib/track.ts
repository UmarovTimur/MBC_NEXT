import type { BibleManifest, Chapter } from "@/entities/bible";
import { formatChapterName, resolveChapterAudioUrl } from "@/entities/bible";

/** One chapter recording — the same shape as a chapter route's params. */
export type AudioTrack = Chapter;

type ManifestBible = BibleManifest["bibles"][number];
type ManifestBook = ManifestBible["books"][number];

export type ResolvedTrack = {
  bible: ManifestBible;
  book: ManifestBook;
  url: string;
  bookName: string;
  chapterName: string;
};

/** Book ids 01–39 are the Old Testament. */
const OT_MAX = 39;

export function isOldTestament(bookId: string): boolean {
  return Number(bookId) <= OT_MAX;
}

export function sameTrack(a: AudioTrack | null, b: AudioTrack | null): boolean {
  return !!a && !!b && a.bible === b.bible && a.bookId === b.bookId && a.chapterId === b.chapterId;
}

/** The chapter page a track belongs to. */
export function trackHref(track: AudioTrack): string {
  return `/${track.bible}/${track.bookId}/${track.chapterId}`;
}

/** Whether `pathname` is `track`'s chapter page; tolerates the trailing slash (`trailingSlash: true`). */
export function isTrackPage(pathname: string, track: AudioTrack): boolean {
  return pathname.replace(/\/$/, "") === trackHref(track);
}

export function resolveTrack(manifest: BibleManifest, track: AudioTrack): ResolvedTrack | null {
  const bible = manifest.bibles.find((b) => b.bibleName === track.bible);
  const book = bible?.books.find((b) => b.id === track.bookId);
  if (!bible || !book) return null;

  const url = resolveChapterAudioUrl(bible.bibleName, book.id, book.chapters, track.chapterId);
  if (!url) return null;

  return {
    bible,
    book,
    url,
    bookName: book.name,
    chapterName: formatChapterName(bible.chapterNaming, track.chapterId),
  };
}

/**
 * The chapter before/after `track`, crossing into the neighbouring book at the
 * edges so a whole Testament can be listened to without touching the player.
 */
export function adjacentTrack(
  manifest: BibleManifest,
  track: AudioTrack,
  direction: 1 | -1,
): AudioTrack | null {
  const bible = manifest.bibles.find((b) => b.bibleName === track.bible);
  if (!bible) return null;

  const bookIndex = bible.books.findIndex((b) => b.id === track.bookId);
  const book = bible.books[bookIndex];
  if (!book) return null;

  const chapterIndex = book.chapters.indexOf(track.chapterId);
  const sibling = book.chapters[chapterIndex + direction];
  if (chapterIndex !== -1 && sibling !== undefined) {
    return { bible: track.bible, bookId: book.id, chapterId: sibling };
  }

  const nextBook = bible.books[bookIndex + direction];
  if (!nextBook || nextBook.chapters.length === 0) return null;
  const chapterId = direction === 1 ? nextBook.chapters[0] : nextBook.chapters[nextBook.chapters.length - 1];
  return { bible: track.bible, bookId: nextBook.id, chapterId };
}
