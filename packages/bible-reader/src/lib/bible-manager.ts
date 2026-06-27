import { BibleManifest, Book, Chapter } from "../model/types";
import { BibleConfig } from "../config";
import { Bible } from "./bible";
import {
  BibleFetchOptions,
  fetchBibleDocs,
  fetchBookNames,
  fetchChapterHtml,
  fetchChapterRefs,
} from "./api";
import { readManifest, readChapterHtml, toBookNameMap } from "./file-api";

export class BibleManager {
  constructor(private bibles: Bible[]) { }

  /**
   * Build the manager entirely from the database (Payload REST API): bible
   * configs, canonical book names, and the chapter manifest. Chapter HTML is
   * lazy-loaded on demand.
   */
  static async initFromApi(
    apiBaseUrl: string,
    locale: string,
    fetchOptions?: BibleFetchOptions,
  ): Promise<BibleManager> {
    const [bibleDocs, bookNames, refs] = await Promise.all([
      fetchBibleDocs(apiBaseUrl, locale, fetchOptions),
      fetchBookNames(apiBaseUrl, locale, fetchOptions),
      fetchChapterRefs(apiBaseUrl, locale, fetchOptions),
    ]);

    const idToKey = new Map(bibleDocs.map((doc) => [doc.id, doc.bibleKey]));

    const configMap: Record<string, BibleConfig> = {};
    for (const doc of bibleDocs) {
      const attachmentId = typeof doc.attachment === "object" ? doc.attachment?.id : doc.attachment;
      configMap[doc.bibleKey] = {
        displayName: doc.displayName ?? undefined,
        primary: doc.primary,
        secondary: doc.secondary?.length ? doc.secondary : undefined,
        attachment: (attachmentId != null ? idToKey.get(attachmentId) : null) ?? null,
        defaultView: doc.defaultView,
        chapterSlug: doc.chapterSlug ?? undefined,
        // hasMany text fields come back as [] (not omitted) when unset.
        mappingChapterSlug: doc.mappingChapterSlug?.length ? doc.mappingChapterSlug : undefined,
        formattingStyle: doc.formattingStyle ?? undefined,
        introductionName: doc.introductionName ?? undefined,
        isIndependent: Boolean(doc.isIndependent),
        isCommentary: Boolean(doc.isCommentary),
      };
    }

    const contentLoader = (bible: string, bookNumber: string, chapterId: string) =>
      fetchChapterHtml(apiBaseUrl, bible, bookNumber, chapterId, fetchOptions);

    // Group chapter refs into bibleKey -> bookNumber -> chapters[].
    const byBible = new Map<string, Map<string, Chapter[]>>();
    for (const ref of refs) {
      const bibleKey = idToKey.get(ref.bible);
      if (!bibleKey) continue;

      let books = byBible.get(bibleKey);
      if (!books) {
        books = new Map<string, Chapter[]>();
        byBible.set(bibleKey, books);
      }
      const chapters = books.get(ref.bookNumber) ?? [];
      chapters.push({ bible: bibleKey, bookId: ref.bookNumber, chapterId: ref.chapterId });
      books.set(ref.bookNumber, chapters);
    }

    const bibles = [...byBible.entries()].map(([bibleName, bookMap]) => {
      const books: Book[] = [...bookMap.entries()]
        .map(([bookId, chapters]) => ({
          id: bookId,
          bible: bibleName,
          chapters: chapters.sort((a, b) => +a.chapterId - +b.chapterId),
        }))
        .sort((a, b) => +a.id - +b.id);

      const config = configMap[bibleName];
      if (!config) {
        throw new Error(`No Bibles config found for "${bibleName}" (locale "${locale}")`);
      }

      return new Bible(bibleName, books, config, bookNames, contentLoader);
    });

    return new BibleManager(bibles);
  }

  getManifest(): BibleManifest {
    return {
      bibles: this.bibles.map((bible: Bible) => ({
        bibleName: bible.bibleName,
        primary: bible.primaryTitle,
        isIndependent: bible.isIndependent,
        isCommentary: bible.isCommentary,
        books: bible.books.map((book: Book) => ({
          id: book.id,
          name: bible.getBookName(+book.id),
          chapters: book.chapters.map((c: Chapter) => c.chapterId),
        })),
      })),
    };
  }

  /**
   * Build the manager from local files (manifest.json + html/ directory).
   * Used as a fallback when the Payload API is not reachable (e.g. CI static builds).
   */
  static async initFromFiles(dataDir: string): Promise<BibleManager> {
    const manifest = await readManifest(dataDir);
    const bookNames = toBookNameMap(manifest.bookNames);

    const contentLoader = (bible: string, bookNumber: string, chapterId: string) =>
      readChapterHtml(dataDir, bible, bookNumber, chapterId);

    const byBible = new Map<string, Map<string, Chapter[]>>();
    for (const ref of manifest.chapters) {
      let books = byBible.get(ref.bible);
      if (!books) {
        books = new Map<string, Chapter[]>();
        byBible.set(ref.bible, books);
      }
      const chapters = books.get(ref.bookNumber) ?? [];
      chapters.push({ bible: ref.bible, bookId: ref.bookNumber, chapterId: ref.chapterId });
      books.set(ref.bookNumber, chapters);
    }

    const bibles = manifest.bibles.map((def) => {
      const books: Book[] = [...(byBible.get(def.bibleKey)?.entries() ?? [])]
        .map(([bookId, chapters]) => ({
          id: bookId,
          bible: def.bibleKey,
          chapters: chapters.sort((a, b) => +a.chapterId - +b.chapterId),
        }))
        .sort((a, b) => +a.id - +b.id);

      const config: BibleConfig = {
        primary: def.primary,
        attachment: def.attachment,
        defaultView: def.defaultView,
        chapterSlug: def.chapterSlug,
        mappingChapterSlug: def.mappingChapterSlug,
        formattingStyle: def.formattingStyle,
        introductionName: def.introductionName,
        isIndependent: def.isIndependent,
        isCommentary: def.isCommentary,
      };

      return new Bible(def.bibleKey, books, config, bookNames, contentLoader);
    });

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
    return bible.books.map((b) => bible.getBookName(+b.id));
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
