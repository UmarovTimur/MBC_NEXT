import { bibleManager, Chapter } from "@/entities/bible";
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
  const chapter: Chapter = {
    bible: bible,
    bookId: bookId,
    chapterId: chapterId,
  };

  return (
    <div>
      <ContainerWidth>
        <BibleViewer chapter={chapter} />
      </ContainerWidth>
    </div>
  );
}
