import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const adminRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(adminRoot, '..', '..')

type Locale = 'az' | 'uz'

type RawBibleConfig = {
  primary: string
  displayName?: string
  attachment?: string | null
  defaultView?: 'single-column' | 'split-screen'
  isIndependent?: boolean
  isCommentary?: boolean
  formatingStyle?: string
  chapterSlug?: string
  introductionName?: string
  mappingBible?: string[]
  mappingShortBooks?: string[]
  mappingChapterSlug?: string[]
}

// Public sites store their HTML under apps/<app>/html/<bible>/<bookNN>/<chapterNN>.html.
// The per-bible config (primary title, attachment, view mode, …) lives in
// apps/<app>/src/shared/config/bibles/<locale>.json, and book names live partly
// there and partly in the az dictionary's "bible" key (see below).
const SOURCES: { app: string; htmlRoot: string; locale: Locale }[] = [
  { app: 'az', htmlRoot: path.join(repoRoot, 'apps', 'az', 'html'), locale: 'az' },
  { app: 'uz', htmlRoot: path.join(repoRoot, 'apps', 'uz', 'html'), locale: 'uz' },
]

async function loadEnvFile(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const sep = trimmed.indexOf('=')
    if (sep === -1) continue
    const key = trimmed.slice(0, sep).trim()
    let value = trimmed.slice(sep + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

async function loadJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

async function listDirs(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  return entries.filter((e) => e.isDirectory()).map((e) => e.name)
}

async function listHtmlFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  return entries.filter((e) => e.isFile() && e.name.endsWith('.html')).map((e) => e.name)
}

/** Loads each locale's raw bible configs, merging in the az dictionary's shared
 * "bible" translations the same way the old static BIBLES_CONFIG did. */
async function loadBibleConfigs(locale: Locale): Promise<Record<string, RawBibleConfig>> {
  if (locale === 'az') {
    const cfg = (await loadJson<Record<string, RawBibleConfig>>(
      path.join(repoRoot, 'apps', 'az', 'src', 'shared', 'config', 'bibles', 'az.json'),
    )) ?? {}
    const dict = await loadJson<{ bible?: Partial<RawBibleConfig> }>(
      path.join(repoRoot, 'apps', 'az', 'src', 'shared', 'config', 'dictionary', 'az.json'),
    )
    const shared = dict?.bible ?? {}
    return Object.fromEntries(Object.entries(cfg).map(([key, value]) => [key, { ...value, ...shared }]))
  }

  return (
    (await loadJson<Record<string, RawBibleConfig>>(
      path.join(repoRoot, 'apps', 'uz', 'src', 'shared', 'config', 'bibles', 'uz.json'),
    )) ?? {}
  )
}

/** Canonical book names per locale (shared across every bible of that locale). */
function bookNamesFromConfigs(configs: Record<string, RawBibleConfig>): { names: string[]; shortNames?: string[] } {
  for (const cfg of Object.values(configs)) {
    if (cfg.mappingBible?.length) {
      return { names: cfg.mappingBible, shortNames: cfg.mappingShortBooks }
    }
  }
  return { names: [] }
}

async function upsertBibleBooks(
  payload: Payload,
  locale: Locale,
  names: string[],
  shortNames: string[] | undefined,
): Promise<Map<string, number>> {
  const idByBookId = new Map<string, number>()

  for (let i = 0; i < names.length; i++) {
    const bookId = String(i + 1).padStart(2, '0')
    const data = {
      locale,
      bookId,
      name: names[i],
      shortName: shortNames?.[i] || undefined,
    }

    const existing = await payload.find({
      collection: 'bible-books',
      where: { and: [{ locale: { equals: locale } }, { bookId: { equals: bookId } }] },
      limit: 1,
      depth: 0,
    })

    const doc = existing.docs[0]
      ? await payload.update({ collection: 'bible-books', id: existing.docs[0].id, data })
      : await payload.create({ collection: 'bible-books', data })

    idByBookId.set(bookId, doc.id)
  }

  console.log(`  ${locale}: ${names.length} bible-books`)
  return idByBookId
}

async function upsertBibles(
  payload: Payload,
  locale: Locale,
  configs: Record<string, RawBibleConfig>,
): Promise<Map<string, number>> {
  const idByKey = new Map<string, number>()

  for (const [bibleKey, cfg] of Object.entries(configs)) {
    const data = {
      bibleKey,
      locale,
      primary: cfg.primary,
      displayName: cfg.displayName || undefined,
      defaultView: cfg.defaultView ?? 'single-column',
      formattingStyle: cfg.formatingStyle || undefined,
      chapterSlug: cfg.chapterSlug || undefined,
      introductionName: cfg.introductionName || undefined,
      mappingChapterSlug: cfg.mappingChapterSlug?.length ? cfg.mappingChapterSlug : undefined,
      isIndependent: Boolean(cfg.isIndependent),
      isCommentary: Boolean(cfg.isCommentary),
    }

    const existing = await payload.find({
      collection: 'bibles',
      where: { bibleKey: { equals: bibleKey } },
      limit: 1,
      depth: 0,
    })

    const doc = existing.docs[0]
      ? await payload.update({ collection: 'bibles', id: existing.docs[0].id, data })
      : await payload.create({ collection: 'bibles', data })

    idByKey.set(bibleKey, doc.id)
  }

  // Second pass: resolve string attachment keys (e.g. "azb") to relationship ids.
  for (const [bibleKey, cfg] of Object.entries(configs)) {
    if (!cfg.attachment) continue
    const attachmentId = idByKey.get(cfg.attachment)
    if (!attachmentId) continue
    await payload.update({
      collection: 'bibles',
      id: idByKey.get(bibleKey)!,
      data: { attachment: attachmentId },
    })
  }

  console.log(`  ${locale}: ${idByKey.size} bibles`)
  return idByKey
}

async function migrateChapters(
  payload: Payload,
  htmlRoot: string,
  locale: Locale,
  bibleIdByKey: Map<string, number>,
  bookIdByBookId: Map<string, number>,
  bookNameByBookId: Map<string, string>,
) {
  let grandTotal = 0
  const bibleKeys = await listDirs(htmlRoot)

  for (const bibleKey of bibleKeys) {
    const bibleId = bibleIdByKey.get(bibleKey)
    if (!bibleId) {
      console.warn(`  skipping ${locale}/${bibleKey}: no matching Bibles config`)
      continue
    }

    const bibleDir = path.join(htmlRoot, bibleKey)
    const bookDirs = (await listDirs(bibleDir)).filter((name) => !Number.isNaN(Number(name)))

    let corpusCount = 0

    for (const bookId of bookDirs) {
      const bookDocId = bookIdByBookId.get(bookId)
      if (!bookDocId) {
        console.warn(`  skipping ${locale}/${bibleKey}/${bookId}: no matching bible-books entry`)
        continue
      }
      const bookName = bookNameByBookId.get(bookId) ?? bookId

      const bookDir = path.join(bibleDir, bookId)
      const files = await listHtmlFiles(bookDir)

      for (const file of files) {
        const rawChapter = file.replace(/\.html$/, '')
        if (Number.isNaN(Number(rawChapter))) continue
        const chapterId = String(Number(rawChapter)) // "00" -> "0", "01" -> "1"
        const html = await fs.readFile(path.join(bookDir, file), 'utf8')

        const data = {
          bible: bibleId,
          book: bookDocId,
          bookNumber: bookId,
          locale,
          chapterId,
          title: `${bibleKey} — ${bookName} ${chapterId === '0' ? 'Intro' : chapterId}`,
          html,
        }

        const existing = await payload.find({
          collection: 'bible-chapters',
          where: {
            and: [{ bible: { equals: bibleId } }, { book: { equals: bookDocId } }, { chapterId: { equals: chapterId } }],
          },
          limit: 1,
          depth: 0,
        })

        if (existing.docs[0]) {
          await payload.update({ collection: 'bible-chapters', id: existing.docs[0].id, data })
        } else {
          await payload.create({ collection: 'bible-chapters', data })
        }

        corpusCount += 1
      }
    }

    grandTotal += corpusCount
    console.log(`  ${locale}/${bibleKey}: ${corpusCount} chapters`)
  }

  return grandTotal
}

async function main() {
  await loadEnvFile(path.resolve(adminRoot, '.env'))
  if (!process.env.NODE_ENV) Object.assign(process.env, { NODE_ENV: 'development' })

  // Import the Payload config only after env vars are loaded, since buildConfig
  // reads process.env (PAYLOAD_SECRET, DATABASE_URL) at evaluation time.
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  let grandTotal = 0

  for (const { htmlRoot, locale } of SOURCES) {
    const configs = await loadBibleConfigs(locale)
    const { names, shortNames } = bookNamesFromConfigs(configs)

    const bookIdByBookId = await upsertBibleBooks(payload, locale, names, shortNames)
    const bibleIdByKey = await upsertBibles(payload, locale, configs)

    const bookNameByBookId = new Map<string, string>()
    names.forEach((name, i) => bookNameByBookId.set(String(i + 1).padStart(2, '0'), name))

    grandTotal += await migrateChapters(payload, htmlRoot, locale, bibleIdByKey, bookIdByBookId, bookNameByBookId)
  }

  console.log(`Done. ${grandTotal} chapters migrated/updated.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
