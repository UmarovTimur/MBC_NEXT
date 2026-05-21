import { BIBLES_CONFIG } from "@/entities/bible/config/config";
import { bibleManager } from "@/entities/bible/server";
import { mapPayloadBook } from "@/entities/book";
import { fetchBooks } from "@/shared/lib/payload";
import { BibleOverviewPage } from "@/widgets/BibleOverviewPage";
import { BooksPage } from "@/widgets/BooksPage";
import { HomeHero } from "@/widgets/HomeHero";
export const dynamic = "force-static";

export default async function HomePage() {
  const rawBooks = await fetchBooks();
  const books = rawBooks.map(mapPayloadBook);

  const bibleName = "azb";
  const cfg = BIBLES_CONFIG[bibleName];

  const bible = bibleManager.getBible(bibleName);
  const john = bible.books.find((book) => book.id === "43");
  const john15 = john?.chapters.find((chapter) => Number(chapter.chapterId) === 15);
  const startReadingHref = `/${bibleName}/43/${john15?.chapterId ?? john?.chapters[0]?.chapterId ?? "1"}`;

  return (
    <>
      <HomeHero
        books={books}
        startReadingHref={startReadingHref}
        bibleHref={`/${bibleName}`}
        commentaryHref="/barclay"
      />

      <BibleOverviewPage bibleName={bibleName} cfg={cfg} bible={bible} />

      <BooksPage books={books} />
    </>
  );
}
