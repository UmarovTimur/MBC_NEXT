import type { Book } from "../lib/mapWpBook";
import { AppLink } from "@/shared/ui/AppLink";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const metaLine = book.author || book.subtitle;

  return (
    <AppLink href={`/books/${book.slug}`} className="group block">
      <div className="flex flex-col">
        {book.imageUrl && (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="mb-2 aspect-3/4 w-full rounded object-cover transition-transform duration-200 group-hover:-translate-y-1"
          />
        )}
        {metaLine && (
          <p className="text-sm text-muted-foreground truncate">{metaLine}</p>
        )}
        <p className="text-l mb-1 text-foreground font-bold truncate transition-colors group-hover:text-[#18375d]">{book.title}</p>
      </div>
    </AppLink>
  );
}
