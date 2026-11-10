import { fetchBooks } from "@/shared/lib/payload";
import { mapPayloadBook } from "@/entities/book";
import { BOOKS_PAGE_TITLE, BooksAbout, BooksLead, BooksPage } from "@/widgets/BooksPage";
import type { Metadata } from "next";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Azərbaycan dilində xristian kitabları. Ən yaxşı müəlliflər və tərcümələr",
  description:
    "Azərbaycan dilində xristian kitabları. Pulsuz onlayn oxu. Ruhani inkişaf, ailə və iman haqqında tanınmış müəlliflərin əsərləri.",
};

export default async function BooksListPage() {
  const raw = await fetchBooks();
  const books = raw.map(mapPayloadBook);

  return (
    <BooksPage books={books} title={BOOKS_PAGE_TITLE} lead={<BooksLead />} footer={<BooksAbout />} />
  );
}
