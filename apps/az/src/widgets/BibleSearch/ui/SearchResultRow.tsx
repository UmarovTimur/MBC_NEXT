import { azFold, verseRefLabel } from "@mbc/bible-verses";
import type { VerseSearchHit } from "@mbc/bible-reader/server";
import { AppLink } from "@/shared/ui/AppLink";
import type { ReactNode } from "react";

/**
 * Marks query terms inside a verse snippet.
 *
 * The fold is a strict 1:1 character map, so offsets in the folded string line up
 * exactly with the original — which is why the matches can be found in folded text
 * and then sliced out of the ORIGINAL. That is also why `ts_headline` is not used:
 * it would return the folded text, showing "Yaradilis" instead of "Yaradılış".
 */
export function markTerms(text: string, query: string): ReactNode[] {
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

interface SearchResultRowProps {
  hit: SearchResultItem;
  query: string;
}

export function SearchResultRow({ hit, query }: SearchResultRowProps) {
  return (
    <li>
      {/* Reference and verse share one inline flow, so the text picks
          up right after the reference and wraps under it. */}
      <AppLink href={hit.href} className="group block leading-7">
        <span className="text-sm font-bold text-foreground group-hover:text-blue-600 group-hover:underline dark:group-hover:text-blue-400">
          {hit.bookName} {hit.chapterNumber}:
          {verseRefLabel(hit.verseNumber, hit.verseEnd)}
        </span>{" "}
        <span>{markTerms(hit.plainText, query)}</span>
      </AppLink>
    </li>
  );
}
