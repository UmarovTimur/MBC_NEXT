"use client";

import { useI18n } from "@/app/providers/I18n";
import { useBible } from "@/entities/bible";
import { cn } from "@/shared/lib/utils";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useParams } from "next/navigation";

interface BooksListProps {
  className?: string;
}

export function BooksList({className}: BooksListProps) {
  const manifest = useBible();
  const params = useParams();
  const { t } = useI18n();

  const currentBibleId = params.bible as string ?? manifest.bibles[0].bibleName;
  const currentBible = manifest.bibles.find((b) => b.bibleName === currentBibleId);

  const currentBookId = params.bookId as string;
  const currentBook = currentBible?.books.find(
    (b: { id: string; name: string; chapters: string[] }) => b.id === currentBookId,
  )?.id ?? "";

  if (!currentBible) return null;

  const books = currentBible.books;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={cn("", className)} >{t("books")}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {books.map((b: { id: string; name: string; chapters: string[] }) => (
            <DropdownMenuItem
              className={cn(
                b.id === currentBook &&
                  // eslint-disable-next-line max-len
                  "bg-foreground text-primary-foreground focus:bg-foreground focus:text-primary-foreground focus:opacity-80",
                "cursor-pointer",
              )}
              asChild
              key={b.id}
            >
              <AppLink href={`/${currentBibleId}/${b.id}/0`}>{b.name}</AppLink>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
