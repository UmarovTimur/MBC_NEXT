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

  getAll() {
    return this.bibles;
  }

  getBible(bible: string) {
    return this.bibles.find((b) => b.bibleName === bible);
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
  
}

export const bibleManager = await BibleManager.init(HTML_SRC_DIR);
