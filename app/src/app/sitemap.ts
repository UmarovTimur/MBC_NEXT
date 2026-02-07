import type { Book } from "@/entities/bible";
import type { Bible } from "@/entities/bible/lib/bible";
import { bibleManager } from "@/entities/bible/server";
import { MetadataRoute } from "next";
import path from "node:path";
import { stat } from "node:fs/promises";

export const dynamic = "force-static";

const ZERO_DATE = new Date(0);

const getChapterFilePath = (bible: Bible, book: Book, chapterId: string) => {
  const padStart = book.chapters.length > 100 ? 3 : 2;
  const bookFileName = book.id.toString().padStart(2, "0");
  const chapterFileName = `${chapterId.padStart(padStart, "0")}.html`;

  return path.join(bible.basePath, bookFileName, chapterFileName);
};

const getLastModified = async (filePath: string) => {
  try {
    const fileStat = await stat(filePath);
    return fileStat.mtime;
  } catch {
    return ZERO_DATE;
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const manager = bibleManager;
  if (!manager) return [];

  const domain = "https://kitobook.com";
  const baseName = "/mcdonald";
  const baseURL = `${domain}${baseName}`;

  const biblePages: MetadataRoute.Sitemap = [];
  let latestModified = ZERO_DATE;

  for (const bible of manager.getAll()) {
    for (const book of bible.books) {
      for (const chapter of book.chapters) {
        const chapterPath = `${chapter.bible}/${chapter.bookId}/${chapter.chapterId}`

        const filePath = getChapterFilePath(bible, book, chapter.chapterId);
        const lastModified = await getLastModified(filePath);

        if (lastModified.getTime() > latestModified.getTime()) {
          latestModified = lastModified;
        }

        biblePages.push({
          url: `${baseURL}/${chapterPath}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseURL}/`,
      lastModified: latestModified.getTime() > 0 ? latestModified : undefined,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  return [...staticPages, ...biblePages];
}
