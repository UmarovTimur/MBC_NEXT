import { fetchBooks, fetchBookBySlug } from "@/shared/lib/payload";
import { mapPayloadBook } from "@/entities/book";
import { lexicalToHtml } from "@/shared/lib/lexical";
import { ContainerWidth } from "@/shared/ui/Container";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const raw = await fetchBooks();
  return raw.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = await fetchBookBySlug(decodeURIComponent(slug));
  if (!raw) return {};
  const book = mapPayloadBook(raw);
  return {
    title: book.title,
    description: book.excerpt.slice(0, 160),
    openGraph: book.imageUrl ? { images: [book.imageUrl] } : undefined,
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const raw = await fetchBookBySlug(decodeURIComponent(slug));
  if (!raw) notFound();

  const book = mapPayloadBook(raw);
  const html = lexicalToHtml(book.content);
  console.log(book.imageUrl)

  return (
    <ContainerWidth>
      <div className="flex gap-5 mx-auto py-8">
        {book.imageUrl && (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-48 shrink-0 rounded object-contain self-start"
          />
        )}
        <div className="lg:pt-4">
          <h1 className="text-3xl font-black mb-4">{book.title}</h1>
          {html ? (
            <div
              className="prose prose-zinc dark:prose-invert [&>p]:mb-4 [&_a]:text-blue-500 [&_a]:underline hover:[&_a]:text-blue-400"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : book.excerpt ? (
            <p className="text-muted-foreground">{book.excerpt}</p>
          ) : null}
        </div>
      </div>
    </ContainerWidth>
  );
}
