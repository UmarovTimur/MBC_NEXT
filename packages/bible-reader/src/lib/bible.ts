import { BibleViewMode, Book, Chapter } from "../model/types";
import { BibleConfig, BookName } from "../config";

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
  private readonly chapterSlug?: string;
  private readonly mappingChapterSlug?: string[];
  private readonly introducingName?: string;
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
    this.chapterSlug = config.chapterSlug ?? "";
    this.mappingChapterSlug = config.mappingChapterSlug;
    this.introducingName = config.introductionName ?? this.mappingChapterSlug?.[0] ?? "0";
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
    return this.introducingName || undefined;
  }

  async getChapterContent(bookId: string, chapterId: string): Promise<string | null> {
    const book = this.getBook(bookId);
    if (!book) return null;
    const chapter = book.chapters.find((c) => c.chapterId === chapterId);
    if (!chapter) return null;
    return this.contentLoader(this.bibleName, bookId, chapterId);
  }

  getChapterTitle(params: Chapter): string {
    if (this.bookNames.size === 0) {
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
