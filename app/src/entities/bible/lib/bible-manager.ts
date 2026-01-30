import path from "node:path";
import { readdir } from "node:fs/promises";
import { Book, Chapter } from "../model/types";
import { HTML_SRC_DIR } from "@/shared/config/paths";
import { Bible } from "./bible";

export class BibleManager {
  // private static cache = new Map<string, Bible>();

  constructor(private bibles: Bible[]) {}

  static async init(rootDir: string): Promise<BibleManager> {
    // Get all bibles files
    const entries = await readdir(rootDir, { withFileTypes: true });

    // Sort only directories and init Bible class
    const biblePromises = entries.filter((e) => e.isDirectory()).map((e) => Bible.init(path.join(rootDir, e.name)));

    // Await all bibles and remove nulls
    const bibles = await Promise.all(biblePromises);

    return new BibleManager(bibles);
  }

  getAll(): Bible[] {
    return this.bibles;
  }

  getBible(bible: string): Bible {
    const res = this.bibles.find((b) => b.bibleName === bible);
    if (!res) {
      throw new Error(`Bible "${bible}" not found in BibleManager`);
    }
    return res;
  }

  // Go through all chapters
  traverseChapter(fn: (params: Chapter) => void) {
    for (const bible of this.bibles) {
      for (const book of bible.books) {
        for (let i = 1; i < book.chapters.length; i++) {
          fn(book.chapters[i]);
        }
      }
    }
  }

  // Go through all chapters number 0
  traverseBooks(fn: (params: Book) => void) {
    for (const bible of this.bibles) {
      for (const book of bible.books) {
        fn(book);
      }
    }
  }

  async getChapterContent(params: Chapter): Promise<string | null> {
    // Find bible
    const bible = this.getBible(params.bible);
    if (!bible) return null;

    return await bible.getChapterContent(params.bookId, params.chapterId);
  }

  getBook(bible: string, bookId: string): Book | null {
    const bibleObj = this.getBible(bible);
    if (!bibleObj) return null;

    const bookIdNum = Number(bookId);
    const book = bibleObj.books.find((b) => b.id === bookIdNum) || null;

    return book;
  }

  getNextChapter(params: Chapter): Chapter | null {
    const book = this.getBook(params.bible, params.bookId);
    if (!book) return null;

    if (+params.chapterId + 1 < book.chapters.length) {
      return {
        bible: params.bible,
        bookId: params.bookId,
        chapterId: book.chapters[+params.chapterId + 1].chapterId,
      };
    } else {
      // Go to next book
      const nextBook = this.getBook(params.bible, (Number(params.bookId) + 1).toString());
      if (!nextBook || !nextBook.chapters.length) return null;

      return {
        bible: params.bible,
        bookId: nextBook.id.toString(),
        chapterId: nextBook.chapters[0].chapterId,
      };
    }
  }
}

export const bibleManager = await BibleManager.init(HTML_SRC_DIR);
