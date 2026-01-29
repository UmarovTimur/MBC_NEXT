import { BibleViewMode } from "../model/types";

export interface BibleRelationsConfig {
  primary: string;
  attachment: string | null;
  defaultView: BibleViewMode;
}

export const BIBLE_RELATIONS_CONFIG: Record<string, BibleRelationsConfig> = {
  mbc: {
    primary: "mbc",
    attachment: "muqaddas-kitob",
    defaultView: "split-screen",
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
