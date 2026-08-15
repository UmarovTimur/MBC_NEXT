import { BibleViewMode } from "./model/types";

export interface BibleConfig {
  displayName?: string;
  primary: string;
  secondary?: string[];
  attachment: string | null;
  defaultView: BibleViewMode;
  mappingChapterSlug?: string[];
  chapterSlug?: string;
  formattingStyle?: string;
  introductionName?: string;
  isIndependent?: boolean;
  isCommentary?: boolean;
  /**
   * How the corpus is stored. `verse` bibles keep their text in bible-verses and
   * have their chapter HTML assembled by the API on read; `chapter` bibles store
   * chapter HTML directly. Defaults to `chapter` for anything that predates the
   * field.
   */
  storageMode?: "chapter" | "verse";
}

/** Canonical book name, shared by every bible of one locale. */
export interface BookName {
  name: string;
  shortName?: string;
}
