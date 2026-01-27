import { readdir, readFile } from "node:fs/promises";
import path from "path";
import { BibleViewMode, Book, Chapter } from "../model/types";
import { BIBLE_RELATIONS_CONFIG } from "../config/relations";

export class Bible {
  public readonly bibleName: string;
  public readonly books: Book[];
  public readonly basePath: string;
  public readonly defaultViewMode: BibleViewMode;

  constructor(basePath: string, books: Book[]) {
    this.basePath = basePath;
    this.bibleName = path.basename(basePath);
    this.books = books;
    this.defaultViewMode = BIBLE_RELATIONS_CONFIG[this.bibleName]?.defaultView || "single-column";
  }

  // Get absolute path
  static async init(basePath: string): Promise<Bible> {
    try {
      // Get all books files 01, 02, 03, 04,...
      const entries = await readdir(basePath, { withFileTypes: true });
      const bibleName = path.basename(basePath);

      // Create objects for each book
      const booksPromises: Promise<Book[]> = Promise.all(
        entries
          .filter((entry) => entry.isDirectory() && !isNaN(+entry.name))
          .map(async (dir) => {
            const bookId: number = +dir.name;

            // Get all chapter files 01.html, 02.html, 03.html,...
            const files = await readdir(path.join(basePath, dir.name));

            // Create a chapters list with only html files
            const chapters: Chapter[] = files
              .filter((file) => file.endsWith(".html"))
              .map((file) => {
                const chapterName = +file.replace(".html", "");
                return {
                  bible: bibleName,
                  bookId: bookId.toString(),
                  chapterId: chapterName.toString(),
                };
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
      return new Bible(basePath, books);
    } catch (e) {
      throw new Error(`Init Bible failed ${basePath}: ${(e as Error).message}`);
    }
  }

  async getChapterContent(bookId: string, chapterId: string): Promise<string | null> {
    const book = this.books.find((b) => b.id === Number(bookId));
    if (!book) return null;
    const chapter = book.chapters.find((c) => c.chapterId === chapterId);
    if (!chapter) return null;

    const bookFileName = book.id.toString().padStart(2, "0");
    const chapterFileName = `${chapter.chapterId.padStart(2, "0")}.html`;

    const filePath = path.join(this.basePath, bookFileName, chapterFileName);

    try {
      const content = await readFile(filePath, "utf-8");
      return content;
    } catch {
      // console.error(`Error reading file ${filePath}:`, e);
      return null;
    }
  }
}
