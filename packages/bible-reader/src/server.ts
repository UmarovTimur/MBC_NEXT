import 'server-only';

export { BibleManager } from "./lib/bible-manager";
export { Bible } from "./lib/bible";
export { searchVerses, getWordLetters, getWordsForLetter } from "./lib/api";
export type {
  VerseSearchHit,
  VerseSearchResponse,
  WordLettersResponse,
  WordsByLetterResponse,
} from "./lib/api";
export type { BibleConfig } from "./config";
