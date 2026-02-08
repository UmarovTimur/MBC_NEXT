import { Chapter } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ChapterLinkProps {
  className?: string;
  direction: "prev" | "next";
  currentChapter: Chapter;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

export const ChapterLink = (params: ChapterLinkProps) => {
  const { className, direction, currentChapter, variant } = params;
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  let attendChapter: Chapter | null = null;

  if (direction === "next") {
    attendChapter = bibleManager.getNextChapter(currentChapter);
  } else {
    attendChapter = bibleManager.getPrevChapter(currentChapter);
  }

  if (!attendChapter) return "";

  const { bible, bookId, chapterId } = attendChapter;

  const href = `/${bible}/${bookId}/${chapterId}`;

  return (
    <Button
      asChild
      variant={variant ?? "outline"}
      size="icon"
      className={cn(
        "lg:rounded-full lg:fixed z-20 top-1/2",
        "lg:h-12 lg:w-12 lg:[&_svg]:size-5",
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
