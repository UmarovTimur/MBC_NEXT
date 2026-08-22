import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { AppLink } from "@/shared/ui/AppLink";
import { cn } from "@mbc/ui";
import type { Testament } from "../lib/searchVerses";
import type { SearchResultItem } from "./SearchResultRow";
import { SearchResultsList } from "./SearchResultsList";

export type { SearchResultItem };

interface BibleSearchProps {
  query: string;
  /** Whole-word match only, no typo-tolerant fallback — set via a Symphony link. */
  exact: boolean;
  testament: Testament | undefined;
  total: number;
  limit: number;
  results: SearchResultItem[];
  placeholder: string;
  submitLabel: string;
  emptyLabel: string;
  totalLabel: string;
  filterAllLabel: string;
  filterOldLabel: string;
  filterNewLabel: string;
}

export function BibleSearch({
  query,
  exact,
  testament,
  total,
  limit,
  results,
  placeholder,
  submitLabel,
  emptyLabel,
  totalLabel,
  filterAllLabel,
  filterOldLabel,
  filterNewLabel,
}: BibleSearchProps) {
  // Switching the testament filter keeps `exact` (still the same underlying
  // query) but is plain navigation, not a form resubmit.
  const filterHref = (next: Testament | undefined) => {
    const params = new URLSearchParams({ q: query });
    if (exact) params.set("exact", "1");
    if (next) params.set("testament", next);
    return `/search?${params.toString()}`;
  };

  const filters: { value: Testament | undefined; label: string }[] = [
    { value: undefined, label: filterAllLabel },
    { value: "ot", label: filterOldLabel },
    { value: "nt", label: filterNewLabel },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Plain GET form: search works with JavaScript disabled. Testament
          filter is a separate navigation, not part of this form, so
          resubmitting the query never carries `exact` along with it. */}
      <form method="get" className="mb-4 flex gap-2">
        {/* Rounding is left to the shared defaults — Button's cva base and the
            Input's own base are both rounded-md, which is what the app's CTAs use. */}
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 flex-1 px-4 text-base"
        />
        <Button type="submit" className="h-11 px-5">
          {submitLabel}
        </Button>
      </form>

      <div className="mb-6 flex gap-2">
        {filters.map(({ value, label }) => (
          <AppLink
            key={label}
            href={filterHref(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              testament === value
                ? "border-foreground bg-foreground text-primary-foreground"
                : "border-zinc-300 text-zinc-600 hover:border-foreground hover:text-foreground dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-foreground dark:hover:text-foreground",
            )}
          >
            {label}
          </AppLink>
        ))}
      </div>

      {query.length > 0 &&
        (results.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{emptyLabel}</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{totalLabel}</p>
            <SearchResultsList
              query={query}
              exact={exact}
              testament={testament}
              total={total}
              limit={limit}
              initialResults={results}
            />
          </>
        ))}
    </div>
  );
}
