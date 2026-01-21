import { readdir } from "node:fs/promises";
import path from "path";
import { Book, Chapter } from "../model/types";

export class Bible {
  public readonly bibleName: string;
  public readonly books: Book[];
  public readonly rootDir: string;

  private constructor(rootDir: string, books: Book[]) {
    this.rootDir = rootDir;
    this.bibleName = path.basename(rootDir);
    this.books = books;
  }

  // Get absolute path
  static async init(rootDir: string): Promise<Bible | null> {
    try {
      // Get all books files 01, 02, 03, 04,...
      const entries = await readdir(rootDir, { withFileTypes: true });
      const bibleName = path.basename(rootDir);

      // Create objects for each book
      const booksPromises: Promise<Book[]> = Promise.all(
        entries
          .filter((entry) => entry.isDirectory() && !isNaN(+entry.name))
          .map(async (dir) => {
            const bookId: number = +dir.name;

            // Get all chapter files 01.html, 02.html, 03.html,...
            const files = await readdir(path.join(rootDir, dir.name));

            // Create a chapters list with only html files
            const chapters: Chapter[] = files
              .filter((file) => file.endsWith(".html"))
              .map((file) => {
                const chapterName = +file.replace(".html", "");
                return {
                  bible: bibleName,
                  bookId: bookId.toString(),
                  chapterId: chapterName.toString()
                }
              })
              .filter((chapter) => !isNaN(+chapter.chapterId))
              .sort((a, b) => +a.chapterId - +b.chapterId);

            // Return object for each book
            return {
              id: bookId,
              bible: bibleName,
              chapters: chapters,
            };
          }),
      );
      const books = await booksPromises;

      // For accuracy, sort
      books.sort((a, b) => a.id - b.id);

      // Create a Bible with gotten properties
      return new Bible(rootDir, books);
    } catch (e) {
      console.error(`Init Bible failed ${rootDir}: ${(e as Error).message}`);
      return null;
    }
  }
  
}
