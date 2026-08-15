import 'server-only';

export { BibleManager } from "./lib/bible-manager";
export { Bible } from "./lib/bible";
export { searchVerses } from "./lib/api";
export type { VerseSearchHit, VerseSearchResponse } from "./lib/api";
export type { BibleConfig } from "./config";
