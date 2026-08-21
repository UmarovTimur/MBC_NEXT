import { AppLink } from "@/shared/ui/AppLink";
import { FilterableWordList, type WordCount } from "./FilterableWordList";

export type { WordCount };

interface WordListProps {
  letter: string;
  words: WordCount[];
  total: number;
  totalLabel: (n: number) => string;
  backLabel: string;
  emptyLabel: string;
  filterPlaceholder: string;
  noMatchLabel: string;
}

export function WordList({
  letter,
  words,
  total,
  totalLabel,
  backLabel,
  emptyLabel,
  filterPlaceholder,
  noMatchLabel,
}: WordListProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <AppLink
        href="/simfoniya"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        {backLabel}
      </AppLink>

      <h1 className="mb-2 text-3xl font-bold font-(family-name:--font-roboto-condensed) uppercase sm:text-4xl">
        {letter}
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">{totalLabel(total)}</p>

      {words.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{emptyLabel}</p>
      ) : (
        <FilterableWordList words={words} filterPlaceholder={filterPlaceholder} noMatchLabel={noMatchLabel} />
      )}
    </div>
  );
}
