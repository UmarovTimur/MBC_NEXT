export type Bible = {
  bibleName: string;
  primary: string;
  isIndependent: boolean;
  isCommentary: boolean;
  books: {
    id: string;
    name: string;
    chapters: string[];
  }[];
};
