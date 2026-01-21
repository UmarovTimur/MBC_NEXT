import { bibleManager, Chapter } from "@/entities/bible";
import { ContainerWidth } from "@/shared/ui/Container";

type ChapterProps = {
  bible: string;
  bookId: string;
  chapter: string;
};

export async function generateStaticParams() {
  const staticParams: ChapterProps[] = [];

  if (bibleManager) {
    bibleManager.traverseChapter(({ bible, bookId, chapterId }: Chapter) => {
      staticParams.push({
        bible: bible,
        bookId: bookId,
        chapter: chapterId 
      });
    });
  }

  console.log(staticParams);
  return staticParams;
}

export default async function ChapterPage({ params }: { params: Promise<ChapterProps> }) {
  const { bible, bookId, chapter } = await params;
  return (
    <div>
      <ContainerWidth>
        {bible}
        {bookId}
        {chapter}
        {/* <div style={{ maxWidth: "738px", margin: "0 auto" }} dangerouslySetInnerHTML={{ __html: content }} /> */}
      </ContainerWidth>
    </div>
  );
}
