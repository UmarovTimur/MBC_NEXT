import { fetchBooks, fetchBookBySlug } from "@/shared/lib/wp";
import { mapWpBook } from "@/entities/book";
import { ContainerWidth } from "@/shared/ui/Container";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categoryId = Number(process.env.WP_BOOKS_CATEGORY_ID);
  const raw = await fetchBooks(categoryId);
  return raw.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = await fetchBookBySlug(slug);
  if (!raw) return {};
  const book = mapWpBook(raw);
  return {
    title: book.title,
    description: book.description.replace(/<[^>]+>/g, "").trim().slice(0, 160),
    openGraph: book.imageUrl ? { images: [book.imageUrl] } : undefined,
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const raw = await fetchBookBySlug(slug);
  if (!raw) notFound();

  const book = mapWpBook(raw);

  return (
    <ContainerWidth>
      <div className="max-w-2xl mx-auto py-8">
        {book.imageUrl && (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full max-h-96 object-cover rounded-lg mb-6"
          />
        )}
        <h1
          className="text-3xl font-black mb-4"
          dangerouslySetInnerHTML={{ __html: book.title }}
        />
        <div
          className="prose prose-zinc dark:prose-invert [&>p]:mb-4"
          dangerouslySetInnerHTML={{ __html: book.content }}
        />
      </div>
    </ContainerWidth>
  );
}
