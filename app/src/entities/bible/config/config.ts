import uz from "@/shared/config/bibles/uz.json";
import az from "@/shared/config/bibles/az.json";
import { BibleViewMode } from "../model/types";

export interface BibleConfig {
  primary: string;
  secondary?: string[];
  attachment: string | null;
  defaultView: BibleViewMode;
  mappingBible?: string[];
  chapterSlug?: string;
  formatingStyle?: string;
  introductionName?: string;
  isIndependent?: boolean;
}

export const BIBLES_CONFIG: Record<string, BibleConfig> = {
  ...uz,
  ...az,
} as Record<string, BibleConfig>;
