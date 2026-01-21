import { bibleManager, Book } from "@/entities/bible";

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
  return (
    <div>
      {bible}
      {bookId}
    </div>
  );
}
