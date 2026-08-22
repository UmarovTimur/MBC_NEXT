import { getI18n } from "@/app/providers/I18n/server";
import { WordList } from "@/widgets/Symphony";
import { fetchWordsForLetter } from "@/widgets/Symphony/lib/fetchWordsForLetter";
import { AZ_ALPHABET } from "@mbc/bible-verses";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return AZ_ALPHABET.map((_, i) => ({ num: String(i + 1) }));
}

/** 1-based position in {@link AZ_ALPHABET}, or null if `raw` isn't a valid one. */
function letterFromNumParam(raw: string): string | null {
  const num = Number(raw);
  if (!Number.isInteger(num)) return null;
  return AZ_ALPHABET[num - 1] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ num: string }>;
}): Promise<Metadata> {
  const { t } = getI18n();
  const letter = letterFromNumParam((await params).num);
  if (!letter) return {};
  return { title: `${letter.toLocaleUpperCase("az")} — ${t("symphonyTitle")}` };
}

export default async function SymphonyLetterPage({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { t } = getI18n();
  const letter = letterFromNumParam((await params).num);

  if (!letter) {
    notFound();
  }

  const { total, words } = await fetchWordsForLetter(letter);

  return (
    <WordList
      letter={letter}
      words={words}
      totalLabel={`${total} ${t("symphonyResultsSuffix")}`}
      backLabel={t("symphonyBackToLetters")}
      emptyLabel={t("symphonyEmptyLetter")}
      filterPlaceholder={t("symphonyFilterPlaceholder")}
      noMatchLabel={t("symphonyNoMatches")}
    />
  );
}
