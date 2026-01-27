import { bibleManager, Book, Chapter } from "@/entities/bible";
import { ContainerWidth } from "@/shared/ui/Container";
import { notFound } from "next/navigation";

type BookPageProps = {
  bible: string;
  bookId: string;
};

export async function generateStaticParams() {
  const staticParams: BookPageProps[] = [];

  bibleManager.traverseBooks((params: Book) => {
    const { bible, id } = params;
    staticParams.push({
      bible: bible,
      bookId: String(id),
    });
  });

  return staticParams;
}

export default async function BookPage({ params }: { params: Promise<BookPageProps> }) {
  const { bible, bookId } = await params;
  const chapter: Chapter = {
    bible: bible,
    bookId: bookId,
    chapterId: "0",
  };
  let content: string | null = null;
  if (bibleManager) {
    content = await bibleManager.getChapterContent(chapter);
  }
  if (!content) {
    notFound();
  }

  return (
    <>
      <ContainerWidth>
        <div className="flex justify-center">
          <section className="shrink-0 w-3xl mr-4"
           dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </ContainerWidth>
    </>
  );
}
