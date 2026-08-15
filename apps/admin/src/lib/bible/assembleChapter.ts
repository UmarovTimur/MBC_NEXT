import type { Payload } from 'payload'
import {
  renderChapterHtml,
  type Block,
  type ChapterDoc,
  type Segment,
  type VerseRecord,
} from '@mbc/bible-verses'

/**
 * Rebuilds chapter HTML from stored verse rows.
 *
 * Assembling on the server rather than shipping verse rows to the reader keeps
 * `ChapterContentLoader` in @mbc/bible-reader unchanged — the public site still
 * receives one HTML string, so BibleViewer and BibleContent need no edits at all.
 * It also means the admin preview and the public site run the exact same code and
 * cannot drift apart.
 */

type VerseRow = {
  verseNumber: number
  verseEnd?: number | null
  before?: unknown
  segments?: unknown
}

const asBlocks = (v: unknown): Block[] => (Array.isArray(v) ? (v as Block[]) : [])
const asSegments = (v: unknown): Segment[] => (Array.isArray(v) ? (v as Segment[]) : [])

/** `verseNumber = 0` carries the chapter preamble; everything else is a verse. */
export function rowsToChapterDoc(rows: VerseRow[]): ChapterDoc {
  const preamble: Block[] = []
  const verses: VerseRecord[] = []

  for (const row of rows) {
    const segments = asSegments(row.segments)
    if (Number(row.verseNumber) === 0) {
      preamble.push(...segments.map((s) => ({ cls: s.cls, html: s.html })))
      continue
    }
    verses.push({
      v: Number(row.verseNumber),
      vEnd: Number(row.verseEnd ?? row.verseNumber),
      before: asBlocks(row.before),
      segs: segments,
    })
  }

  return { preamble, verses }
}

async function renderFromRows(
  payload: Payload,
  where: Record<string, unknown>,
): Promise<string | null> {
  const res = await payload.find({
    collection: 'bible-verses',
    where: where as never,
    sort: 'verseNumber',
    limit: 0,
    depth: 0,
    // `select` keeps the payload small: 176 rows for Psalm 119.
    select: {
      verseNumber: true,
      verseEnd: true,
      before: true,
      segments: true,
    } as never,
  })

  if (res.docs.length === 0) return null
  // wrapVerses gives the frontend a per-verse element to anchor and highlight;
  // 41% of verses span several blocks, so this is what makes "highlight verse 3"
  // possible at all.
  return renderChapterHtml(rowsToChapterDoc(res.docs as never), { wrapVerses: true })
}

/** By chapter document id — used by the admin panel. */
export function assembleChapterById(payload: Payload, chapterDocId: string | number) {
  return renderFromRows(payload, { chapter: { equals: chapterDocId } })
}

/** By public keys — used by the reader, which addresses chapters by key, not id. */
export async function assembleChapterByKeys(
  payload: Payload,
  bibleKey: string,
  bookNumber: string,
  chapterNumber: string,
): Promise<string | null> {
  return renderFromRows(payload, {
    'bible.bibleKey': { equals: bibleKey },
    bookNumber: { equals: bookNumber },
    chapterNumber: { equals: chapterNumber },
  })
}
