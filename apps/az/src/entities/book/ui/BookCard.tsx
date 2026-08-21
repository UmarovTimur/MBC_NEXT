import type { Book } from "../lib/mapWpBook";
import { AppLink } from "@/shared/ui/AppLink";
import Image from "next/image";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const metaLine = book.author || book.subtitle;

  return (
    <AppLink href={`/books/${book.slug}`} className="group block">
      <div className="flex flex-col">
        {book.imageUrl && (
          <div className="relative mb-2 aspect-3/4 w-full overflow-hidden rounded">
            <Image
              src={book.imageUrl}
              alt={book.title}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
              className="object-cover transition-transform duration-200 group-hover:-translate-y-1"
            />
          </div>
        )}
        {metaLine && (
          <p className="text-sm text-muted-foreground truncate">{metaLine}</p>
        )}
        <p className="text-l mb-1 text-foreground font-bold truncate transition-colors group-hover:text-[#18375d]">{book.title}</p>
      </div>
    </AppLink>
  );
}
