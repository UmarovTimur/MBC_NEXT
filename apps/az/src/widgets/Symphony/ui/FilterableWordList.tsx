"use client";

import { useMemo, useState } from "react";
import { AppLink } from "@/shared/ui/AppLink";
import { Input } from "@/shared/ui/input";

export type WordCount = { word: string; count: number };

/**
 * Substring filter, not prefix-only: with the list already narrowed down to
 * one letter, matching anywhere in the word is more useful for hunting down
 * a specific inflected form. Locale-aware lowercasing (not plain
 * toLowerCase) keeps the Azerbaijani dotted/dotless I pair correct, same
 * reasoning as the concordance rebuild script.
 */
export function useWordFilter(words: WordCount[]) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("az");
    if (!needle) return words;
    return words.filter(({ word }) => word.includes(needle));
  }, [words, query]);

  return { query, setQuery, filtered };
}

interface WordFilterInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder: string;
  className?: string;
}

export function WordFilterInput({ query, onQueryChange, placeholder, className }: WordFilterInputProps) {
  return (
    <Input
      type="search"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={className ?? "h-11 px-4 text-base"}
    />
  );
}

interface WordListItemsProps {
  words: WordCount[];
  noMatchLabel: string;
}

export function WordListItems({ words, noMatchLabel }: WordListItemsProps) {
  if (words.length === 0) {
    return <p className="text-zinc-500 dark:text-zinc-400">{noMatchLabel}</p>;
  }

  return (
    <ul className="columns-2 gap-6 sm:columns-3 md:columns-4 lg:columns-5">
      {words.map(({ word, count }) => (
        <li key={word} className="mb-2 break-inside-avoid leading-6">
          <AppLink
            href={`/search?q=${encodeURIComponent(word)}&exact=1`}
            className="text-foreground hover:text-blue-600 hover:underline dark:hover:text-blue-400"
          >
            {word}
          </AppLink>{" "}
          <span className="text-xs text-zinc-400 dark:text-zinc-600">{count}</span>
        </li>
      ))}
    </ul>
  );
}
