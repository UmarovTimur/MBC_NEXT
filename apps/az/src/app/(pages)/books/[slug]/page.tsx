import { fetchBooks, fetchBookBySlug } from "@/shared/lib/payload";
import { mapPayloadBook, BookCard } from "@/entities/book";
import { BookDownloadsMenu } from "@/entities/book/ui/BookDownloadsMenu";
import { ContainerWidth } from "@/shared/ui/Container";
import { Button } from "@/shared/ui/button";
import { getI18n } from "@/app/providers/I18n/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

const OTHER_BOOKS_COUNT = 10;

export const revalidate = false;
export const dynamicParams = false;

type BookPageParams = {
  slug: string;
};

interface Props {
  params: Promise<BookPageParams>;
}

export async function generateStaticParams(): Promise<BookPageParams[]> {
  const raw = await fetchBooks();
  return raw.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = await fetchBookBySlug(decodeURIComponent(slug));
  if (!raw) return {};

  const book = mapPayloadBook(raw);
  const description = book.description || book.subtitle || book.author;

  return {
    title: book.title,
    description: description.slice(0, 160),
    openGraph: book.imageUrl ? { images: [book.imageUrl] } : undefined,
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { t } = getI18n();
  const { slug } = await params;
  const raw = await fetchBookBySlug(decodeURIComponent(slug));
  if (!raw) notFound();

  const book = mapPayloadBook(raw);

  const otherBooks = (await fetchBooks())
    .filter((doc) => doc.id !== book.id)
    .slice(0, OTHER_BOOKS_COUNT)
    .map(mapPayloadBook);

  return (
    <ContainerWidth>
      <div className="mx-auto lg:py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          {book.imageUrl && (
            <Image
              src={book.imageUrl}
              alt={book.title}
              width={256}
              height={341}
              className="h-auto w-full max-w-64 shrink-0 rounded object-contain self-start"
            />
          )}

          <div className="flex-1 lg:pt-4">
            {book.author && (
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {book.author}
              </p>
            )}
            <h1 className="mb-3 text-4xl font-black">{book.title}</h1>
            {book.subtitle && <p className="mb-4 text-lg italic text-muted-foreground">{book.subtitle}</p>}
            {/* {book.previewPages ? (
              <p className="mb-4 text-sm text-muted-foreground">Preview: {book.previewPages} pages</p>
            ) : null} */}

            <div className="flex flex-wrap gap-3">
              {book.readUrl && book.downloads.length > 0 ? (
                <div className="inline-flex">
                  <Button asChild className="rounded-r-none border-r-0">
                    <a href={book.readUrl} target="_blank" rel="noreferrer">
                      Oxu onlayn
                    </a>
                  </Button>
                  <BookDownloadsMenu downloads={book.downloads} className="rounded-l-none" />
                </div>
              ) : (
                <>
                  {book.readUrl ? (
                    <Button asChild >
                      <a href={book.readUrl} target="_blank" rel="noreferrer">
                        Oxu onlayn
                      </a>
                    </Button>
                  ) : null}

                  <BookDownloadsMenu downloads={book.downloads} />
                </>
              )}
              {book.description ? (
                <div className="mt-8 max-w-3xl">
                  <p className="whitespace-pre-line text-muted-foreground">{book.description}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* {book.description ? (
          <div className="mt-8 max-w-3xl">
            <p className="whitespace-pre-line text-muted-foreground">{book.description}</p>
          </div>
        ) : null} */}

        {otherBooks.length > 0 && (
          <div className="mt-12 border-t border-stone-200 pt-8 dark:border-white/10">
            <h2 className="mb-6 text-2xl font-bold font-(family-name:--font-roboto-condensed)">
              {t("bookOtherBooksTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {otherBooks.map((other) => (
                <BookCard key={other.id} book={other} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ContainerWidth>
  );
}
