import azBibles from "@/shared/config/bibles/az.json";
import azDict from "@/shared/config/dictionary/az.json";
import type { BibleConfig } from "@mbc/bible-reader/server";

export type { BibleConfig };

const { bible: bibleTranslations } = azDict;

export const BIBLES_CONFIG: Record<string, BibleConfig> = Object.fromEntries(
  Object.entries(azBibles).map(([name, cfg]) => [
    name,
    { ...cfg, ...bibleTranslations } as BibleConfig,
  ])
);
