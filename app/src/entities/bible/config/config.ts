import { AZ_BOOKS_NAMES } from "../model/mapping";
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
  barclay: {
    primary: "Barclay şərhləri",
    attachment: "azb",
    defaultView: "split-screen",
    mappingBible: AZ_BOOKS_NAMES,
    chapterSlug: "-ci fəsil",
    introductionName: "Giriş",
  },
  azb: {
    primary: `Azərbaycan dilində\nMüqəddəs Kitab`,
    defaultView: "single-column",
    attachment: null,
  },
};
