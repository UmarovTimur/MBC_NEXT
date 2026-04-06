"use client";

import { usePathname } from "next/navigation";
import { BooksList } from "@/features/bible-navigation/ui/BooksList";
import { ChaptersTableTrigger } from "@/features/bible-navigation/ui/ChaptersTable";

// matches /:bible/:bookId/:chapterId
const CHAPTER_PATTERN = /^\/[^/]+\/[^/]+\/[^/]+\/?$/;

export function NavBibleControls() {
  const pathname = usePathname();
  if (!CHAPTER_PATTERN.test(pathname)) return null;

  return (
    <>
      <BooksList />
      <ChaptersTableTrigger />
    </>
  );
}
