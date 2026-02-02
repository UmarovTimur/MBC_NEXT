import { Book, Chapter } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import { ContainerWidth } from "@/shared/ui/Container";
import { BibleViewer } from "@/widgets/BibleViewer";
import { redirect } from "next/navigation";

type BookPageProps = {
  bible: string;
  bookId: string;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const staticParams: BookPageProps[] = [];

  bibleManager.traverseBooks(({ bible, id }: Book) => {
    staticParams.push({
      bible: bible,
      bookId: String(id),
    });
  });

  return staticParams;
}

export default async function BookPage({ params }: { params: Promise<BookPageProps> }) {
  const { bible, bookId } = await params;
  const book = bibleManager.getBook(bible, bookId);

  if (book?.chapters?.[0]?.chapterId !== "0") {
    redirect(`${bookId}/${book?.chapters[0]?.chapterId}`);
  }

  const chapter: Chapter = {
    bible: bible,
    bookId: bookId,
    chapterId: book?.chapters?.[0]?.chapterId,
  };

  return (
    <section>
      <ContainerWidth>
        <BibleViewer chapter={chapter} />
      </ContainerWidth>
    </section>
  );
}
