export type Book = {
  bible: string;
  id: string;
  chapters: Chapter[];
};

export type BibleViewMode = "single-column" | "split-screen";

export type Chapter = {
  bible: string;
  bookId: string;
  chapterId: string;
};

export interface BibleManifest {
  bibles: {
    bibleName: string;
    primary: string;
    isIndependent: boolean;
    isCommentary: boolean;
    books: {
      id: string;
      name: string;
      chapters: string[];
    }[];
  }[];
}
