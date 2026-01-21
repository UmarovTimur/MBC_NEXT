export type Book = {
  bible: string;
  id: number;
  chapters: Chapter[];
}

export type Chapter = {
  bible: string;
  bookId: string;
  chapterId: string;
}
