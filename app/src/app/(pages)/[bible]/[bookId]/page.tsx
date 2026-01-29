import { bibleManager, Book, Chapter } from "@/entities/bible";
import { ContainerWidth } from "@/shared/ui/Container";
import { BibleViewer } from "@/widgets/BibleViewer";

type BookPageProps = {
  bible: string;
  bookId: string;
};

export async function generateStaticParams() {
  const staticParams: BookPageProps[] = [];

  bibleManager.traverseBooks(({bible, id}: Book) => {
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

  return (
    <section>
      <ContainerWidth>
        <BibleViewer chapter={chapter} />
      </ContainerWidth>
    </section>
  );
}
