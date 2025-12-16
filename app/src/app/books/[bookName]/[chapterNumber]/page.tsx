interface chapterParams {
  bookName: string;
  chapterNumber: string;
}

export async function generateStaticParams() {
  const allChapterPaths = [
    { bookName: "exodus", chapterNumber: "15" },
    { bookName: "genesis", chapterNumber: "1" },
  ];

  return allChapterPaths;
}

export default async function ChapterPage({ params }: { params: chapterParams }) {
  const { bookName, chapterNumber } = params;

  console.log(bookName, chapterNumber);

  const chapterData = await getChapterData(bookName, chapterNumber);

  return (
    <div>
      <h1>{chapterData.title}</h1>
      <p>
        Книга: {bookName}, Глава: {chapterNumber}
      </p>
      <div dangerouslySetInnerHTML={{ __html: chapterData.content }} />
    </div>
  );
}

async function getChapterData(book: string, chapter: string) {
  return {
    title: `Глава ${chapter} Книги ${book}`,
    content: `Это статически сгенерированное содержание главы ${chapter}.`,
  };
}
