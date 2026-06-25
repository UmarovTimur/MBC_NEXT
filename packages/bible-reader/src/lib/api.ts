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

export type { RawBibleDoc };
