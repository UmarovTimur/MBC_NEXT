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

  return {
    title,
    description: `${title} — William MakDonaldning Muqaddas Kitobga yozgan sharhlari o'zbek tilida.`,
  };
}

export async function generateStaticParams() {
  const staticParams: ChapterProps[] = [];

  bibleManager.traverseChapter(({ bible, bookId, chapterId }: Chapter) => {
    if (bible === "muqaddas-kitob") return;
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
