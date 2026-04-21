import type { BibleConfig } from "@/entities/bible/config/config";
import { ContainerWidth } from "@/shared/ui/Container";
import { TooltipProvider } from "@mbc/ui";
import type { CSSProperties } from "react";
import { BookButton } from "./BookButton";

const OT_MAX = 39;

type Book = {
  id: string;
  chapters: { chapterId: string }[];
};

type Bible = {
  books: Book[];
  getBookName: (id: number) => string;
  getShortBookName: (id: number) => string;
};

interface BibleOverviewPageProps {
  bibleName: string;
  cfg: BibleConfig;
  bible: Bible;
}

const sectionThemeClass: Record<string, string> = {
  "paper.webp":
    "border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,236,0.94))] shadow-[0_18px_50px_-28px_rgba(50,38,21,0.18)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,21,18,0.94),rgba(16,14,12,0.9))]",
  "paper-blue.webp":
    "border-sky-200/80 bg-[linear-gradient(180deg,rgba(249,252,255,0.98),rgba(238,246,255,0.94))] shadow-[0_18px_50px_-28px_rgba(24,78,119,0.16)] dark:border-sky-500/20 dark:bg-[linear-gradient(180deg,rgba(16,24,32,0.94),rgba(11,17,24,0.9))]",
};

function BibleSection({
  title,
  books,
  lightBg,
  bibleName,
  bible,
  firstChapter,
}: {
  title: string;
  books: Book[];
  lightBg: string;
  bibleName: string;
  bible: Bible;
  firstChapter: (bookId: string) => string;
}) {
  if (books.length === 0) return null;

  const mobileRows = Math.ceil(books.length / 2);
  const desktopRows = Math.ceil(books.length / 3);
  const booksGridStyle = {
    "--mobile-rows": `repeat(${mobileRows}, minmax(0, auto))`,
    "--desktop-rows": `repeat(${desktopRows}, minmax(0, auto))`,
  } as CSSProperties;

  return (
    <div
      className={`relative mb-8 overflow-hidden rounded-[28px] border px-4 py-5 backdrop-blur-sm sm:px-6 sm:py-6 lg:mb-12 lg:px-8 ${sectionThemeClass[lightBg] ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-white/70 dark:bg-white/10" />
        <div
          className={`absolute -right-20 top-0 h-44 w-44 rounded-full blur-3xl ${
            lightBg === "paper-blue.webp"
              ? "bg-sky-300/25 dark:bg-sky-400/10"
              : "bg-amber-200/30 dark:bg-amber-100/10"
          }`}
        />
      </div>

      <div className="relative flex flex-col gap-5 lg:flex-row lg:gap-8">
        <h2
          className="flex items-center justify-center pt-1 text-center font-serif text-2xl font-bold lg:w-36 lg:flex-1/2 lg:text-3xl"
          style={{ fontVariant: "small-caps" }}
        >
          {title}
        </h2>

        <div
          className="grid grow auto-cols-fr grid-flow-col grid-rows-[var(--mobile-rows)] gap-x-4 gap-y-1 sm:gap-x-6 lg:flex-1/2 lg:grid-rows-[var(--desktop-rows)] lg:gap-x-12"
          style={booksGridStyle}
        >
          {books.map((book) => (
            <BookButton
              key={book.id}
              shortName={bible.getShortBookName(+book.id)}
              fullName={bible.getBookName(+book.id)}
              href={`/${bibleName}/${book.id}/${firstChapter(book.id)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BibleOverviewPage({ bibleName, cfg, bible }: BibleOverviewPageProps) {
  const { books } = bible;
  const otBooks = books.filter((b) => +b.id <= OT_MAX);
  const ntBooks = books.filter((b) => +b.id > OT_MAX);

  const firstChapter = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    return book?.chapters[0]?.chapterId ?? "0";
  };

  return (
    <TooltipProvider>
      <ContainerWidth>
        {bibleName === "barclay" ? (
          <div className="relative mb-8 overflow-hidden bg-cover lg:mb-10">
            <div className="flex max-w-xl flex-col justify-center gap-y-4">
              <h1 className="font-(family-name:--font-roboto-condensed) text-3xl font-bold sm:text-4xl lg:text-5xl">
                Vilyam Barklinin şərhləri
              </h1>
              <p className="mb-4 text-base font-normal dark:text-white/60">
                Müqəddəs Kitabın şərhi Qlazqo Universitetinin Əhdi-Cədid
                Tədqiqatları Departamentinin professoru tərəfindən yazılmışdır.
                Professor Əhdi-Cədidi və qədim yunan dilini tədris etmişdir.
              </p>
            </div>
          </div>
        ) : (
          <h1 className="mb-8 text-3xl font-bold font-(family-name:--font-roboto-condensed) sm:text-4xl lg:mb-10 lg:text-5xl">
            {cfg.primary}
          </h1>
        )}

        <BibleSection
          title="Əhdi-Ətiq"
          books={otBooks}
          lightBg="paper.webp"
          bibleName={bibleName}
          bible={bible}
          firstChapter={firstChapter}
        />
        <BibleSection
          title="Əhdi-Cədid"
          books={ntBooks}
          lightBg="paper-blue.webp"
          bibleName={bibleName}
          bible={bible}
          firstChapter={firstChapter}
        />
      </ContainerWidth>
    </TooltipProvider>
  );
}
