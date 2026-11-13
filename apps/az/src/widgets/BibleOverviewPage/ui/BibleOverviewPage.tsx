import { ContainerWidth } from "@/shared/ui/Container";
import { BibleBooksSection, type BibleBooksSectionBook } from "@mbc/ui";

const OT_MAX = 39;

type Book = {
  id: string;
  chapters: { chapterId: string }[];
};

type Bible = {
  books: Book[];
  primaryTitle: string;
  getBookName: (id: number) => string;
  getShortBookName: (id: number) => string;
};

interface BibleOverviewPageProps {
  bibleName: string;
  bible: Bible;
}

export function BibleOverviewPage({
  bibleName,
  bible,
}: BibleOverviewPageProps) {
  const { books } = bible;
  const otBooks = books.filter((b) => +b.id <= OT_MAX);
  const ntBooks = books.filter((b) => +b.id > OT_MAX);

  const toSectionBook = (book: Book): BibleBooksSectionBook => ({
    id: book.id,
    shortName: bible.getShortBookName(+book.id),
    fullName: bible.getBookName(+book.id),
    href: `/${bibleName}/${book.id}/${book.chapters[0]?.chapterId ?? "0"}`,
  });

  return (
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
          {bible.primaryTitle}
        </h1>
      )}

      <BibleBooksSection
        title="Əhdi-Ətiq"
        icon="/images/icons/book.svg"
        books={otBooks.map(toSectionBook)}
        variant="old-testament"
      />
      <BibleBooksSection
        title="Əhdi-Cədid"
        icon="/images/icons/sun-rays.svg"
        books={ntBooks.map(toSectionBook)}
        variant="new-testament"
      />
    </ContainerWidth>
  );
}
