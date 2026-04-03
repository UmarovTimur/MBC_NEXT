import 'server-only';
import { BibleManager } from '@mbc/bible-reader/server';
export type { Bible } from '@mbc/bible-reader/server';
import { BIBLES_CONFIG } from './config/config';
import { HTML_SRC_DIR } from '@/shared/config/paths';

export const bibleManager = await BibleManager.init(HTML_SRC_DIR, BIBLES_CONFIG);
