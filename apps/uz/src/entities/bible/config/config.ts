import uz from "@/shared/config/bibles/uz.json";
import type { BibleConfig } from "@mbc/bible-reader/server";

export type { BibleConfig };

export const BIBLES_CONFIG: Record<string, BibleConfig> = {
  ...uz,
} as Record<string, BibleConfig>;
