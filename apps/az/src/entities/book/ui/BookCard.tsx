import type { Book } from "../lib/mapWpBook";
import { AppLink } from "@/shared/ui/AppLink";
interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <AppLink href={`/books/${book.slug}`}>
      <div className="flex flex-col">
        {book.imageUrl && (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full aspect-3/4 mb-2 object-cover rounded-sm"
          />
        )}
        {book.excerpt && (
          <p className="text-sm text-muted-foreground">{book.excerpt}</p>
        )}
        <p className="text-l mb-1  text-foreground font-bold">{book.title}</p>
      </div >
    </AppLink>
  );
}
