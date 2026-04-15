import { bibleManager } from "@/entities/bible/server";
import { BIBLES_CONFIG } from "@/entities/bible/config/config";
import { BibleOverviewPage } from "@/widgets/BibleOverviewPage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = false;

interface Props {
  params: Promise<{ bible: string }>;
}

export async function generateStaticParams() {
  return Object.entries(BIBLES_CONFIG)
    .filter(([, cfg]) => cfg.isIndependent)
    .map(([bibleName]) => ({ bible: bibleName }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bible } = await params;
  const cfg = BIBLES_CONFIG[bible];
  if (!cfg?.isIndependent) return {};
  return { title: cfg.primary };
}

export default async function BibleOverviewPageRoute({ params }: Props) {
  const { bible: bibleName } = await params;
  const cfg = BIBLES_CONFIG[bibleName];
  if (!cfg?.isIndependent) notFound();

  const bible = bibleManager.getBible(bibleName);

  return <BibleOverviewPage bibleName={bibleName} cfg={cfg} bible={bible} />;
}
