import type { Book } from "@/entities/book";
import { BookCard } from "@/entities/book";
import { ContainerWidth } from "@/shared/ui/Container";
import type { ReactNode } from "react";

interface BooksPageProps {
  books: Book[];
  /** Page heading; the home page keeps the short default. */
  title?: string;
  /** Shown between the heading and the grid. */
  lead?: ReactNode;
  /** Shown under the grid. */
  footer?: ReactNode;
}

export function BooksPage({ books, title = "Kitablar", lead, footer }: BooksPageProps) {
  return (
    <ContainerWidth>
      <h1 className="text-5xl font-black mb-8 font-(family-name:--font-roboto-condensed)">{title}</h1>
      {lead}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      {footer}
    </ContainerWidth>
  );
}
