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
}

/** Canonical book name, shared by every bible of one locale. */
export interface BookName {
  name: string;
  shortName?: string;
}
