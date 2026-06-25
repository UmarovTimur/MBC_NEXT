import 'server-only';
import { BibleManager } from '@mbc/bible-reader/server';
export type { Bible } from '@mbc/bible-reader/server';

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL ?? 'http://localhost:8001';

export const bibleManager = await BibleManager.initFromApi(PAYLOAD_API_URL, 'az', {
  next: { revalidate: 60 },
});
