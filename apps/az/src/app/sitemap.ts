import { bibleManager } from "@/entities/bible/server";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const manager = bibleManager;
  if (!manager) return [];

  const domain = process.env.DOMAIN || "https://kitobook.com";
  const baseName = process.env.BASE_PATH || "";
  const baseURL = `${domain}${baseName}`;

  // Content now lives in the database; use the build time as the freshness hint.
  const lastModified = new Date();

  const biblePages: MetadataRoute.Sitemap = [];

  for (const bible of manager.getAll()) {
    for (const book of bible.books) {
      for (const chapter of book.chapters) {
        const chapterPath = `${chapter.bible}/${chapter.bookId}/${chapter.chapterId}`;

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
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  return [...staticPages, ...biblePages];
}
