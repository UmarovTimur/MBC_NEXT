import type { ChapterNaming } from "../lib/chapter-name";

export type Bible = {
  bibleName: string;
  primary: string;
  isIndependent: boolean;
  isCommentary: boolean;
  chapterNaming: ChapterNaming;
  books: {
    id: string;
    name: string;
    chapters: string[];
  }[];
};
