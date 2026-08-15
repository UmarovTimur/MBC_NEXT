import { Chapter } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import { ContainerWidth } from "@/shared/ui/Container";
import { BibleViewer } from "@/widgets/BibleViewer";
import type { Metadata } from "next";

type ChapterProps = {
  bible: string;
  bookId: string;
  chapterId: string;
};

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<ChapterProps> }): Promise<Metadata> {
  const { bible, bookId, chapterId } = await params;
  const chapter: Chapter = { bible, bookId, chapterId };
  const bibleObj = bibleManager.getBible(bible);
  const title = bibleObj.getChapterTitle(chapter);

  // Derived from the bible itself rather than hardcoded, so it stays correct for
  // every corpus instead of describing one of them.
  const primary = bibleObj.primaryTitle;

  return {
    title,
    description: primary && primary !== title ? `${title} — ${primary}` : title,
  };
}

export async function generateStaticParams() {
  const staticParams: ChapterProps[] = [];

  bibleManager.traverseChapter(({ bible, bookId, chapterId }: Chapter) => {
    staticParams.push({
      bible: bible,
      bookId: bookId,
      chapterId: chapterId,
    });
  });

  return staticParams;
}

export default async function ChapterPage({ params }: { params: Promise<ChapterProps> }) {
  const { bible, bookId, chapterId } = await params;
  const chapter: Chapter = {
    bible: bible,
    bookId: bookId,
    chapterId: chapterId,
  };

  return (
    <section>
      <ContainerWidth>
        <BibleViewer chapter={chapter} />
      </ContainerWidth>
    </section>
  );
}
