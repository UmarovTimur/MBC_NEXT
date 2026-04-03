export type Bible = {
  bibleName: string;
  books: {
    id: string;
    name: string;
    chapters: string[];
  }[];
};
