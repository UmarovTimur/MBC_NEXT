import { readdir, readFile } from "node:fs/promises";
import path from "path";
import { BibleViewMode, Book, Chapter } from "../model/types";
import { BibleConfig } from "../config";

export class Bible {
  public readonly bibleName: string;
  public readonly books: Book[];
  public readonly basePath: string;
  public readonly defaultViewMode: BibleViewMode;
  public readonly attachmentBibleName: string;
  public readonly formattingStyle: string;
  public readonly mappingBook?: string[];
  public readonly mappingShortBook?: string[];
  public readonly primaryTitle: string;
  private readonly chapterSlug?: string;
  private readonly mappingChapterSlug?: string[];
  private readonly introducingName?: string;

  constructor(basePath: string, books: Book[], configMap: Record<string, BibleConfig>) {
    this.basePath = basePath;
    this.bibleName = path.basename(basePath);
    this.books = books;
    this.defaultViewMode = configMap[this.bibleName]?.defaultView || "single-column";
    this.attachmentBibleName = configMap[this.bibleName]?.attachment || "";
    this.formattingStyle = configMap[this.bibleName]?.formatingStyle || "";
    this.primaryTitle = configMap[this.bibleName]?.primary;
    this.mappingBook = configMap[this.bibleName]?.mappingBible;
    this.mappingShortBook = configMap[this.bibleName]?.mappingShortBooks;
    this.chapterSlug = configMap[this.bibleName]?.chapterSlug ?? "";
    this.mappingChapterSlug = configMap[this.bibleName]?.mappingChapterSlug;
    this.introducingName = configMap[this.bibleName]?.introductionName ?? this.mappingChapterSlug?.[0] ?? "0";
  }

  static async init(basePath: string, configMap: Record<string, BibleConfig>): Promise<Bible> {
    try {
      const entries = await readdir(basePath, { withFileTypes: true });
      const bibleName = path.basename(basePath);

      const booksPromises: Promise<Book[]> = Promise.all(
        entries
          .filter((entry) => entry.isDirectory() && !isNaN(+entry.name))
          .map(async (dir) => {
            const bookId = dir.name;

            const files = await readdir(path.join(basePath, dir.name));

            const chapters: Chapter[] = files
              .filter((file) => file.endsWith(".html"))
              .map((file) => {
                const chapterName = +file.replace(".html", "");
                return {
                  bible: bibleName,
                  bookId: bookId,
                  chapterId: chapterName.toString(),
                };
              })
              .filter((chapter) => !isNaN(+chapter.chapterId))
              .sort((a, b) => +a.chapterId - +b.chapterId);

            return {
              id: bookId,
              bible: bibleName,
              chapters: chapters,
            };
          }),
      );
      const books = await booksPromises;

      books.sort((a, b) => +a.id - +b.id);

      return new Bible(basePath, books, configMap);
    } catch (e) {
      throw new Error(`Init Bible failed ${basePath}: ${(e as Error).message}`);
    }
  }

  private getBook(bookId: string): Book {
    const book = this.books.find((b) => b.id === bookId);
    if (!book) {
      throw new Error(`Book "${bookId}" not found in Bible "${this.bibleName}"`);
    }
    return book;
  }

  getBookName(bookId: number): string {
    return this.mappingBook?.[bookId - 1] ?? bookId.toString();
  }

  getShortBookName(bookId: number): string {
    return this.mappingShortBook?.[bookId - 1] ?? this.getBookName(bookId);
  }

  getIntroducingName(): string | undefined {
    return this.introducingName || undefined;
  }

  async getChapterContent(bookId: string, chapterId: string): Promise<string | null> {
    const book = this.getBook(bookId);
    const chapter = book.chapters.find((c) => c.chapterId === chapterId);
    if (!chapter) {
      return null;
    }

    const padStart = book.chapters.length > 100 ? 3 : 2;

    const bookFileName = book.id.toString().padStart(2, "0");
    const chapterFileName = `${chapterId.padStart(padStart, "0")}.html`;

    const filePath = path.join(this.basePath, bookFileName, chapterFileName);
    try {
      const content = await readFile(filePath, "utf-8");
      return content;
    } catch (e) {
      throw new Error(`Chapter file not found: ${filePath}, Erorr: ${(e as Error).message}`);
    }
  }

  getChapterTitle(params: Chapter): string {
    if (!this.mappingBook) {
      return this.primaryTitle;
    }
    const bookName = this.getBookName(Number(params.bookId));
    let chapterName: string | undefined;
    if (this.mappingChapterSlug) {
      chapterName = this.mappingChapterSlug[Number(params.chapterId)];
    } else {
      chapterName = params.chapterId === "0" ? this.introducingName : `${params.chapterId} ${this.chapterSlug}`;
    }
    return `${bookName}: ${chapterName}`;
  }
}
