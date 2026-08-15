import { searchVerses } from "@mbc/bible-reader/server";
import { bibleManager } from "@/entities/bible/server";
import { getI18n } from "@/app/providers/I18n/server";
import { BibleSearch, type SearchResultItem } from "@/widgets/BibleSearch";
import type { Metadata } from "next";

// Chapter routes stay SSG; only this one is dynamic, since the query is unbounded.
export const dynamic = "force-dynamic";

const BIBLE_KEY = "azb";
const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL ?? "http://localhost:8001";

export function generateMetadata(): Metadata {
  const { t } = getI18n();
  return { title: t("searchTitle") };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { t } = getI18n();
  const query = ((await searchParams).q ?? "").trim();

  let total = 0;
  let results: SearchResultItem[] = [];

  if (query.length >= 2) {
    const bible = bibleManager.getBible(BIBLE_KEY);
    const response = await searchVerses(PAYLOAD_API_URL, BIBLE_KEY, query, {
      limit: 30,
      fetchOptions: { cache: "no-store" },
    });
    total = response.total;
    results = response.results.map((hit) => ({
      ...hit,
      // Book naming lives in the manifest the reader already holds, so the search
      // endpoint returns raw numbers and does not duplicate it.
      bookName: bible.getShortBookName(Number(hit.bookNumber)),
      href: `/${BIBLE_KEY}/${hit.bookNumber}/${hit.chapterNumber}/#V${hit.verseNumber}`,
    }));
  }

  return (
    <BibleSearch
      query={query}
      total={total}
      results={results}
      placeholder={t("searchPlaceholder")}
      submitLabel={t("searchSubmit")}
      emptyLabel={t("searchEmpty")}
      totalLabel={(n) => `${n} ${t("searchResultsSuffix")}`}
    />
  );
}
