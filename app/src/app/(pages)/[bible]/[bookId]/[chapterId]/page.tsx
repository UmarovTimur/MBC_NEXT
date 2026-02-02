import { Chapter } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import { ChaptersPagination } from "@/features/bible-navigation/ui/ChaptersPagination";
import { getDictionary } from "@/shared/lib/getDictionary";
import { ContainerWidth } from "@/shared/ui/Container";
import { BibleViewer } from "@/widgets/BibleViewer";

type ChapterProps = {
  bible: string;
  bookId: string;
  chapterId: string;
};

export const dynamicParams = false;

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
  const t = getDictionary();
  const chapter: Chapter = {
    bible: bible,
    bookId: bookId,
    chapterId: chapterId,
  };

  return (
    <section>
      <ContainerWidth>
        <BibleViewer chapter={chapter} />
        <ChaptersPagination next={t("Next")} prev={t("Previous")} />
      </ContainerWidth>
    </section>
  );
}
