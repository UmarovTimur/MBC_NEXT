"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/app/providers/I18n";
import type { Testament } from "../lib/searchVerses";
import { SearchResultRow, type SearchResultItem } from "./SearchResultRow";

interface SearchResultsListProps {
  query: string;
  exact: boolean;
  testament: Testament | undefined;
  total: number;
  limit: number;
  initialResults: SearchResultItem[];
}

function resultKey(hit: SearchResultItem): string {
  return `${hit.bookNumber}:${hit.chapterNumber}:${hit.verseNumber}`;
}

/**
 * Renders the first (SSR) batch as-is, then progressively fetches and appends
 * further batches as the sentinel at the bottom scrolls into view. The first
 * batch itself is never re-fetched, so a no-JS load already shows everything
 * up to `limit` results — this only adds what comes after.
 */
export function SearchResultsList({
  query,
  exact,
  testament,
  total,
  limit,
  initialResults,
}: SearchResultsListProps) {
  const { t } = useI18n();
  const [items, setItems] = useState(initialResults);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Mutable, read/written synchronously from the observer callback. A ref
  // (rather than state) is what makes the in-flight guard race-proof: two
  // intersection callbacks firing back-to-back both see the same `loading`
  // value instantly, with no state-commit delay between the check and the set.
  const stateRef = useRef({ page: 1, total, loading: false, done: initialResults.length >= total });

  useEffect(() => {
    setItems(initialResults);
    stateRef.current = { page: 1, total, loading: false, done: initialResults.length >= total };
  }, [query, initialResults, total]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Created once per query and left observing the same sentinel node across
    // every page load — recreating the observer after each append would fire
    // an immediate spurious callback while the sentinel is still on screen.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const state = stateRef.current;
        if (state.loading || state.done) return;
        state.loading = true;

        const nextPage = state.page + 1;
        const params = new URLSearchParams({ q: query, page: String(nextPage) });
        if (exact) params.set("exact", "1");
        if (testament) params.set("testament", testament);
        fetch(`/api/search?${params.toString()}`, { cache: "no-store" })
          .then((res) => (res.ok ? (res.json() as Promise<{ results: SearchResultItem[] }>) : null))
          .then((data) => {
            if (!data) return;
            setItems((prev) => {
              const seen = new Set(prev.map(resultKey));
              const fresh = data.results.filter((hit) => !seen.has(resultKey(hit)));
              return [...prev, ...fresh];
            });
            stateRef.current.page = nextPage;
            stateRef.current.done =
              nextPage * limit >= stateRef.current.total || data.results.length === 0;
          })
          .finally(() => {
            stateRef.current.loading = false;
            // IntersectionObserver only fires on a threshold CROSSING, not on
            // "still visible" — if the newly appended page isn't tall enough to
            // push the sentinel back out of view, no further crossing ever
            // happens and loading silently stalls. Re-observing forces a fresh
            // evaluation against the sentinel's (possibly unchanged) position,
            // which re-fires the callback if it's still in view.
            if (!stateRef.current.done) {
              observer.unobserve(sentinel);
              observer.observe(sentinel);
            }
          });
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [query, exact, testament, limit]);

  const hasMore = items.length < total;

  return (
    <>
      <ul className="space-y-4">
        {items.map((hit) => (
          <SearchResultRow key={resultKey(hit)} hit={hit} query={query} />
        ))}
      </ul>
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center gap-2 py-6 text-sm text-zinc-500 dark:text-zinc-400"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t("searchLoadingMore")}
        </div>
      )}
    </>
  );
}
