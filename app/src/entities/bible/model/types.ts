export type Book = {
  bible: string;
  id: number;
  chapters: Chapter[];
};

export type BibleViewMode = "single-column" | "split-screen";

export type Chapter = {
  bible: string;
  bookId: string;
  chapterId: string;
};
