import 'server-only';
import path from 'path';
import { BibleManager } from '@mbc/bible-reader/server';
export type { Bible } from '@mbc/bible-reader/server';

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL;

export const bibleManager = PAYLOAD_API_URL
  ? await BibleManager.initFromApi(PAYLOAD_API_URL, 'uz', { next: { revalidate: 60 } })
  : await BibleManager.initFromFiles(path.join(process.cwd(), 'html'));
