import { bibleManager } from "@/entities/bible/server";
import { BibleOverviewPage } from "@/widgets/BibleOverviewPage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = false;
// Only the bibles from generateStaticParams exist. Any other first path segment
// (scanner noise like "/%2f/", "/wp-login.php/") must be a real 404 instead of a
// 200 page cached forever; "/%2f/" even ended up in the home page's cache entry.
export const dynamicParams = false;

interface Props {
  params: Promise<{ bible: string }>;
}

export async function generateStaticParams() {
  return bibleManager
    .getAll()
    .filter((bible) => bible.isIndependent)
    .map((bible) => ({ bible: bible.bibleName }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bible: bibleName } = await params;
  const bible = bibleManager.getAll().find((b) => b.bibleName === bibleName);
  if (!bible?.isIndependent) return {};
  const description =
    bible.bibleName === "barclay"
      ? `${bible.primaryTitle} — ${bible.books.length} kitab üzrə Azərbaycan dilində şərhlər. Pulsuz onlayn oxu.`
      : `${bible.primaryTitle} — ${bible.books.length} kitab, Azərbaycan dilində pulsuz onlayn oxu.`;
  return { title: bible.primaryTitle, description };
}

export default async function BibleOverviewPageRoute({ params }: Props) {
  const { bible: bibleName } = await params;
  const bible = bibleManager.getAll().find((b) => b.bibleName === bibleName);
  if (!bible?.isIndependent) notFound();

  return <BibleOverviewPage bibleName={bibleName} bible={bible} />;
}
