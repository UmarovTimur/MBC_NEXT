import { bibleManager } from "@/entities/bible/server";
import { BIBLES_CONFIG } from "@/entities/bible/config/config";
import { AppLink } from "@/shared/ui/AppLink";
import { ContainerWidth } from "@/shared/ui/Container";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = false;

// OT: books 1–39, NT: books 40–66
const OT_MAX = 39;

interface Props {
  params: Promise<{ bible: string }>;
}

export async function generateStaticParams() {
  return Object.entries(BIBLES_CONFIG)
    .filter(([, cfg]) => cfg.isIndependent)
    .map(([bibleName]) => ({ bible: bibleName }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bible } = await params;
  const cfg = BIBLES_CONFIG[bible];
  if (!cfg?.isIndependent) return {};
  return { title: cfg.primary };
}

export default async function BibleOverviewPage({ params }: Props) {
  const { bible: bibleName } = await params;
  const cfg = BIBLES_CONFIG[bibleName];
  if (!cfg?.isIndependent) notFound();

  const bible = bibleManager.getBible(bibleName);
  const books = bible.books;

  const otBooks = books.filter((b) => +b.id <= OT_MAX);
  const ntBooks = books.filter((b) => +b.id > OT_MAX);

  const firstChapter = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    return book?.chapters[0]?.chapterId ?? "0";
  };

  const sectionBgClass: Record<string, string> = {
    "paper.webp":
      "light:bg-[url('/images/paper.webp')] dark:bg-transparent ",
    "paper-blue.webp":
      "light:bg-[url('/images/paper-blue.webp')] dark:bg-transparent",
  };

  const renderSection = (
    title: string,
    sectionBooks: typeof books,
    lightBg: string
  ) => {
    if (sectionBooks.length === 0) return null;
    const chunkSize = Math.ceil(sectionBooks.length / 3);
    const cols = [
      sectionBooks.slice(0, chunkSize),
      sectionBooks.slice(chunkSize, chunkSize * 2),
      sectionBooks.slice(chunkSize * 2),
    ];

    return (
      <div
        className={`mb-12 rounded-xl border px-8 py-6 bg-cover bg-center ${sectionBgClass[lightBg] ?? ""}`}
      >
        <div className="flex gap-8">
          <h2
            className="flex justify-center items-center font-serif text-3xl font-bold flex-1/2 w-36 pt-1"
            style={{ fontVariant: "small-caps" }}
          >
            {title}
          </h2>
          <div className="flex-1/2 grid grid-cols-3 gap-x-12 gap-y-3 grow">
            {cols.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-1">
                {col.map((book) => (
                  <AppLink
                    key={book.id}
                    href={`/${bibleName}/${book.id}/${firstChapter(book.id)}`}
                    className="text-base text-foreground hover:text-primary transition-colors"
                  >
                    {bible.getShortBookName(+book.id)}
                  </AppLink>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ContainerWidth className="py-10">
      {(bibleName == 'barclay') && (<div className="py-12">
        <div className="relative overflow-hidden bg-cover">
          <div className="flex flex-col justify-center gap-y-8 ">
            <div className="font-bold text-3xl max-w-xl sm:text-5xl lg:text-6xl">
              Vilyam Barklinin şərhləri
              <p className="mb-4 dark:text-white/60 mt-4 text-base font-normal">
                Müqəddəs Kitabın şərhi Qlazqo Universitetinin Əhdi-Cədid
                Tədqiqatları Departamentinin professoru tərəfindən yazılmışdır.
                Professor Əhdi-Cədidi və qədim yunan dilini tədris etmişdir.
              </p>
            </div>
          </div>
        </div>
      </div >) || (<h1 className="text-4xl font-bold mb-10">{cfg.primary}</h1>)}

      {renderSection("Əhdi-Ətiq", otBooks, "paper.webp")}
      {renderSection("Əhdi-Cədid", ntBooks, "paper-blue.webp")}
    </ContainerWidth>
  );
}
