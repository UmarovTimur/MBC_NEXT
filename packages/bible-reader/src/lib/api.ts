import { BibleConfig, BookName } from "../config";

export type ChapterRef = {
  /** Numeric id of the related `bibles` doc (relationship field, depth=0). */
  bible: number;
  bookNumber: string;
  chapterId: string;
};

export type BibleFetchOptions = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

type PayloadListResponse<T> = {
  docs: T[];
};

type RawBibleDoc = {
  id: number;
  bibleKey: string;
  displayName?: string | null;
  primary: string;
  secondary?: string[] | null;
  attachment?: number | { id: number } | null;
  defaultView: BibleConfig["defaultView"];
  chapterSlug?: string | null;
  mappingChapterSlug?: string[] | null;
  formattingStyle?: string | null;
  introductionName?: string | null;
  isIndependent?: boolean | null;
  isCommentary?: boolean | null;
  storageMode?: BibleConfig["storageMode"] | null;
};

type RawBookNameDoc = {
  bookId: string;
  name: string;
  shortName?: string | null;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

/**
 * Fetch every Bible/corpus config for a locale (replaces the static
 * BIBLES_CONFIG JSON files). Returns the raw docs so the caller can resolve
 * `attachment` ids to bible keys once it has the full set.
 */
export async function fetchBibleDocs(
  baseUrl: string,
  locale: string,
  fetchOptions?: BibleFetchOptions,
): Promise<RawBibleDoc[]> {
  const url =
    `${normalizeBaseUrl(baseUrl)}/api/bibles` +
    `?where[locale][equals]=${encodeURIComponent(locale)}` +
    `&limit=0&depth=0`;

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    throw new Error(`Bibles fetch failed (${locale}): ${res.status}`);
  }
  const data: PayloadListResponse<RawBibleDoc> = await res.json();
  return data.docs;
}

/**
 * Fetch the canonical book names for a locale (shared by every bible of that
 * locale), keyed by their zero-padded book id.
 */
export async function fetchBookNames(
  baseUrl: string,
  locale: string,
  fetchOptions?: BibleFetchOptions,
): Promise<Map<string, BookName>> {
  const url =
    `${normalizeBaseUrl(baseUrl)}/api/bible-books` +
    `?where[locale][equals]=${encodeURIComponent(locale)}` +
    `&limit=0&depth=0` +
    `&select[bookId]=true&select[name]=true&select[shortName]=true`;

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    throw new Error(`Bible books fetch failed (${locale}): ${res.status}`);
  }
  const data: PayloadListResponse<RawBookNameDoc> = await res.json();

  const map = new Map<string, BookName>();
  for (const doc of data.docs) {
    map.set(doc.bookId, { name: doc.name, shortName: doc.shortName ?? undefined });
  }
  return map;
}

/**
 * Fetch the lightweight chapter manifest (ids only) for a locale. Used once at
 * startup/build to build the in-memory book/chapter tree.
 */
export async function fetchChapterRefs(
  baseUrl: string,
  locale: string,
  fetchOptions?: BibleFetchOptions,
): Promise<ChapterRef[]> {
  const url =
    `${normalizeBaseUrl(baseUrl)}/api/bible-chapters` +
    `?where[locale][equals]=${encodeURIComponent(locale)}` +
    `&limit=0&depth=0` +
    `&select[bible]=true&select[bookNumber]=true&select[chapterId]=true`;

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    throw new Error(`Bible chapters manifest fetch failed (${locale}): ${res.status}`);
  }
  const data: PayloadListResponse<ChapterRef> = await res.json();
  return data.docs;
}

/**
 * Fetch a single chapter's raw HTML from the database via the Payload REST API.
 * Filters through the `bible` relationship by its stable key (dot-notation),
 * so callers never need to know the bible's numeric id.
 */
export async function fetchChapterHtml(
  baseUrl: string,
  bibleKey: string,
  bookNumber: string,
  chapterId: string,
  fetchOptions?: BibleFetchOptions,
): Promise<string | null> {
  const url =
    `${normalizeBaseUrl(baseUrl)}/api/bible-chapters` +
    `?where[bible.bibleKey][equals]=${encodeURIComponent(bibleKey)}` +
    `&where[bookNumber][equals]=${encodeURIComponent(bookNumber)}` +
    `&where[chapterId][equals]=${encodeURIComponent(chapterId)}` +
    `&limit=1&depth=0&select[html]=true`;

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    throw new Error(`Bible chapter fetch failed (${bibleKey}/${bookNumber}/${chapterId}): ${res.status}`);
  }
  const data: PayloadListResponse<{ html?: string }> = await res.json();
  return data.docs[0]?.html ?? null;
}

/**
 * Chapter HTML for a verse-mode bible, assembled server-side from its verse rows.
 *
 * Assembling on the API side rather than fetching verses and joining them here
 * keeps `ChapterContentLoader` — and therefore BibleViewer and BibleContent —
 * completely unchanged, and avoids shipping 176 JSON rows for a chapter like
 * Psalm 119 when the assembled HTML is a fraction of the size.
 */
export async function fetchAssembledChapterHtml(
  baseUrl: string,
  bibleKey: string,
  bookNumber: string,
  chapterId: string,
  fetchOptions?: BibleFetchOptions,
): Promise<string | null> {
  const url =
    `${normalizeBaseUrl(baseUrl)}/api/bible-chapters/assembled` +
    `?bible=${encodeURIComponent(bibleKey)}` +
    `&book=${encodeURIComponent(bookNumber)}` +
    `&chapter=${encodeURIComponent(chapterId)}`;

  const res = await fetch(url, fetchOptions);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(
      `Assembled chapter fetch failed (${bibleKey}/${bookNumber}/${chapterId}): ${res.status}`,
    );
  }
  const data: { html?: string } = await res.json();
  return data.html ?? null;
}

/** Full-text search over verses. Returns raw book/chapter numbers; the caller names them. */
export async function searchVerses(
  baseUrl: string,
  bibleKey: string,
  query: string,
  options?: {
    book?: string;
    testament?: "ot" | "nt";
    /** Whole-word match only, no typo-tolerant trigram fallback. */
    exact?: boolean;
    limit?: number;
    page?: number;
    fetchOptions?: BibleFetchOptions;
  },
): Promise<VerseSearchResponse> {
  const params = new URLSearchParams({ q: query, bible: bibleKey });
  if (options?.book) params.set("book", options.book);
  if (options?.testament) params.set("testament", options.testament);
  if (options?.exact) params.set("exact", "1");
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.page) params.set("page", String(options.page));

  const url = `${normalizeBaseUrl(baseUrl)}/api/bible-verses/search?${params.toString()}`;
  const res = await fetch(url, options?.fetchOptions);
  if (!res.ok) throw new Error(`Verse search failed: ${res.status}`);
  return res.json();
}

export type VerseSearchHit = {
  bookNumber: string;
  chapterNumber: string;
  verseNumber: number;
  /** Last verse of a merged range; equals verseNumber otherwise. */
  verseEnd: number;
  plainText: string;
};

export type VerseSearchResponse = {
  total: number;
  page: number;
  limit: number;
  results: VerseSearchHit[];
};

/** Symphony (concordance) index: word count per letter. */
export async function getWordLetters(
  baseUrl: string,
  bibleKey: string,
  fetchOptions?: BibleFetchOptions,
): Promise<WordLettersResponse> {
  const url =
    `${normalizeBaseUrl(baseUrl)}/api/bible-verses/words?bible=${encodeURIComponent(bibleKey)}`;
  const res = await fetch(url, fetchOptions);
  if (!res.ok) throw new Error(`Word letters fetch failed: ${res.status}`);
  return res.json();
}

/** Symphony word list for one letter. */
export async function getWordsForLetter(
  baseUrl: string,
  bibleKey: string,
  letter: string,
  fetchOptions?: BibleFetchOptions,
): Promise<WordsByLetterResponse> {
  const params = new URLSearchParams({ bible: bibleKey, letter });
  const url = `${normalizeBaseUrl(baseUrl)}/api/bible-verses/words-by-letter?${params.toString()}`;
  const res = await fetch(url, fetchOptions);
  if (!res.ok) throw new Error(`Words-by-letter fetch failed: ${res.status}`);
  return res.json();
}

export type WordLettersResponse = {
  letters: { letter: string; wordCount: number }[];
};

export type WordsByLetterResponse = {
  letter: string;
  total: number;
  words: { word: string; count: number }[];
};

export type { RawBibleDoc };
