import az from "@/shared/config/bibles/az.json";
import type { BibleConfig } from "@mbc/bible-reader";

export type { BibleConfig };

export const BIBLES_CONFIG: Record<string, BibleConfig> = {
  ...az,
} as Record<string, BibleConfig>;
