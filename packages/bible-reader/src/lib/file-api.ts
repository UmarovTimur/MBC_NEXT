import { readFile } from "fs/promises";
import path from "path";
import { BibleConfig, BookName } from "../config";

export type FileManifestBible = {
  bibleKey: string;
  primary: string;
  attachment: string | null;
  defaultView: BibleConfig["defaultView"];
  locale?: string;
  chapterSlug?: string;
  mappingChapterSlug?: string[];
  formattingStyle?: string;
  introductionName?: string;
  isIndependent?: boolean;
  isCommentary?: boolean;
};

export type FileManifest = {
  bibles: FileManifestBible[];
  bookNames: Array<{ bookId: string; name: string; shortName?: string }>;
  /** `bible` is the bibleKey string, not a numeric Payload id */
  chapters: Array<{ bible: string; bookNumber: string; chapterId: string }>;
};

export function toBookNameMap(
  entries: FileManifest["bookNames"],
): Map<string, BookName> {
  return new Map(
    entries.map((b) => [b.bookId, { name: b.name, shortName: b.shortName }]),
  );
}

export async function readManifest(htmlDir: string): Promise<FileManifest> {
  const raw = await readFile(path.join(htmlDir, "manifest.json"), "utf-8");
  return JSON.parse(raw) as FileManifest;
}

export async function readChapterHtml(
  htmlDir: string,
  bibleKey: string,
  bookNumber: string,
  chapterId: string,
): Promise<string | null> {
  // Files use zero-padded names: two digits (01.html, 00.html), three in books
  // with 100+ chapters (Psalms: 001.html … 150.html).
  const names = new Set([chapterId.padStart(2, "0"), chapterId.padStart(3, "0"), chapterId]);
  for (const name of names) {
    try {
      return await readFile(path.join(htmlDir, bibleKey, bookNumber, `${name}.html`), "utf-8");
    } catch {
      continue;
    }
  }
  return null;
}
