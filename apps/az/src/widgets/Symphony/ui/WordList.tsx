"use client";

import { AppLink } from "@/shared/ui/AppLink";
import { ContainerWidth } from "@/shared/ui/Container";
import { useWordFilter, WordFilterInput, WordListItems, type WordCount } from "./FilterableWordList";

export type { WordCount };

interface WordListProps {
  letter: string;
  words: WordCount[];
  totalLabel: string;
  backLabel: string;
  emptyLabel: string;
  filterPlaceholder: string;
  noMatchLabel: string;
}

export function WordList({
  letter,
  words,
  totalLabel,
  backLabel,
  emptyLabel,
  filterPlaceholder,
  noMatchLabel,
}: WordListProps) {
  const { query, setQuery, filtered } = useWordFilter(words);

  return (
    <ContainerWidth>
      <AppLink
        href="/simfoniya"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        {backLabel}
      </AppLink>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-5xl font-black font-(family-name:--font-roboto-condensed) uppercase">
          {letter}
        </h1>
        {words.length > 0 && (
          <WordFilterInput
            query={query}
            onQueryChange={setQuery}
            placeholder={filterPlaceholder}
            className="h-11 w-full max-w-xs px-4 text-base"
          />
        )}
      </div>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">{totalLabel}</p>

      {words.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{emptyLabel}</p>
      ) : (
        <WordListItems words={filtered} noMatchLabel={noMatchLabel} />
      )}
    </ContainerWidth>
  );
}
