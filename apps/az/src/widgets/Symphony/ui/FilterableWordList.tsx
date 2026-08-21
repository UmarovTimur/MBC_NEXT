"use client";

import { useMemo, useState } from "react";
import { AppLink } from "@/shared/ui/AppLink";
import { Input } from "@/shared/ui/input";

export type WordCount = { word: string; count: number };

interface FilterableWordListProps {
  words: WordCount[];
  filterPlaceholder: string;
  noMatchLabel: string;
}

export function FilterableWordList({ words, filterPlaceholder, noMatchLabel }: FilterableWordListProps) {
  const [query, setQuery] = useState("");

  // Substring filter, not prefix-only: with the list already narrowed down to
  // one letter, matching anywhere in the word is more useful for hunting down
  // a specific inflected form. Locale-aware lowercasing (not plain
  // toLowerCase) keeps the Azerbaijani dotted/dotless I pair correct, same
  // reasoning as the concordance rebuild script.
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("az");
    if (!needle) return words;
    return words.filter(({ word }) => word.includes(needle));
  }, [words, query]);

  return (
    <>
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={filterPlaceholder}
        aria-label={filterPlaceholder}
        className="mb-6 h-11 px-4 text-base"
      />

      {filtered.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{noMatchLabel}</p>
      ) : (
        <ul className="columns-2 gap-6 sm:columns-3 md:columns-4 lg:columns-5">
          {filtered.map(({ word, count }) => (
            <li key={word} className="mb-2 break-inside-avoid leading-6">
              <AppLink
                href={`/search?q=${encodeURIComponent(word)}`}
                className="text-foreground hover:text-blue-600 hover:underline dark:hover:text-blue-400"
              >
                {word}
              </AppLink>{" "}
              <span className="text-xs text-zinc-400 dark:text-zinc-600">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
