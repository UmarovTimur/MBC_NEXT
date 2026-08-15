import type { CollectionConfig } from 'payload'
import { sql } from 'drizzle-orm'
import {
  azFold,
  isAllowedBlockClass,
  isSanitizedBlockHtml,
  verseToPlainText,
  type Block,
  type Segment,
} from '@mbc/bible-verses'
import { AZ_TSV } from '../lib/search/azFold'

const MAX_SEARCH_LIMIT = 50
const MIN_QUERY_LENGTH = 2

/**
 * Verse-level storage for corpora whose bible has `storageMode: 'verse'` (azb).
 *
 * One row per verse. `verseNumber = 0` is the chapter preamble — the blocks that
 * precede the first verse marker (a section heading, a psalm ascription); keeping
 * it as a row means the assembler is one ordered query with no special first case.
 * Search must therefore filter `verseNumber > 0`; that is the only place the
 * sentinel leaks.
 *
 * `before` and `segments` are JSON (→ jsonb) rather than Payload arrays: arrays
 * would create a ~45 000-row child table joined on every single verse read, with
 * no way to skip the hydration.
 *
 * Versions are deliberately NOT enabled. A full import would write 31 072 version
 * rows per run (maxPerDoc caps per document, not per run) and roughly double the
 * storage, while the audit value is near zero — the corpus is machine-generated
 * and reproducible, `lastEditedBy`/`updatedAt` record who touched a verse, and the
 * preserved `bible_chapters.html` is the reference the round-trip check diffs
 * against. Chapter-level versioning on `bible-chapters` is left untouched.
 */
export const BibleVerses: CollectionConfig = {
  slug: 'bible-verses',
  // Public read so the az site can fetch verses; writes require auth.
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'ref',
    defaultColumns: ['ref', 'verseNumber', 'plainText', 'updatedAt'],
    listSearchableFields: ['ref'],
    pagination: { defaultLimit: 50 },
  },
  indexes: [
    { fields: ['bible', 'bookNumber', 'chapterNumber', 'verseNumber'], unique: true },
    { fields: ['chapter', 'verseNumber'] },
  ],
  endpoints: [
    {
      // Payload's query layer cannot express `@@` or ts_rank_cd, and `like` over
      // 31 000 verses is both slow and semantically wrong, so this drops to SQL.
      path: '/search',
      method: 'get',
      handler: async (req) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const raw = (url.searchParams.get('q') ?? '').trim().slice(0, 200)
        const bibleKey = url.searchParams.get('bible') ?? 'azb'
        const book = url.searchParams.get('book')
        const limit = Math.min(
          Math.max(Number(url.searchParams.get('limit') ?? 20) || 20, 1),
          MAX_SEARCH_LIMIT,
        )
        const page = Math.max(Number(url.searchParams.get('page') ?? 1) || 1, 1)

        // Custom endpoints bypass collection access control, so the guards that
        // keep this from being a free table scan have to be explicit.
        if (raw.length < MIN_QUERY_LENGTH) {
          return Response.json({ total: 0, page, limit, results: [] })
        }

        // Folded here rather than in SQL so the query side and the index side
        // provably use the same character map (see lib/search/azFold.ts).
        const folded = azFold(raw)
        const tsv = sql.raw(AZ_TSV('v.plain_text'))

        const rows = await req.payload.db.drizzle.execute(sql`
          SELECT v.book_number      AS "bookNumber",
                 v.chapter_number   AS "chapterNumber",
                 v.verse_number     AS "verseNumber",
                 v.verse_end        AS "verseEnd",
                 v.plain_text       AS "plainText",
                 ts_rank_cd(${tsv}, websearch_to_tsquery('simple', ${folded})) AS rank,
                 count(*) OVER ()   AS total
            FROM bible_verses v
            JOIN bibles b ON b.id = v.bible_id
           WHERE b.bible_key = ${bibleKey}
             AND v.verse_number > 0
             ${book ? sql`AND v.book_number = ${book}` : sql``}
             AND ${tsv} @@ websearch_to_tsquery('simple', ${folded})
           ORDER BY rank DESC, v.book_number, (v.chapter_number)::int, v.verse_number
           LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `)

        const results = (rows.rows ?? rows) as Record<string, unknown>[]
        return Response.json({
          total: Number(results[0]?.total ?? 0),
          page,
          limit,
          // Raw book/chapter numbers: the reader already has the book-name map in
          // its manifest, so naming logic is not duplicated here.
          results: results.map((r) => ({
            bookNumber: r.bookNumber,
            chapterNumber: r.chapterNumber,
            verseNumber: Number(r.verseNumber),
            verseEnd: Number(r.verseEnd ?? r.verseNumber),
            plainText: r.plainText,
          })),
        })
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, context }) => {
        if (req?.user) {
          data.lastEditedBy = req.user.id
        }

        // The importer supplies every denormalized field itself and sets this
        // flag; without it a full import would fire 32 000 extra findByID calls.
        if (!context?.skipDenormalize && data.chapter) {
          const chapterId = typeof data.chapter === 'object' ? data.chapter.id : data.chapter
          const chapter = await req.payload.findByID({
            collection: 'bible-chapters',
            id: chapterId,
            depth: 0,
          })
          data.bible = typeof chapter.bible === 'object' ? chapter.bible.id : chapter.bible
          data.bookNumber = chapter.bookNumber
          data.chapterNumber = chapter.chapterId
          data.locale = chapter.locale
        }

        const segments = (data.segments ?? []) as Segment[]
        if (!Array.isArray(segments) || segments.length === 0) {
          throw new Error('segments must be a non-empty array of { cls, html, newBlock }.')
        }
        const before = (data.before ?? []) as Block[]
        if (!Array.isArray(before)) {
          throw new Error('before must be an array of { cls, html }.')
        }

        // Defense in depth: the public reader injects this markup with
        // dangerouslySetInnerHTML, so a hand-edited verse must not be able to
        // smuggle in a tag or attribute the renderer would happily pass through.
        for (const [label, blocks] of [
          ['segments', segments],
          ['before', before],
        ] as const) {
          for (const b of blocks) {
            if (typeof b?.cls !== 'string' || !isAllowedBlockClass(b.cls)) {
              throw new Error(`${label}: unknown block class "${b?.cls}".`)
            }
            if (typeof b?.html !== 'string') {
              throw new Error(`${label}: html must be a string.`)
            }
            if (!isSanitizedBlockHtml(b.html)) {
              throw new Error(
                `${label}: html contains markup that is not allowed in a verse — ${b.html.slice(0, 120)}`,
              )
            }
          }
        }

        // Recomputed on every write so editing the markup can never leave the
        // search index describing the old text.
        data.plainText = verseToPlainText({
          v: Number(data.verseNumber ?? 0),
          vEnd: Number(data.verseEnd ?? data.verseNumber ?? 0),
          before,
          segs: segments,
        })

        // A range only ever extends forward; anything else is a typo, and letting
        // it through would make the anchor fallback match the wrong verses.
        const v = Number(data.verseNumber ?? 0)
        const end = Number(data.verseEnd ?? v)
        data.verseEnd = Number.isFinite(end) && end > v ? end : v

        if (data.bookNumber && data.chapterNumber != null && data.verseNumber != null) {
          data.ref = `${data.bookNumber}:${data.chapterNumber}:${data.verseNumber}`
        }

        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'bible',
          type: 'relationship',
          relationTo: 'bibles',
          label: 'Bible / corpus',
          required: true,
          index: true,
        },
        {
          name: 'chapter',
          type: 'relationship',
          relationTo: 'bible-chapters',
          label: 'Chapter',
          required: true,
          index: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bookNumber',
          type: 'text',
          label: 'Book number',
          required: true,
          admin: { readOnly: true, description: 'Auto-filled from the linked chapter.' },
        },
        {
          // Named `chapterNumber` rather than `chapterId` on purpose: the
          // `chapter` relationship above already occupies the `chapter_id`
          // column, and the collision makes Postgres try to point a foreign key
          // at a varchar. Symmetric with `bookNumber` anyway.
          name: 'chapterNumber',
          type: 'text',
          label: 'Chapter number',
          required: true,
          admin: { readOnly: true, description: 'Auto-filled from the linked chapter.' },
        },
        {
          name: 'locale',
          type: 'select',
          label: 'Language',
          admin: { readOnly: true, description: 'Auto-filled from the linked chapter.' },
          options: [
            { label: 'Azerbaijani', value: 'az' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'verseNumber',
          type: 'number',
          label: 'Verse number',
          required: true,
          admin: {
            description: '0 = chapter preamble (blocks before the first verse marker).',
          },
        },
        {
          name: 'verseEnd',
          type: 'number',
          label: 'Range end',
          admin: {
            readOnly: true,
            description:
              'Last verse covered by this record. Greater than the verse number only for the 30 azb markers that label a merged range (e.g. 16-17 under id V16); equal to it otherwise. The marker text shown in the chapter is derived from these two numbers, not stored.',
          },
        },
      ],
    },
    {
      name: 'ref',
      type: 'text',
      label: 'Reference',
      index: true,
      admin: { readOnly: true, description: 'bookNumber:chapterId:verseNumber' },
    },
    {
      name: 'plainText',
      type: 'textarea',
      label: 'Plain text',
      admin: {
        readOnly: true,
        description:
          'Tag-free text, recomputed from segments on every save. This is what full-text search indexes. Empty for the 8 verses that carry a marker but no text in critical-text translations.',
      },
    },
    {
      name: 'before',
      type: 'json',
      label: 'Preceding blocks',
      admin: {
        description: '[{ cls, html }] — headings/references emitted before this verse.',
      },
    },
    {
      name: 'segments',
      type: 'json',
      label: 'Verse body',
      required: true,
      admin: {
        description:
          '[{ cls, html, newBlock }] — one entry per block the verse occupies. 41% of verses span more than one block, so this is a list, not a string. newBlock:false on the first entry means the verse starts part-way through the previous block.',
      },
    },
    {
      name: 'preview',
      type: 'ui',
      label: 'Preview',
      admin: {
        components: {
          Field: './src/components/admin/VersePreview#VersePreview',
        },
      },
    },
    {
      name: 'lastEditedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Last edited by',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
