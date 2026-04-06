import type { Book } from "../lib/mapWpBook";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={book.title}
          className="w-full aspect-3/4 object-cover rounded-md"
        />
      )}
      <h2
        className="text-lg font-bold"
        dangerouslySetInnerHTML={{ __html: book.title }}
      />
      <div
        className="text-sm text-muted-foreground line-clamp-3 [&>p]:mb-0"
        dangerouslySetInnerHTML={{ __html: book.description }}
      />
      <Button asChild size="sm" className="mt-auto">
        <AppLink href={`/books/${book.slug}`}>Oxu</AppLink>
      </Button>
    </div>
  );
}
