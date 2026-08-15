import { azFold, verseRefLabel } from "@mbc/bible-verses";
import type { VerseSearchHit } from "@mbc/bible-reader/server";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { ReactNode } from "react";

/**
 * Marks query terms inside a verse snippet.
 *
 * The fold is a strict 1:1 character map, so offsets in the folded string line up
 * exactly with the original — which is why the matches can be found in folded text
 * and then sliced out of the ORIGINAL. That is also why `ts_headline` is not used:
 * it would return the folded text, showing "Yaradilis" instead of "Yaradılış".
 */
function markTerms(text: string, query: string): ReactNode[] {
  const terms = azFold(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1);
  if (terms.length === 0) return [text];

  const folded = azFold(text);
  const ranges: [number, number][] = [];
  for (const term of terms) {
    let from = 0;
    for (;;) {
      const at = folded.indexOf(term, from);
      if (at === -1) break;
      ranges.push([at, at + term.length]);
      from = at + term.length;
    }
  }
  if (ranges.length === 0) return [text];

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }

  const out: ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([start, end], i) => {
    if (start > cursor) out.push(text.slice(cursor, start));
    out.push(
      <mark key={i} className="rounded-sm bg-yellow-200 px-0.5 dark:bg-yellow-800/60">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export type SearchResultItem = VerseSearchHit & { bookName: string; href: string };

interface BibleSearchProps {
  query: string;
  total: number;
  results: SearchResultItem[];
  placeholder: string;
  submitLabel: string;
  emptyLabel: string;
  totalLabel: (n: number) => string;
}

export function BibleSearch({
  query,
  total,
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
            <ul className="space-y-4">
              {results.map((hit) => (
                <li key={`${hit.bookNumber}:${hit.chapterNumber}:${hit.verseNumber}`}>
                  <AppLink href={hit.href} className="group block">
                    <span className="text-sm font-bold text-blue-600 group-hover:underline">
                      {hit.bookName} {hit.chapterNumber}:
                      {verseRefLabel(hit.verseNumber, hit.verseEnd)}
                    </span>
                    <p className="mt-1 leading-7">{markTerms(hit.plainText, query)}</p>
                  </AppLink>
                </li>
              ))}
            </ul>
          </>
        ))}
    </div>
  );
}
