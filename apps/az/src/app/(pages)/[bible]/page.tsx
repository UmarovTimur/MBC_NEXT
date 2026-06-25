import { bibleManager } from "@/entities/bible/server";
import { BibleOverviewPage } from "@/widgets/BibleOverviewPage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = false;

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
  return { title: bible.primaryTitle };
}

export default async function BibleOverviewPageRoute({ params }: Props) {
  const { bible: bibleName } = await params;
  const bible = bibleManager.getAll().find((b) => b.bibleName === bibleName);
  if (!bible?.isIndependent) notFound();

  return <BibleOverviewPage bibleName={bibleName} bible={bible} />;
}
