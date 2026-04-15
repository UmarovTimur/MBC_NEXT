import { BIBLES_CONFIG } from "@/entities/bible/config/config";
import { bibleManager } from "@/entities/bible/server";
import { mapPayloadBook } from "@/entities/book";
import { fetchBooks } from "@/shared/lib/payload";
import { BibleOverviewPage } from "@/widgets/BibleOverviewPage";
import { BooksPage } from "@/widgets/BooksPage";
export const dynamic = "force-static";

export default async function HomePage() {
  const rawBooks = await fetchBooks();
  const books = rawBooks.map(mapPayloadBook);

  const bibleName = "azb";
  const cfg = BIBLES_CONFIG[bibleName];

  const bible = bibleManager.getBible(bibleName);



  return (
    <>
      <BibleOverviewPage bibleName={bibleName} cfg={cfg} bible={bible} />

      <BooksPage books={books} />
    </>
  );
}
