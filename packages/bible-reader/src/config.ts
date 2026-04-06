import { BibleViewMode } from "./model/types";

export interface BibleConfig {
  displayName?: string;
  primary: string;
  secondary?: string[];
  attachment: string | null;
  defaultView: BibleViewMode;
  mappingBible?: string[];
  mappingChapterSlug?: string[];
  chapterSlug?: string;
  formatingStyle?: string;
  introductionName?: string;
  isIndependent?: boolean;
  isCommentary?: boolean;
}
