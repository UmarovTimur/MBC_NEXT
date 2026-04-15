import type { Book } from "@/entities/book";
import { BookCard } from "@/entities/book";
import { ContainerWidth } from "@/shared/ui/Container";

interface BooksPageProps {
  books: Book[];
}

export function BooksPage({ books }: BooksPageProps) {
  return (
    <ContainerWidth className="py-12">
      <h1 className="text-3xl font-black mb-8">Kitablar</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </ContainerWidth>
  );
}
