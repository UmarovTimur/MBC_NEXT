import { mapPayloadBook } from "@/entities/book";
import { fetchBooks } from "@/shared/lib/payload";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";
import { ContainerWidth } from "@/shared/ui/Container";
import { BooksPage } from "@/widgets/BooksPage";
export const dynamic = "force-static";

export default async function HomePage() {
  const rawBooks = await fetchBooks();
  const books = rawBooks.map(mapPayloadBook);



  return (
    <>


      <BooksPage books={books} />
    </>
  );
}
