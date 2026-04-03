import { Chapter } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/shared/ui/pagination";
import Link from "next/link";

interface ChapterPaginationProps {
  chapter: Chapter;
}

// When hasIntro=true, Kirish acts as the "first anchor" so page 1 is not pinned separately
function buildPages(total: number, current: number, hasIntro: boolean): (number | "ellipsis")[] {
  const SIBLINGS = 1;
  const pages: (number | "ellipsis")[] = [];
  const start = Math.max(hasIntro ? 1 : 2, current - SIBLINGS);
  const end = Math.min(total - 1, current + SIBLINGS);

  if (!hasIntro) {
    pages.push(1);
    if (start > 2) pages.push("ellipsis");
  } else {
    if (start > 1) pages.push("ellipsis");
  }

  for (let i = start; i <= end; i++) pages.push(i);

  if (end < total - 1) pages.push("ellipsis");
  if (end < total) pages.push(total);

  return pages;
}

export const ChapterPagination = ({ chapter }: ChapterPaginationProps) => {
  const book = bibleManager.getBook(chapter.bible, chapter.bookId);
  if (!book || book.chapters.length <= 1) return null;

  const bible = bibleManager.getBible(chapter.bible);
  const introducingName = bible.getIntroducingName();

  const introChapter = book.chapters.find((c) => c.chapterId === "0") ?? null;
  const numberedChapters = book.chapters.filter((c) => c.chapterId !== "0");
  const total = numberedChapters.length;

  const isIntroActive = chapter.chapterId === "0";
  const currentNumberedIndex = numberedChapters.findIndex((c) => c.chapterId === chapter.chapterId);
  const currentPage = currentNumberedIndex + 1;

  const hasIntro = !!(introChapter && introducingName);
  const chapterHref = (chapterId: string) => `/${chapter.bible}/${chapter.bookId}/${chapterId}`;
  const pages = buildPages(total, currentPage, hasIntro);

  return (
    <Pagination className="justify-center my-4">
      <PaginationContent className="flex-wrap">
        {hasIntro && (
          <PaginationItem>
            <Link
              href={chapterHref(introChapter!.chapterId)}
              aria-current={isIntroActive ? "page" : undefined}
              className={cn(buttonVariants({ variant: isIntroActive ? "outline" : "ghost", size: "default" }))}
            >
              {introducingName}
            </Link>
          </PaginationItem>
        )}

        {pages.map((page, i) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <Link
                href={chapterHref(numberedChapters[page - 1].chapterId)}
                aria-current={!isIntroActive && page === currentPage ? "page" : undefined}
                className={cn(buttonVariants({
                  variant: !isIntroActive && page === currentPage ? "outline" : "ghost",
                  size: "icon",
                }))}
              >
                {page}
              </Link>
            </PaginationItem>
          ),
        )}
      </PaginationContent>
    </Pagination>
  );
};
