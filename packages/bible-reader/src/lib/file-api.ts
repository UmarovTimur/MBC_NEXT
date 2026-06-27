import { readFile } from "fs/promises";
import path from "path";
import { BibleConfig, BookName } from "../config";

export type FileManifestBible = {
  bibleKey: string;
  primary: string;
  attachment: string | null;
  defaultView: BibleConfig["defaultView"];
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

export async function readManifest(dataDir: string): Promise<FileManifest> {
  const raw = await readFile(path.join(dataDir, "manifest.json"), "utf-8");
  return JSON.parse(raw) as FileManifest;
}

export async function readChapterHtml(
  dataDir: string,
  bibleKey: string,
  bookNumber: string,
  chapterId: string,
): Promise<string | null> {
  const filePath = path.join(
    dataDir,
    "html",
    bibleKey,
    bookNumber,
    `${chapterId}.html`,
  );
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}
