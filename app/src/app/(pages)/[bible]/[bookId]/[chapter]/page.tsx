import { bibleManager, Chapter } from "@/entities/bible";
import { ContainerWidth } from "@/shared/ui/Container";
import { notFound } from "next/navigation";

type ChapterProps = {
  bible: string;
  bookId: string;
  chapter: string;
};

export async function generateStaticParams() {
  const staticParams: ChapterProps[] = [];

  bibleManager.traverseChapter(({ bible, bookId, chapterId }: Chapter) => {
    staticParams.push({
      bible: bible,
      bookId: bookId,
      chapter: chapterId,
    });
  });

  return staticParams;
}

export default async function ChapterPage({ params }: { params: Promise<ChapterProps> }) {
  const { bible, bookId, chapter } = await params;
  const managerParams: Chapter = {
    bible: bible,
    bookId: bookId,
    chapterId: chapter,
  };
  let content: string | null = null;
  if (bibleManager) {
    content = await bibleManager.getChapterContent(managerParams);
  }
  if (!content) {
    notFound();
  }

  return (
    <div>
      <ContainerWidth>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </ContainerWidth>
    </div>
  );
}
