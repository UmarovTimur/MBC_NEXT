import type { PayloadBook } from "@/shared/lib/payload";

export type Book = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: unknown;
  imageUrl: string;
};

export function mapPayloadBook(doc: PayloadBook): Book {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt ?? '',
    content: doc.content,
    imageUrl: doc.coverImage?.url ?? '',
  };
}
