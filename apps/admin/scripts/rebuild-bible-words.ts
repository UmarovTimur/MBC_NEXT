/**
 * Rebuilds the `bible_words` concordance table from `bible_verses.plain_text`.
 *
 * Manual step, run after any import or content edit — the corpus rarely
 * changes, same operational model as `verify:verses` / `migrate:bible-verses`.
 *
 *   --bible=azb   bible key (default azb)
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import { sql } from 'drizzle-orm'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const adminRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(adminRoot, '..', '..')

function parseArgs(argv: string[]) {
  const get = (name: string): string | undefined => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`))
    return hit ? hit.slice(name.length + 3) : undefined
  }
  return { bible: get('bible') ?? 'azb' }
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

// Same token boundary as the search endpoint's tokenizer (BibleVerses.ts), but
// NOT run through azFold — the concordance must preserve ə/ı/ö/ş/ü/ğ/ç for
// display and correct alphabetical grouping.
function tokenize(text: string): string[] {
  return text.split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 0)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

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
  const bibleId = Number(bible.id)

  console.log(`Bible ${bible.bibleKey} (id ${bibleId}) — reading verses...`)

  const rows = await payload.db.drizzle.execute(sql`
    SELECT plain_text FROM bible_verses
     WHERE bible_id = ${bibleId} AND verse_number > 0 AND plain_text <> ''
  `)
  const verseRows = (rows.rows ?? rows) as { plain_text: string }[]

  const counts = new Map<string, number>()
  let totalTokens = 0
  for (const row of verseRows) {
    for (const token of tokenize(row.plain_text)) {
      // `toLocaleLowerCase('az')` (not plain `toLowerCase()`) is required here:
      // Azerbaijani/Turkish have a dotted/dotless I pair JS's locale-agnostic
      // lowercasing gets wrong (İ -> "i̇" combining form, I -> "i" instead of
      // "ı"), which would silently split e.g. "İncil"/"incil" into two entries.
      const word = token.toLocaleLowerCase('az')
      counts.set(word, (counts.get(word) ?? 0) + 1)
      totalTokens += 1
    }
  }

  console.log(
    `Tokenized ${verseRows.length} verses: ${totalTokens} tokens, ${counts.size} distinct word forms.`,
  )

  const values = Array.from(counts.entries()).map(([word, occurrenceCount]) => ({
    bibleId,
    word,
    firstLetter: word[0] ?? '',
    occurrenceCount,
  }))

  await payload.db.drizzle.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM bible_words WHERE bible_id = ${bibleId}`)

    // Chunk the bulk insert so a full-Bible word list (tens of thousands of
    // distinct forms) doesn't exceed Postgres's bind-parameter limit in one
    // statement.
    const CHUNK = 1000
    for (let i = 0; i < values.length; i += CHUNK) {
      const chunk = values.slice(i, i + CHUNK)
      const rowsSql = chunk.map(
        (v) => sql`(${v.bibleId}, ${v.word}, ${v.firstLetter}, ${v.occurrenceCount})`,
      )
      await tx.execute(sql`
        INSERT INTO bible_words (bible_id, word, first_letter, occurrence_count)
        VALUES ${sql.join(rowsSql, sql`, `)}
      `)
    }
  })

  console.log(`Wrote ${values.length} rows to bible_words for bible ${bible.bibleKey}.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
