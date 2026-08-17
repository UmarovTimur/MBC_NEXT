import { BibleViewMode, Book, Chapter } from "../model/types";
import { BibleConfig, BookName } from "../config";
import { buildChapterAudioUrl, hasChapterAudio } from "./audio";
import { formatOrdinal, stripLeadingOrdinal } from "./ordinal";

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
  /** Drives the ordinal suffix in chapter titles; undefined = no ordinals. */
  private readonly locale?: string;
  /** The chapter noun alone ("fəsil"); the ordinal suffix is computed per chapter. */
  private readonly chapterSlug: string;
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
    this.locale = config.locale;
    this.chapterSlug = stripLeadingOrdinal(config.chapterSlug ?? "");
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

  /** URL of this chapter's recording, or null if this bible has no audio. */
  getChapterAudioUrl(bookId: string, chapterId: string): string | null {
    if (!hasChapterAudio(this.bibleName)) return null;
    const book = this.getBook(bookId);
    if (!book?.chapters.some((c) => c.chapterId === chapterId)) return null;

    // Padding depends on the highest chapter number, not on chapters.length:
    // commentaries prepend an intro chapter "0", which would skew the count.
    const maxChapterId = Math.max(...book.chapters.map((c) => Number(c.chapterId)));
    return buildChapterAudioUrl(this.bibleName, bookId, chapterId, maxChapterId);
  }

  getChapterTitle(params: Chapter): string {
    if (this.bookNames.size === 0) {
      return this.primaryTitle;
    }
    const bookName = this.getBookName(Number(params.bookId));
    // An explicit name wins, but only per chapter: the arrays in the DB are
    // shorter than the books they cover (29 entries vs 150 psalms), so a missing
    // entry has to fall through to the computed form instead of rendering blank.
    let chapterName = this.mappingChapterSlug?.[Number(params.chapterId)];
    if (!chapterName) {
      if (params.chapterId === "0") {
        chapterName = this.introducingName;
      } else {
        const ordinal = formatOrdinal(Number(params.chapterId), this.locale);
        chapterName = `${ordinal} ${this.chapterSlug}`.trim();
      }
    }
    return `${bookName}: ${chapterName}`;
  }
}
