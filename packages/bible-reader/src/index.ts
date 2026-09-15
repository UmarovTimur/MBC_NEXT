// Bible reader shared package
// Components will be extracted here from apps/uz as needed
export { ManifestProvider, useBible } from './context/ManifestProvider';
export { hasChapterAudio, resolveChapterAudioUrl } from './lib/audio';
export { formatChapterName } from './lib/chapter-name';
export type { ChapterNaming } from './lib/chapter-name';
export type { Book, Chapter, BibleViewMode, BibleManifest } from './model/types';
export type { Bible } from './model/Bible';