import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CsvRow = Record<string, string>

type BookRow = {
  source: string
  locale: string
  sourceBookKey: string
  externalId: string
  title: string
  subtitle: string
  author: string
  description: string
  detailUrl: string
  readUrl: string
  imageUrl: string
  previewPages: string
}

type FileRow = {
  sourceBookKey: string
  format: string
  sizeLabel: string
  label: string
  description: string
  downloadUrl: string
  fileOrder: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)
const { Client } = require('pg')
const adminRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(adminRoot, '..', '..')
const outputDir = path.resolve(repoRoot, 'migration', 'output', 'mukitob-az')
const booksCsvPath = path.resolve(outputDir, 'books.csv')
const filesCsvPath = path.resolve(outputDir, 'book-files.csv')
const AUDIO_FORMATS = new Set(['mp3', 'mp4'])

function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0259\u018F]/g, 'e')
    .replace(/[\u011F\u011E]/g, 'g')
    .replace(/[\u0131\u0130]/g, 'i')
    .replace(/[\u00F6\u00D6]/g, 'o')
    .replace(/[\u015F\u015E]/g, 's')
    .replace(/[\u00FC\u00DC]/g, 'u')
    .replace(/[\u00E7\u00C7]/g, 'c')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCsv(raw: string): CsvRow[] {
  const content = raw.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const next = content[index + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [headers, ...body] = rows
  if (!headers) return []

  return body
    .filter((fields) => fields.some((value) => value.trim()))
    .map((fields) =>
      Object.fromEntries(headers.map((header, index) => [header, fields[index] ?? ''])),
    )
}

function toInt(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

async function loadEnvFile(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf8')

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

async function ensureSchema(client: InstanceType<typeof Client>) {
  const booksTable = await client.query(`select to_regclass('public.books') as table_name`)
  if (!booksTable.rows[0]?.table_name) {
    throw new Error('Payload table "books" does not exist. Start the admin app once before importing CSV.')
  }

  await client.query(`
    alter table books
      add column if not exists author varchar,
      add column if not exists subtitle varchar,
      add column if not exists description varchar,
      add column if not exists cover_image_url varchar,
      add column if not exists source varchar,
      add column if not exists source_book_key varchar,
      add column if not exists source_id integer,
      add column if not exists detail_url varchar,
      add column if not exists read_url varchar,
      add column if not exists preview_pages integer;
  `)

  await client.query(`
    create unique index if not exists books_source_book_key_idx
    on books (source_book_key)
    where source_book_key is not null;
  `)

  await client.query(`
    create table if not exists books_downloads (
      _order integer not null,
      _parent_id integer not null references books(id) on delete cascade,
      id varchar primary key,
      format varchar not null,
      label varchar not null,
      file_size varchar,
      description varchar,
      url varchar not null,
      sort_order integer
    );
  `)

  await client.query('create index if not exists books_downloads_order_idx on books_downloads (_order);')
  await client.query('create index if not exists books_downloads_parent_id_idx on books_downloads (_parent_id);')
}

async function main() {
  await loadEnvFile(path.resolve(adminRoot, '.env'))

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in apps/admin/.env')
  }

  const [booksCsv, filesCsv] = await Promise.all([
    fs.readFile(booksCsvPath, 'utf8'),
    fs.readFile(filesCsvPath, 'utf8'),
  ])
  const books = parseCsv(booksCsv) as BookRow[]
  const files = parseCsv(filesCsv) as FileRow[]
  const filesByBook = new Map<string, FileRow[]>()

  for (const file of files) {
    if (!file.sourceBookKey) continue

    const format = file.format.toLowerCase()
    if (AUDIO_FORMATS.has(format)) continue

    const current = filesByBook.get(file.sourceBookKey) ?? []
    current.push({ ...file, format })
    filesByBook.set(file.sourceBookKey, current)
  }

  const importableFiles = [...filesByBook.values()].reduce((total, current) => total + current.length, 0)

  if (process.argv.includes('--dry-run')) {
    console.log(`CSV dry run: ${books.length} books and ${importableFiles} download links are ready to import.`)
    return
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    await ensureSchema(client)
    await client.query('begin')
    await client.query(`
      delete from books_downloads
      where _parent_id in (
        select id from books
        where source = 'mukitob' or source_book_key like 'mukitob:az:%'
      )
    `)
    await client.query("delete from books where source = 'mukitob' or source_book_key like 'mukitob:az:%'")

    let importedFiles = 0

    for (const book of books) {
      if (!book.sourceBookKey || !book.title) continue

      const externalId = toInt(book.externalId)
      const slug = slugify(`${book.title} ${book.externalId}`) || `book-${book.externalId}`
      const inserted = await client.query(
        `
          insert into books (
            title,
            slug,
            locale,
            author,
            subtitle,
            description,
            cover_image_url,
            source,
            source_book_key,
            source_id,
            detail_url,
            read_url,
            preview_pages,
            status,
            updated_at,
            created_at
          ) values (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'published', now(), now()
          )
          returning id
        `,
        [
          book.title,
          slug,
          book.locale || 'az',
          book.author,
          book.subtitle,
          book.description,
          book.imageUrl,
          book.source || 'mukitob',
          book.sourceBookKey,
          externalId,
          book.detailUrl,
          book.readUrl,
          toInt(book.previewPages),
        ],
      )

      const parentId = inserted.rows[0].id as number
      const downloads = (filesByBook.get(book.sourceBookKey) ?? []).sort(
        (left, right) => (toInt(left.fileOrder) ?? 0) - (toInt(right.fileOrder) ?? 0),
      )

      for (const [index, file] of downloads.entries()) {
        await client.query(
          `
            insert into books_downloads (
              _order,
              _parent_id,
              id,
              format,
              label,
              file_size,
              description,
              url,
              sort_order
            ) values (
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
          `,
          [
            index + 1,
            parentId,
            randomUUID(),
            file.format,
            file.label,
            file.sizeLabel,
            file.description,
            file.downloadUrl,
            toInt(file.fileOrder) ?? index + 1,
          ],
        )
        importedFiles += 1
      }
    }

    await client.query('commit')
    console.log(`Imported ${books.length} AZ books and ${importedFiles} download links from CSV.`)
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    await client.end()
  }
}

await main()
