import { bibleManager, Book, Chapter } from "@/entities/bible";
import { notFound } from "next/navigation";

type BookPageProps = {
  bible: string;
  bookId: string;
};

export async function generateStaticParams() {
  const staticParams: BookPageProps[] = [];

  if (bibleManager) {
    bibleManager.traversBooks((params: Book) => {
      const { bible, id } = params;
      staticParams.push({
        bible: bible,
        bookId: String(id),
      });
    });
  }
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
    <div>
      <section dangerouslySetInnerHTML={{__html: content}} />
    </div>
  );
}
