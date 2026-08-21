import { AppLink } from "@/shared/ui/AppLink";

export type LetterCount = { letter: string; wordCount: number };

interface LetterGridProps {
  title: string;
  description: string;
  letters: LetterCount[];
  wordCountSuffix: string;
}

export function LetterGrid({ title, description, letters, wordCountSuffix }: LetterGridProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold font-(family-name:--font-roboto-condensed) sm:text-4xl">
        {title}
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {letters.map(({ letter, wordCount }, i) =>
          wordCount === 0 ? (
            <span
              key={letter}
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-zinc-200 px-3 py-3 text-zinc-300 dark:border-zinc-800 dark:text-zinc-700"
            >
              <span className="text-lg font-bold uppercase">{letter}</span>
            </span>
          ) : (
            <AppLink
              key={letter}
              href={`/simfoniya/${i + 1}`}
              className="group flex flex-col items-center justify-center gap-0.5 rounded-lg border border-zinc-200 px-3 py-3 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-500 dark:hover:bg-blue-950/40"
            >
              <span className="text-lg font-bold uppercase text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {letter}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {wordCount} {wordCountSuffix}
              </span>
            </AppLink>
          ),
        )}
      </div>
    </div>
  );
}
