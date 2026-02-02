"use client";

import { useBible } from "@/entities/bible";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import Link from "next/link";
import { useParams } from "next/navigation";

interface BooksListProps {
  label: string;
}

export function BooksList({ label }: BooksListProps) {
  const manifest = useBible();
  const params = useParams();

  const currentBibleId = params.bible as string;
  const currentBible = manifest.bibles.find((b) => b.bibleName === currentBibleId);

  const currentBookId = params.bookId as string;
  const currentBook = currentBible?.books.find(
    (b: { id: string; name: string; chapters: string[] }) => b.id === currentBookId,
  );

  if (!currentBible || !currentBook) return null;

  const books = currentBible.books;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {books.map((b: { id: string; name: string; chapters: string[] }) => (
            <DropdownMenuItem
              className={cn(
                b.id === currentBook.id &&
                  // eslint-disable-next-line max-len
                  "bg-foreground text-primary-foreground focus:bg-foreground focus:text-primary-foreground focus:opacity-80",
                "cursor-pointer",
              )}
              asChild
              key={b.id}
            >
              <Link href={`/${currentBibleId}/${b.id}`}>{b.name}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
