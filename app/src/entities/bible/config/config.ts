import { UZ_BOOKS_NAMES } from "../model/mapping";
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
  "muqaddas-kitob": {
    defaultView: "single-column",
    primary: "Muqaddas Kitob ONLINE",
    mappingBible: UZ_BOOKS_NAMES,
    chapterSlug: "Bob",
    introductionName: "Kirish",
    attachment: null,
  },
  mbc: {
    primary: `Azərbaycan dilində\nMüqəddəs Kitab`,
    mappingBible: UZ_BOOKS_NAMES,
    chapterSlug: "Bob",
    defaultView: "split-screen",
    introductionName: "Kirish",
    attachment: "muqaddas-kitob",
  },
};
