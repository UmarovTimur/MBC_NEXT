import "server-only";
import { searchVerses, type VerseSearchHit } from "@mbc/bible-reader/server";
import { bibleManager } from "@/entities/bible/server";
import type { SearchResultItem } from "../ui/SearchResultRow";

/**
 * Batch size for both the initial SSR page and every subsequent client fetch,
 * so `total / SEARCH_PAGE_SIZE` pages line up on both ends.
 */
export const SEARCH_PAGE_SIZE = 50;

export const BIBLE_KEY = "azb";
export const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL ?? "http://localhost:8001";

function toResultItem(hit: VerseSearchHit): SearchResultItem {
  const bible = bibleManager.getBible(BIBLE_KEY);
  return {
    ...hit,
    // Book naming lives in the manifest the reader already holds, so the search
    // endpoint returns raw numbers and does not duplicate it.
    bookName: bible.getShortBookName(Number(hit.bookNumber)),
    href: `/${BIBLE_KEY}/${hit.bookNumber}/${hit.chapterNumber}/#V${hit.verseNumber}`,
  };
}

export async function fetchSearchPage(query: string, page: number) {
  const response = await searchVerses(PAYLOAD_API_URL, BIBLE_KEY, query, {
    limit: SEARCH_PAGE_SIZE,
    page,
    fetchOptions: { cache: "no-store" },
  });
  return {
    total: response.total,
    page: response.page,
    limit: response.limit,
    results: response.results.map(toResultItem),
  };
}
