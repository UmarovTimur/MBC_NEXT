import { getAllBooksPaths, getChapterContent } from "@/entities/book/lib/server";
import { logger } from "@/shared/lib/logger";
import { ContainerWidth } from "@/shared/ui/Container";

interface chapterParams {
  params: {
    bookNumber: string;
    chapterNumber: string;
  };
}

export async function generateStaticParams() {
  const paths = getAllBooksPaths();
  return paths;
}

export default async function ChapterPage({ params }: chapterParams) {
  const props = await params;
  const { bookNumber, chapterNumber } = props;

  const content = getChapterContent(bookNumber, chapterNumber);

  if (!content) {
    return <div>404 NOT FOUND!</div>;
  }

  return (
    <div>
      <ContainerWidth>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </ContainerWidth>
    </div>
  );
}
