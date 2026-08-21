import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { SearchResultItem } from "./SearchResultRow";
import { SearchResultsList } from "./SearchResultsList";

export type { SearchResultItem };

interface BibleSearchProps {
  query: string;
  total: number;
  limit: number;
  results: SearchResultItem[];
  placeholder: string;
  submitLabel: string;
  emptyLabel: string;
  totalLabel: (n: number) => string;
}

export function BibleSearch({
  query,
  total,
  limit,
  results,
  placeholder,
  submitLabel,
  emptyLabel,
  totalLabel,
}: BibleSearchProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Plain GET form: search works with JavaScript disabled. */}
      <form method="get" className="mb-8 flex gap-2">
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

      {query.length > 0 &&
        (results.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{emptyLabel}</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{totalLabel(total)}</p>
            <SearchResultsList query={query} total={total} limit={limit} initialResults={results} />
          </>
        ))}
    </div>
  );
}
