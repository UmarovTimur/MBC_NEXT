import { fetchBooks } from "@/shared/lib/payload";
import { mapPayloadBook } from "@/entities/book";
import { BooksPage } from "@/widgets/BooksPage";
import type { Metadata } from "next";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Kitablar",
  description: "Azərbaycan dilində xristian kitabları. Pulsuz onlayn oxu.",
};

export default async function BooksListPage() {
  const raw = await fetchBooks();
  const books = raw.map(mapPayloadBook);

  return <BooksPage books={books} />;
}
