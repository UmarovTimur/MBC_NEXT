/**
 * Decomposes chapter HTML into verse rows for a verse-mode bible (azb).
 *
 * Source is the DATABASE (`bible_chapters.html`), not the on-disk corpus under
 * apps/az/html. Both agree today, but the DB is the copy admins have been able to
 * edit since the original import and the copy the site actually renders — reading
 * from disk would silently discard any editorial fix made since. The disk corpus
 * stays the archival seed for `migrate:bible-html`.
 *
 * Every chapter is re-rendered from its parsed verses and compared against the
 * source BEFORE anything is written. A chapter that does not round-trip is skipped
 * and reported; nothing partial is stored.
 *
 *   --bible=azb     bible key (default azb)
 *   --book=01       restrict to one book
 *   --limit=N       stop after N chapters
 *   --dry-run       parse, verify, report — write nothing
 *   --fail-fast     abort on the first chapter that does not round-trip
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'

import {
  ChapterParseError,
  normalizeHtmlForCompare,
  parseChapterHtml,
  renderChapterHtml,
  verseToPlainText,
} from '@mbc/bible-verses'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const adminRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(adminRoot, '..', '..')

type Args = {
  bible: string
  book?: string
  limit?: number
  dryRun: boolean
  failFast: boolean
}

function parseArgs(argv: string[]): Args {
  const get = (name: string): string | undefined => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`))
    return hit ? hit.slice(name.length + 3) : undefined
  }
  const limit = get('limit')
  return {
    bible: get('bible') ?? 'azb',
    book: get('book'),
    limit: limit ? Number(limit) : undefined,
    dryRun: argv.includes('--dry-run'),
    failFast: argv.includes('--fail-fast'),
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

type Failure = { key: string; reason: string }

async function migrateChapter(
  payload: Payload,
  chapter: { id: number | string; bookNumber: string; chapterId: string; html?: string | null },
  bibleId: number | string,
  locale: 'az' | null,
  args: Args,
): Promise<{ verses: number; failure?: Failure }> {
  const key = `${chapter.bookNumber}/${chapter.chapterId}`
  const html = chapter.html ?? ''

  let doc
  try {
    doc = parseChapterHtml(html)
  } catch (err) {
    const reason = err instanceof ChapterParseError ? err.message : String(err)
    return { verses: 0, failure: { key, reason: `parse error: ${reason}` } }
  }

  // Gate: refuse to store a decomposition that cannot rebuild its own source.
  if (normalizeHtmlForCompare(renderChapterHtml(doc)) !== normalizeHtmlForCompare(html)) {
    return { verses: 0, failure: { key, reason: 'round-trip mismatch' } }
  }

  if (args.dryRun) return { verses: doc.verses.length }

  // Postgres ids are serial integers; Payload's generic id type is string|number.
  const shared = {
    bible: Number(bibleId),
    chapter: Number(chapter.id),
    bookNumber: chapter.bookNumber,
    chapterNumber: chapter.chapterId,
    locale: locale as 'az' | undefined,
  }

  const transactionID = await payload.db.beginTransaction()
  const req = (transactionID ? { transactionID } : {}) as never

  try {
    // Delete-then-insert rather than per-verse upsert: it is idempotent AND stays
    // correct when a chapter's verse count changes. The unique index on
    // (bible, bookNumber, chapterId, verseNumber) is the backstop.
    await payload.delete({
      collection: 'bible-verses',
      where: { chapter: { equals: chapter.id } },
      req,
    })

    if (doc.preamble.length > 0) {
      await payload.create({
        collection: 'bible-verses',
        data: {
          ...shared,
          verseNumber: 0,
          verseEnd: 0,
          before: [],
          segments: doc.preamble.map((b) => ({ ...b, newBlock: true })),
          plainText: '',
        },
        context: { skipDenormalize: true },
        req,
      })
    }

    for (const verse of doc.verses) {
      await payload.create({
        collection: 'bible-verses',
        data: {
          ...shared,
          verseNumber: verse.v,
          verseEnd: verse.vEnd,
          before: verse.before,
          segments: verse.segs,
          plainText: verseToPlainText(verse),
        },
        context: { skipDenormalize: true },
        req,
      })
    }

    if (transactionID) await payload.db.commitTransaction(transactionID)
    return { verses: doc.verses.length }
  } catch (err) {
    if (transactionID) await payload.db.rollbackTransaction(transactionID)
    return { verses: 0, failure: { key, reason: String(err) } }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  // buildConfig reads process.env (PAYLOAD_SECRET, DATABASE_URL) at evaluation
  // time, so the env has to be in place before the config module is imported.
  await loadEnvFile(path.join(adminRoot, '.env'))
  await loadEnvFile(path.join(repoRoot, '.env'))
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const bibles = await payload.find({
    collection: 'bibles',
    where: { bibleKey: { equals: args.bible } },
    limit: 1,
    depth: 0,
  })
  const bible = bibles.docs[0]
  if (!bible) throw new Error(`bible "${args.bible}" not found`)

  console.log(
    `Bible ${bible.bibleKey} (id ${bible.id}, locale ${bible.locale}, storageMode ${bible.storageMode})`,
  )
  if (bible.storageMode !== 'verse') {
    console.log(
      `  note: storageMode is "${bible.storageMode}" — verses will be imported but the site keeps\n` +
        `        rendering chapter HTML until the mode is flipped and apps/az is rebuilt.`,
    )
  }

  const chapters = await payload.find({
    collection: 'bible-chapters',
    where: {
      bible: { equals: bible.id },
      ...(args.book ? { bookNumber: { equals: args.book } } : {}),
    },
    limit: 0,
    depth: 0,
    sort: 'bookNumber',
  })

  let docs = chapters.docs.slice().sort((a, b) => {
    if (a.bookNumber !== b.bookNumber) return a.bookNumber < b.bookNumber ? -1 : 1
    return Number(a.chapterId) - Number(b.chapterId)
  })
  if (args.limit) docs = docs.slice(0, args.limit)

  console.log(`${docs.length} chapters${args.dryRun ? ' (dry run)' : ''}\n`)

  const failures: Failure[] = []
  let done = 0
  let verseTotal = 0

  for (const chapter of docs) {
    const res = await migrateChapter(
      payload,
      chapter as never,
      bible.id,
      (bible.locale as 'az' | undefined) ?? null,
      args,
    )
    if (res.failure) {
      failures.push(res.failure)
      if (args.failFast) break
    } else {
      verseTotal += res.verses
    }
    done += 1
    if (done % 50 === 0 || done === docs.length) {
      console.log(`  ${done}/${docs.length} chapters · ${verseTotal} verses`)
    }
  }

  console.log(
    `\n${args.dryRun ? 'Would import' : 'Imported'} ${verseTotal} verses from ` +
      `${docs.length - failures.length}/${docs.length} chapters`,
  )

  if (failures.length > 0) {
    console.log(`\nFAILURES (${failures.length}):`)
    for (const f of failures.slice(0, 20)) console.log(`  ✗ ${f.key}: ${f.reason}`)
    if (failures.length > 20) console.log(`  … and ${failures.length - 20} more`)
    process.exitCode = 1
    return
  }

  console.log(
    `\nNext: yarn workspace @mbc/admin verify:verses --source=db --from=verses --bible=${args.bible}`,
  )
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
