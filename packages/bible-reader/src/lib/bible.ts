import { BibleViewMode, Book, Chapter } from "../model/types";
import { BibleConfig, BookName } from "../config";
import { resolveChapterAudioUrl } from "./audio";
import { type ChapterNaming, formatChapterName } from "./chapter-name";
import { stripLeadingOrdinal } from "./ordinal";

/** Loads the raw HTML for a chapter from the data source (DB via REST API). */
export type ChapterContentLoader = (
  bible: string,
  bookId: string,
  chapterId: string,
) => Promise<string | null>;

export class Bible {
  public readonly bibleName: string;
  public readonly books: Book[];
  public readonly defaultViewMode: BibleViewMode;
  public readonly attachmentBibleName: string;
  public readonly formattingStyle: string;
  public readonly primaryTitle: string;
  public readonly isIndependent: boolean;
  public readonly isCommentary: boolean;
  /** Canonical book names for this bible's locale, shared across all bibles of that locale. */
  private readonly bookNames: Map<string, BookName>;
  /** How chapters are labelled; shipped in the manifest so the client can label them too. */
  public readonly chapterNaming: ChapterNaming;
  private readonly contentLoader: ChapterContentLoader;

  constructor(
    bibleName: string,
    books: Book[],
    config: BibleConfig,
    bookNames: Map<string, BookName>,
    contentLoader: ChapterContentLoader,
  ) {
    this.bibleName = bibleName;
    this.books = books;
    this.bookNames = bookNames;
    this.contentLoader = contentLoader;
    this.defaultViewMode = config.defaultView || "single-column";
    this.attachmentBibleName = config.attachment || "";
    this.formattingStyle = config.formattingStyle || "";
    this.primaryTitle = config.primary;
    this.isIndependent = Boolean(config.isIndependent);
    this.isCommentary = Boolean(config.isCommentary);
    this.chapterNaming = {
      locale: config.locale,
      slug: stripLeadingOrdinal(config.chapterSlug ?? ""),
      mapping: config.mappingChapterSlug,
      introducingName: config.introductionName ?? config.mappingChapterSlug?.[0] ?? "0",
    };
  }

  private getBook(bookId: string): Book | null {
    return this.books.find((b) => b.id === bookId) ?? null;
  }

  getBookName(bookId: number): string {
    const key = String(bookId).padStart(2, "0");
    return this.bookNames.get(key)?.name ?? bookId.toString();
  }

  getShortBookName(bookId: number): string {
    const key = String(bookId).padStart(2, "0");
    return this.bookNames.get(key)?.shortName || this.getBookName(bookId);
  }

  getIntroducingName(): string | undefined {
    return this.chapterNaming.introducingName || undefined;
  }

  async getChapterContent(bookId: string, chapterId: string): Promise<string | null> {
    const book = this.getBook(bookId);
    if (!book) return null;
    const chapter = book.chapters.find((c) => c.chapterId === chapterId);
    if (!chapter) return null;
    return this.contentLoader(this.bibleName, bookId, chapterId);
  }

  /** URL of this chapter's recording, or null if this bible has no audio. */
  getChapterAudioUrl(bookId: string, chapterId: string): string | null {
    const book = this.getBook(bookId);
    if (!book) return null;
    return resolveChapterAudioUrl(
      this.bibleName,
      bookId,
      book.chapters.map((c) => c.chapterId),
      chapterId,
    );
  }

  getChapterTitle(params: Chapter): string {
    if (this.bookNames.size === 0) {
      return this.primaryTitle;
    }
    const bookName = this.getBookName(Number(params.bookId));
    const chapterName = formatChapterName(this.chapterNaming, params.chapterId);
    return `${bookName}: ${chapterName}`;
  }
}
