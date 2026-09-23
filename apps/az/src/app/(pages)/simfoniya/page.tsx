import { getI18n } from "@/app/providers/I18n/server";
import { LetterGrid } from "@/widgets/Symphony";
import { fetchLetters } from "@/widgets/Symphony/lib/fetchLetters";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  const { t } = getI18n();
  return { title: t("symphonyTitle"), description: t("symphonyDescription") };
}

export default async function SymphonyPage() {
  const { t } = getI18n();
  const letters = await fetchLetters();

  return (
    <LetterGrid
      title={t("symphonyTitle")}
      description={t("symphonyDescription")}
      letters={letters}
      wordCountSuffix={t("symphonyWordCountSuffix")}
    />
  );
}
