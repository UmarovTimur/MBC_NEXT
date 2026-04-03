import { fetchBooks } from "@/shared/lib/wp";
import { mapWpBook } from "@/entities/book";
import { BooksPage } from "@/widgets/BooksPage";
import type { Metadata } from "next";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Kitablar",
  description: "Azərbaycan dilində xristian kitabları. Pulsuz onlayn oxu.",
};

export default async function BooksListPage() {
  const categoryId = Number(process.env.WP_BOOKS_CATEGORY_ID);
  const raw = await fetchBooks(categoryId);
  const books = raw.map(mapWpBook);

  return <BooksPage books={books} />;
}
