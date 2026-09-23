/**
 * Round-trip verification for the verse decomposition.
 *
 * Every chapter is parsed into verse records, re-rendered, and compared against
 * the original HTML with insignificant whitespace normalized. This is the gate the
 * whole migration rests on: if a chapter cannot be rebuilt from its verses, that
 * chapter must not be migrated.
 *
 *   --from=html      rebuild from bible_chapters.html  (default)
 *   --from=verses    rebuild from the bible_verses rows, diff against chapters.html
 *   --bible=azb      bible key (default azb)
 *   --book=01        restrict to one book
 *   --limit=N        stop after N chapters
 *   --verbose        print the first divergence for every failure, not just the first 5
 *
 * Exits 1 on any mismatch.
 */
import { createRequire } from 'node:module'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  ChapterParseError,
  normalizeHtmlForCompare,
  parseChapterHtml,
  renderChapterHtml,
  type Block,
  type ChapterDoc,
  type Segment,
  type VerseRecord,
} from '@mbc/bible-verses'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const adminRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(adminRoot, '..', '..')

type Args = {
  from: 'html' | 'verses'
  bible: string
  book?: string
  limit?: number
  verbose: boolean
}

function parseArgs(argv: string[]): Args {
  const get = (name: string): string | undefined => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`))
    return hit ? hit.slice(name.length + 3) : undefined
  }
  const from = (get('from') ?? 'html') as Args['from']
  if (from !== 'html' && from !== 'verses') throw new Error(`--from must be html|verses`)
  const limit = get('limit')
  return {
    from,
    bible: get('bible') ?? 'azb',
    book: get('book'),
    limit: limit ? Number(limit) : undefined,
    verbose: argv.includes('--verbose'),
  }
}

async function loadEnvFile(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const sep = trimmed.indexOf('=')
    if (sep === -1) continue
    const key = trimmed.slice(0, sep).trim()
    let value = trimmed.slice(sep + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

type ChapterRow = { key: string; bookNumber: string; chapterId: string; html: string }

// `pg` is pulled in through @payloadcms/db-postgres; import-mukitob-az-books.ts
// reaches for it the same way rather than booting the whole Payload runtime.
const require = createRequire(import.meta.url)

async function withClient<T>(fn: (q: (sql: string, params?: unknown[]) => Promise<any>) => Promise<T>): Promise<T> {
  await loadEnvFile(path.join(adminRoot, '.env'))
  await loadEnvFile(path.join(repoRoot, '.env'))
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set (apps/admin/.env)')

  const { Client } = require('pg') as typeof import('pg')
  const client = new Client({ connectionString })
  await client.connect()
  try {
    return await fn((sql, params) => client.query(sql, params as any[]))
  } finally {
    await client.end()
  }
}

async function readChaptersFromDb(args: Args): Promise<ChapterRow[]> {
  return withClient(async (q) => {
    const res = await q(
      `SELECT c.book_number, c.chapter_id, c.html
         FROM bible_chapters c
         JOIN bibles b ON b.id = c.bible_id
        WHERE b.bible_key = $1
          AND ($2::text IS NULL OR c.book_number = $2)
        ORDER BY c.book_number, (c.chapter_id)::int`,
      [args.bible, args.book ?? null],
    )
    return res.rows.map((r: any) => ({
      key: `${r.book_number}/${r.chapter_id}`,
      bookNumber: r.book_number,
      chapterId: r.chapter_id,
      html: r.html ?? '',
    }))
  })
}

/** Rebuild a ChapterDoc out of stored verse rows (verseNumber 0 = chapter preamble). */
function rowsToChapterDoc(rows: any[]): ChapterDoc {
  const preamble: Block[] = []
  const verses: VerseRecord[] = []
  for (const r of rows) {
    const before = (r.before ?? []) as Block[]
    const segments = (r.segments ?? []) as Segment[]
    if (Number(r.verse_number) === 0) {
      preamble.push(...segments.map((s) => ({ cls: s.cls, html: s.html })))
      continue
    }
    verses.push({
      v: Number(r.verse_number),
      vEnd: Number(r.verse_end ?? r.verse_number),
      before,
      segs: segments,
    })
  }
  return { preamble, verses }
}

async function readFromVerses(args: Args): Promise<{ row: ChapterRow; rebuilt: string }[]> {
  return withClient(async (q) => {
    const chapters = await q(
      `SELECT c.id, c.book_number, c.chapter_id, c.html
         FROM bible_chapters c
         JOIN bibles b ON b.id = c.bible_id
        WHERE b.bible_key = $1
          AND ($2::text IS NULL OR c.book_number = $2)
        ORDER BY c.book_number, (c.chapter_id)::int`,
      [args.bible, args.book ?? null],
    )
    const out: { row: ChapterRow; rebuilt: string }[] = []
    for (const c of chapters.rows) {
      const verses = await q(
        `SELECT verse_number, verse_end, "before", segments
           FROM bible_verses WHERE chapter_id = $1 ORDER BY verse_number`,
        [c.id],
      )
      out.push({
        row: {
          key: `${c.book_number}/${c.chapter_id}`,
          bookNumber: c.book_number,
          chapterId: c.chapter_id,
          html: c.html ?? '',
        },
        rebuilt: renderChapterHtml(rowsToChapterDoc(verses.rows)),
      })
    }
    return out
  })
}

function firstDivergence(a: string, b: string): string {
  const len = Math.min(a.length, b.length)
  let i = 0
  while (i < len && a[i] === b[i]) i += 1
  const from = Math.max(0, i - 60)
  return [
    `    at offset ${i} (lengths ${a.length} vs ${b.length})`,
    `    orig: …${a.slice(from, i + 60)}…`,
    `    rndr: …${b.slice(from, i + 60)}…`,
  ].join('\n')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const label = `${args.bible} · from=${args.from}`
  console.log(`Verifying ${label}\n`)

  let pairs: { row: ChapterRow; rebuilt: string }[]
  const failures: { key: string; detail: string }[] = []

  if (args.from === 'verses') {
    pairs = await readFromVerses(args)
  } else {
    const rows = await readChaptersFromDb(args)
    pairs = []
    for (const row of rows) {
      try {
        pairs.push({ row, rebuilt: renderChapterHtml(parseChapterHtml(row.html)) })
      } catch (err) {
        const msg = err instanceof ChapterParseError ? err.message : String(err)
        failures.push({ key: row.key, detail: `    parse error: ${msg}` })
      }
    }
  }

  if (args.limit) pairs = pairs.slice(0, args.limit)

  let ok = 0
  let verseCount = 0
  for (const { row, rebuilt } of pairs) {
    if (args.from === 'html') {
      try {
        verseCount += parseChapterHtml(row.html).verses.length
      } catch {
        /* already recorded above */
      }
    }
    const a = normalizeHtmlForCompare(row.html)
    const b = normalizeHtmlForCompare(rebuilt)
    if (a === b) ok += 1
    else failures.push({ key: row.key, detail: firstDivergence(a, b) })
  }

  const total = pairs.length + failures.filter((f) => f.detail.startsWith('    parse error')).length
  console.log(`  chapters round-tripped: ${ok}/${total}`)
  if (verseCount) console.log(`  verses parsed:          ${verseCount}`)

  if (failures.length > 0) {
    const show = args.verbose ? failures : failures.slice(0, 5)
    console.log(`\n  FAILURES (${failures.length}):`)
    for (const f of show) console.log(`  ✗ ${f.key}\n${f.detail}`)
    if (show.length < failures.length) {
      console.log(`  … and ${failures.length - show.length} more (use --verbose)`)
    }
    process.exitCode = 1
    return
  }

  console.log(`\n  ✅ all chapters round-trip losslessly`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
