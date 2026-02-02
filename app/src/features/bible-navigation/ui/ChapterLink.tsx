import { Chapter } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ChapterLinkProps {
  className?: string;
  direction: "prev" | "next";
  currentChapter: Chapter;
}

export const ChapterLink = (params: ChapterLinkProps) => {
  const { className, direction, currentChapter } = params;
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  let attendChapter: Chapter | null = null;

  if (direction === "next") {
    attendChapter = bibleManager.getNextChapter(currentChapter);
  } else {
    attendChapter = bibleManager.getPrevChapter(currentChapter);
  }

  if (!attendChapter) return "";

  const { bible, bookId, chapterId } = attendChapter;

  const href = `/${bible}/${bookId}${+chapterId > 0 ? `/${chapterId}` : ''}`;

  return (
    <Button
      asChild
      variant="outline"
      size="xlIcon"
      className={cn(
        "rounded-full fixed z-20 top-1/2",
        className,
        direction === "next" ? "right-4 lg:right-1/12" : "left-4 lg:left-1/12",
      )}
    >
      <Link href={href} prefetch={true}>
        <Icon />
      </Link>
    </Button>
  );
};
