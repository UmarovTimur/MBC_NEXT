import type { PayloadBook } from "@/shared/lib/payload";

export type Book = {
  id: number;
  slug: string;
  title: string;
  author: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  readUrl: string;
  previewPages: number | null;
  downloads: {
    format: string;
    label: string;
    fileSize: string;
    description: string;
    url: string;
    sortOrder: number | null;
  }[];
};

function resolveImageUrl(url?: string | null): string {
  if (!url) return "";

  try {
    return new URL(url).toString();
  } catch {
    const base = process.env.PAYLOAD_API_URL;
    if (!base) return url;

    try {
      return new URL(url, base).toString();
    } catch {
      return url;
    }
  }
}

export function mapPayloadBook(doc: PayloadBook): Book {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    author: doc.author ?? "",
    subtitle: doc.subtitle ?? "",
    description: doc.description ?? "",
    imageUrl: resolveImageUrl(doc.coverImage?.url ?? doc.coverImageUrl),
    readUrl: doc.readUrl ?? "",
    previewPages: typeof doc.previewPages === "number" ? doc.previewPages : null,
    downloads: (doc.downloads ?? [])
      .slice()
      .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
      .map((download) => ({
        format: download.format,
        label: download.label,
        fileSize: download.fileSize ?? "",
        description: download.description ?? "",
        url: download.url,
        sortOrder: download.sortOrder ?? null,
      })),
  };
}
