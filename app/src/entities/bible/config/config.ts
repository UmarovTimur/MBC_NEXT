import { UZ_BOOKS_NAMES } from "../model/mapping";
import { BibleViewMode } from "../model/types";

export interface BibleConfig {
  primary: string;
  attachment: string | null;
  defaultView: BibleViewMode;
  mappingBible?: string[];
}

export const BIBLES_CONFIG: Record<string, BibleConfig> = {
  mbc: {
    primary: "mbc",
    attachment: "muqaddas-kitob",
    defaultView: "split-screen",
    mappingBible: UZ_BOOKS_NAMES,
  },
  "muqaddas-kitob": {
    primary: "muqaddas-kitob",
    attachment: null,
    defaultView: "single-column",
  },
  barclay: {
    primary: "barclay",
    attachment: "azb",
    defaultView: "split-screen",
  },
};
