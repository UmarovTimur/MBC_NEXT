import 'server-only';
import path from 'path';
import { BibleManager } from '@mbc/bible-reader/server';
export type { Bible } from '@mbc/bible-reader/server';

// Uzbek text is read from the committed html/ corpus only. The Payload admin has
// no `uz` locale (dropped in the remove_uz_locale migration), so never ask it.
export const bibleManager = await BibleManager.initFromFiles(path.join(process.cwd(), 'html'));
