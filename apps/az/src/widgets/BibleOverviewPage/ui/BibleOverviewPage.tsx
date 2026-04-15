import { AppLink } from "@/shared/ui/AppLink";
import { ContainerWidth } from "@/shared/ui/Container";
import type { BibleConfig } from "@/entities/bible/config/config";
import { Button } from "@mbc/ui";

const OT_MAX = 39;

type Book = {
  id: string;
  chapters: { chapterId: string }[];
};

type Bible = {
  books: Book[];
  getShortBookName: (id: number) => string;
};

interface BibleOverviewPageProps {
  bibleName: string;
  cfg: BibleConfig;
  bible: Bible;
}

const sectionBgClass: Record<string, string> = {
  "paper.webp": "light:bg-[url('/images/paper.webp')] dark:bg-transparent",
  "paper-blue.webp": "light:bg-[url('/images/paper-blue.webp')] dark:bg-transparent",
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
  const chunkSize = Math.ceil(books.length / 3);
  const cols = [
    books.slice(0, chunkSize),
    books.slice(chunkSize, chunkSize * 2),
    books.slice(chunkSize * 2),
  ];

  return (
    <div className={`mb-12 rounded-xl border px-8 py-6 bg-cover bg-center ${sectionBgClass[lightBg] ?? ""}`}>
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
                <Button variant="ghost">
                  <AppLink
                    key={book.id}
                    href={`/${bibleName}/${book.id}/${firstChapter(book.id)}`}
                    className="text-base uppercase font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {bible.getShortBookName(+book.id)}
                  </AppLink>
                </Button>
              ))}
            </div>
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
    <ContainerWidth>
      {bibleName === "barclay" ? (
        <div className="relative overflow-hidden bg-cover mb-10">
          <div className="flex flex-col max-w-xl justify-center gap-y-4">
            <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl font-(family-name:--font-roboto-condensed)">
              Vilyam Barklinin şərhləri
            </h1>
            <p className="mb-4 dark:text-white/60 text-base font-normal">
              Müqəddəs Kitabın şərhi Qlazqo Universitetinin Əhdi-Cədid
              Tədqiqatları Departamentinin professoru tərəfindən yazılmışdır.
              Professor Əhdi-Cədidi və qədim yunan dilini tədris etmişdir.
            </p>
          </div>
        </div>
      ) : (
        <h1 className="text-5xl font-bold mb-10 font-(family-name:--font-roboto-condensed)">
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
  );
}
