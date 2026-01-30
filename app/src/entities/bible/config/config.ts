import { UZ_BOOKS_NAMES } from "../model/mapping";
import { BibleViewMode } from "../model/types";

export interface BibleConfig {
  primary: string;
  secondary?: string[];
  attachment: string | null;
  defaultView: BibleViewMode;
  mappingBible?: string[];
}

export const BIBLES_CONFIG: Record<string, BibleConfig> = {
  mbc: {
    primary: "MakDonaldning Injil kitobiga o'zbek tilidagi sharhlari",
    secondary: [
      "Комментарии к Библии МакДональда на Узбекском языке.",
      "Uilyam MakDonald - taniqli ilohiyot o‘qituvchisi.",
    ],
    attachment: "muqaddas-kitob",
    defaultView: "split-screen",
    mappingBible: UZ_BOOKS_NAMES,
  },
  "muqaddas-kitob": {
    primary: "Muqaddas Kitob ONLINE",
    attachment: null,
    defaultView: "single-column",
  },
  barclay: {
    primary: "barclay",
    attachment: "azb",
    defaultView: "split-screen",
  },
};
