import type { PayloadBook } from "@/shared/lib/payload";

export type Book = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: unknown;
  imageUrl: string;
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
    excerpt: doc.excerpt ?? '',
    content: doc.content,
    imageUrl: resolveImageUrl(doc.coverImage?.url),
  };
}
