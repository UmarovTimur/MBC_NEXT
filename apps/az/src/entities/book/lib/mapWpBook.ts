import type { WpBook } from "@/shared/lib/wp";

export type Book = {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
};

export function mapWpBook(post: WpBook): Book {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title.rendered,
    description: post.excerpt.rendered,
    content: post.content.rendered,
    imageUrl: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "",
  };
}
