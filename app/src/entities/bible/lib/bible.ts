import { readdir, readFile } from "node:fs/promises";
import path from "path";
import { BibleViewMode, Book, Chapter } from "../model/types";
import { BIBLES_CONFIG } from "../config/config";

export class Bible {
  public readonly bibleName: string; // Name of the bible (folder name)
  public readonly books: Book[]; // List of books in this bible
  public readonly basePath: string; // Absolute path to bible folder
  public readonly defaultViewMode: BibleViewMode; // Default view mode from relations
  public readonly attachmentBibleName: string; // Attachment bible name from relations

  constructor(basePath: string, books: Book[]) {
    this.basePath = basePath;
    this.bibleName = path.basename(basePath);
    this.books = books;
    this.defaultViewMode = BIBLES_CONFIG[this.bibleName]?.defaultView || "single-column";
    this.attachmentBibleName = BIBLES_CONFIG[this.bibleName]?.attachment || "";
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

  private getBook(bookId: string): Book {
    const book = this.books.find((b) => b.id === Number(bookId));
    if (!book) {
      throw new Error(`Book "${bookId}" not found in Bible "${this.bibleName}"`);
    }
    return book;
  }

  async getChapterContent(bookId: string, chapterId: string): Promise<string | null> {
    const book = this.getBook(bookId);
    const chapter = book.chapters.find((c) => c.chapterId === chapterId);
    if (!chapter) {
      return null;
    }

    const bookFileName = book.id.toString().padStart(2, "0");
    const chapterFileName = `${chapterId.padStart(2, "0")}.html`;

    const filePath = path.join(this.basePath, bookFileName, chapterFileName);
    try {
      const content = await readFile(filePath, "utf-8");
      return content;
    } catch (e) {
      throw new Error(`Chapter file not found: ${filePath}, Erorr: ${(e as Error).message}`);
    }
  }

  // getChapterTitle(params: Chapter): string | null {

  // }
}
