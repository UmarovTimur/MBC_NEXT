import { bibleManager } from "@/entities/bible/server";
import { fetchBooks } from "@/shared/lib/payload";
import { AZ_ALPHABET } from "@mbc/bible-verses";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const manager = bibleManager;
  if (!manager) return [];

  const domain = (process.env.DOMAIN || "https://kitobook.com").replace(/\/+$/, "");
  const baseName = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "";
  const baseURL = `${domain}${baseName}`;

  // lastModified is only set where a real edit date exists (chapters, books);
  // aggregate pages omit it rather than claim a date that isn't true.
  const biblePages: MetadataRoute.Sitemap = [];

  for (const bible of manager.getAll()) {
    for (const book of bible.books) {
      for (const chapter of book.chapters) {
        const chapterPath = `${chapter.bible}/${chapter.bookId}/${chapter.chapterId}`;
        const updatedAt = manager.getChapterUpdatedAt(chapter.bible, chapter.bookId, chapter.chapterId);

        biblePages.push({
          url: `${baseURL}/${chapterPath}/`,
          ...(updatedAt && { lastModified: new Date(updatedAt) }),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  const overviewPages: MetadataRoute.Sitemap = manager
    .getAll()
    .filter((bible) => bible.isIndependent)
    .map((bible) => ({
      url: `${baseURL}/${bible.bibleName}/`,
      changeFrequency: "monthly",
      priority: 0.9,
    }));

  const books = await fetchBooks();
  const bookPages: MetadataRoute.Sitemap = [
    { url: `${baseURL}/books/`, changeFrequency: "weekly", priority: 0.8 },
    ...books.map((book) => ({
      url: `${baseURL}/books/${book.slug}/`,
      ...(book.updatedAt && { lastModified: new Date(book.updatedAt) }),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const symphonyPages: MetadataRoute.Sitemap = [
    { url: `${baseURL}/simfoniya/`, changeFrequency: "yearly", priority: 0.5 },
    ...AZ_ALPHABET.map((_, i) => ({
      url: `${baseURL}/simfoniya/${i + 1}/`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseURL}/`, changeFrequency: "weekly", priority: 1 },
  ];

  return [...staticPages, ...overviewPages, ...bookPages, ...symphonyPages, ...biblePages];
}
