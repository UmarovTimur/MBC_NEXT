import { bibleManager } from "@/entities/bible/server";
import { mapPayloadBook } from "@/entities/book";
import { fetchBooks } from "@/shared/lib/payload";
import { BibleOverviewPage } from "@/widgets/BibleOverviewPage";
import { BooksPage } from "@/widgets/BooksPage";
import { HomeHero } from "@/widgets/HomeHero";
import { getI18n } from "@/app/providers/I18n/server";
import type { Metadata } from "next";

// Nothing here is per-request (no cookies/headers/searchParams), so let it be
// cached and refreshed with the same 60s window as the fetches it makes.
export const revalidate = 60;

export function generateMetadata(): Metadata {
  const { t } = getI18n();
  return { description: t("homeHeroDescription") };
}

export default async function HomePage() {
  const rawBooks = await fetchBooks();
  const books = rawBooks.map(mapPayloadBook);

  const bibleName = "azb";

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

      <BibleOverviewPage bibleName={bibleName} bible={bible} />

      <BooksPage books={books} />
    </>
  );
}
