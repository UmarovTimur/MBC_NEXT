import { getI18n } from "@/app/providers/I18n/server";
import { BibleSearch, type SearchResultItem } from "@/widgets/BibleSearch";
import { fetchSearchPage, SEARCH_PAGE_SIZE } from "@/widgets/BibleSearch/lib/searchVerses";
import type { Metadata } from "next";

// Chapter routes stay SSG; only this one is dynamic, since the query is unbounded.
export const dynamic = "force-dynamic";

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
    const response = await fetchSearchPage(query, 1);
    total = response.total;
    results = response.results;
  }

  return (
    <BibleSearch
      query={query}
      total={total}
      limit={SEARCH_PAGE_SIZE}
      results={results}
      placeholder={t("searchPlaceholder")}
      submitLabel={t("searchSubmit")}
      emptyLabel={t("searchEmpty")}
      totalLabel={(n) => `${n} ${t("searchResultsSuffix")}`}
    />
  );
}
