import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { Bible } from "@/entities/bible/lib/bible";
import { Book, Chapter } from "../model/types";
import { HTML_SRC_DIR } from "@/shared/config/paths";

class BibleManager {
  // private static cache = new Map<string, Bible>();

  constructor(private bibles: Bible[]) {}

  static async init(rootDir: string): Promise<BibleManager | null> {
    try {
      // Get all bibles files
      const entries = await readdir(rootDir, { withFileTypes: true });

      // Sort only directories and init Bible class
      const biblePromises = entries.filter((e) => e.isDirectory()).map((e) => Bible.init(path.join(rootDir, e.name)));

      // Await all bibles and remove nulls
      const bibles = (await Promise.all(biblePromises)).filter((b): b is Bible => b !== null);

      return new BibleManager(bibles);
    } catch (e) {
      console.error(`Can\'t open Bibles directory: ${rootDir} ERROR: `, (e as Error).message);
      return null;
    }
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
        for (const chapter of book.chapters) {
          fn(chapter);
        }
      }
    }
  }

  // Go through all chapters number 0
  traversBooks(fn: (params: Book) => void) {
    for (const bible of this.bibles) {
      for (const book of bible.books) {
        fn(book);
      }
    }
  }

  async getChapterContent(params: Chapter): Promise<string | null> {

    // Find bible 
    const bible = this.getBible(params.bible)
    if (!bible) return null;
    
    // Find book
    const book = bible.books.find(b => b.id.toString() === params.bookId);
    if (!book) return null;
    
    //Find chapter
    const chapter = book.chapters.find(c => c.chapterId === params.chapterId);
    if (!chapter) return null;

    // Create path
    const bibleFileName = bible.bibleName; 
    const bookFileName = book.id.toString().padStart(2, "0");
    const chapterFileName = `${chapter.chapterId.padStart(2, "0")}.html`;

    const filePath = path.join(HTML_SRC_DIR, bibleFileName, bookFileName, chapterFileName);

    try {
      const content = await readFile(filePath, "utf-8");
      return content;
    } catch (e) {
      console.error(`Error reading file ${filePath}:`, e);
      return null;
    }
  }
}

export const bibleManager = await BibleManager.init(HTML_SRC_DIR);
