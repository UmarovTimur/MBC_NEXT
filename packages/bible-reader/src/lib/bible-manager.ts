import path from "node:path";
import { readdir } from "node:fs/promises";
import { BibleManifest, Book, Chapter } from "../model/types";
import { BibleConfig } from "../config";
import { Bible } from "./bible";

export class BibleManager {
  constructor(private bibles: Bible[]) { }

  static async init(rootDir: string, configMap: Record<string, BibleConfig>): Promise<BibleManager> {
    const entries = await readdir(rootDir, { withFileTypes: true });

    const biblePromises = entries
      .filter((e) => e.isDirectory())
      .map((e) => Bible.init(path.join(rootDir, e.name), configMap));

    const bibles = await Promise.all(biblePromises);

    return new BibleManager(bibles);
  }

  getManifest(): BibleManifest {
    return {
      bibles: this.bibles.map((bible: Bible) => ({
        bibleName: bible.bibleName,
        books: bible.books.map((book: Book) => ({
          id: book.id,
          name: bible.getBookName(+book.id),
          chapters: book.chapters.map((c: Chapter) => c.chapterId),
        })),
      })),
    };
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

  traverseChapter(fn: (params: Chapter) => void) {
    for (const bible of this.bibles) {
      for (const book of bible.books) {
        for (let i = 0; i < book.chapters.length; i++) {
          fn(book.chapters[i]);
        }
      }
    }
  }

  traverseBooks(fn: (params: Book) => void) {
    for (const bible of this.bibles) {
      for (const book of bible.books) {
        fn(book);
      }
    }
  }

  getBooksNames(bibleName: string): string[] {
    const bible = this.getBible(bibleName);
    return bible.books.map((b) => bible.mappingBook?.[+b.id] ?? b.id);
  }

  async getChapterContent(params: Chapter): Promise<string | null> {
    const bible = this.getBible(params.bible);
    if (!bible) return null;

    return await bible.getChapterContent(params.bookId, params.chapterId);
  }

  getBook(bible: string, bookId: string): Book | null {
    const bibleObj = this.getBible(bible);
    if (!bibleObj) return null;

    return bibleObj.books.find((b) => b.id === bookId) || null;
  }

  private getBibleContext(params: Chapter) {
    const bible = this.getBible(params.bible);
    if (!bible) return null;

    const bookIndex = bible.books.findIndex((b) => b.id.toString() === params.bookId);
    if (bookIndex === -1) return null;

    const book = bible.books[bookIndex];
    const chapterIndex = book.chapters.findIndex((c) => c.chapterId === params.chapterId);
    if (chapterIndex === -1) return null;

    return { bible, bookIndex, book, chapterIndex };
  }

  getNextChapter(params: Chapter): Chapter | null {
    const ctx = this.getBibleContext(params);
    if (!ctx) return null;

    const { bible, bookIndex, book, chapterIndex } = ctx;

    if (chapterIndex < book.chapters.length - 1) {
      return {
        bible: params.bible,
        bookId: params.bookId,
        chapterId: book.chapters[chapterIndex + 1].chapterId,
      };
    }

    const nextBook = bible.books[bookIndex + 1];
    if (nextBook && nextBook.chapters.length > 0) {
      return {
        bible: params.bible,
        bookId: nextBook.id,
        chapterId: nextBook.chapters[0].chapterId,
      };
    }

    return null;
  }

  getPrevChapter(params: Chapter): Chapter | null {
    const ctx = this.getBibleContext(params);
    if (!ctx) return null;

    const { bible, bookIndex, book, chapterIndex } = ctx;

    if (chapterIndex > 0) {
      return {
        bible: params.bible,
        bookId: params.bookId,
        chapterId: book.chapters[chapterIndex - 1].chapterId,
      };
    }

    const prevBook = bible.books[bookIndex - 1];
    if (prevBook && prevBook.chapters.length > 0) {
      const lastChapter = prevBook.chapters.at(-1);
      if (lastChapter) {
        return {
          bible: params.bible,
          bookId: prevBook.id,
          chapterId: lastChapter.chapterId,
        };
      }
    }

    return null;
  }
}
