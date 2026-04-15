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
            className="mb-2 aspect-ratio-4/3 rounded object-cover"
          />
        )}
        {book.excerpt && (
          <p className="text-sm text-muted-foreground truncate">{book.excerpt}</p>
        )}
        <p className="text-l mb-1 text-foreground font-bold truncate">{book.title}</p>
      </div>
    </AppLink>
  );
}
