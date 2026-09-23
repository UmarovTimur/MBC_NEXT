import { getI18n } from "@/app/providers/I18n/server";
import { BibleSearch, type SearchResultItem } from "@/widgets/BibleSearch";
import { fetchSearchPage, parseTestament, SEARCH_PAGE_SIZE } from "@/widgets/BibleSearch/lib/searchVerses";
import type { Metadata } from "next";

// Chapter routes stay SSG; only this one is dynamic, since the query is unbounded.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const { t } = getI18n();
  // Result pages are thin, near-duplicate content keyed by an unbounded query, so
  // keep every /search URL out of the index. `follow` still lets crawlers reach
  // the chapters the results link to. Deliberately not a robots.txt Disallow:
  // a blocked page is never fetched, so its noindex would never be seen.
  return { title: t("searchTitle"), robots: { index: false, follow: true } };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; exact?: string; testament?: string }>;
}) {
  const { t } = getI18n();
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  // Only ever true via a Symphony concordance link — the search form itself
  // never submits this, so resubmitting drops back to typo-tolerant search.
  const exact = params.exact === "1";
  const testament = parseTestament(params.testament ?? null);

  let total = 0;
  let results: SearchResultItem[] = [];

  if (query.length >= 2) {
    const response = await fetchSearchPage(query, 1, { exact, testament });
    total = response.total;
    results = response.results;
  }

  return (
    <BibleSearch
      query={query}
      exact={exact}
      testament={testament}
      total={total}
      limit={SEARCH_PAGE_SIZE}
      results={results}
      placeholder={t("searchPlaceholder")}
      submitLabel={t("searchSubmit")}
      emptyLabel={t("searchEmpty")}
      totalLabel={`${total} ${t("searchResultsSuffix")}`}
      filterAllLabel={t("searchFilterAll")}
      filterOldLabel={t("searchFilterOld")}
      filterNewLabel={t("searchFilterNew")}
    />
  );
}
