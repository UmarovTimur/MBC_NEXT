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

  const renderSection = (title: string, sectionBooks: typeof books) => {
    if (sectionBooks.length === 0) return null;
    const cols: (typeof books)[] = [[], [], []];
    sectionBooks.forEach((b, i) => cols[i % 3].push(b));

    return (
      <div className="mb-12">
        <div className="flex gap-8">
          <h2
            className="font-serif text-2xl text-muted-foreground shrink-0 w-36 pt-1"
            style={{ fontVariant: "small-caps" }}
          >
            {title}
          </h2>
          <div className="grid grid-cols-3 gap-x-12 gap-y-1 grow">
            {cols.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-1">
                {col.map((book) => (
                  <AppLink
                    key={book.id}
                    href={`/${bibleName}/${book.id}/${firstChapter(book.id)}`}
                    className="text-sm tracking-widest uppercase hover:text-primary transition-colors"
                  >
                    {bible.getBookName(+book.id)}
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
      <h1 className="text-4xl font-black mb-10">{cfg.primary}</h1>
      {renderSection("Əhdi-Ətiq", otBooks)}
      {renderSection("Əhdi-Cədid", ntBooks)}
    </ContainerWidth>
  );
}
