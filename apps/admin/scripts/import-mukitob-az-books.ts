import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type ScrapedBookFile = {
  format: string
  sizeLabel?: string
  label: string
  downloadUrl: string
  title?: string
  fileOrder?: number
}

type ScrapedBook = {
  sourceBookKey: string
  externalId: number
  title: string
  subtitle?: string
  author?: string
  description?: string
  detailUrl?: string
  readUrl?: string
  imageUrl?: string
  previewPages?: number | ''
  downloads: ScrapedBookFile[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)
const { Client } = require('pg')
const adminRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(adminRoot, '..', '..')
const mediaDir = path.resolve(adminRoot, 'media')
const importFile = path.resolve(repoRoot, 'migration', 'output', 'mukitob-az', 'books.json')
const MUKITOB_BOOKS_BASE = 'https://mukitob.com/books/az/'
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

async function fetchText(url: string) {
  let lastError: unknown

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0',
          referer: MUKITOB_BOOKS_BASE,
          connection: 'close',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      lastError = error
      if (attempt < 4) await sleep(1000 * attempt)
    }
  }

  throw lastError
}

async function resolveActualDownloadUrl(downloadUrl: string, format: string) {
  const html = await fetchText(downloadUrl)
  const hrefs = [...html.matchAll(/href=(["'])(.*?)\1/gi)].map((match) => match[2])
  const candidates = hrefs.filter((href) => href.includes('/books/download/'))
  const exact = candidates.find((href) => href.toLowerCase().endsWith(`.${format.toLowerCase()}`))
  const fallback = candidates.find((href) => /\.(pdf|docx|epub|fb2|rtf|txt)$/i.test(href))
  const resolved = exact || fallback

  if (!resolved) {
    throw new Error(`Could not resolve final file URL from ${downloadUrl}`)
  }

  return new URL(resolved, MUKITOB_BOOKS_BASE).href
}

async function cleanupLocalizedArtifacts(client: InstanceType<typeof Client>) {
  const localFiles = await fs.readdir(mediaDir).catch(() => [])

  for (const file of localFiles) {
    if (!file.startsWith('mukitob-az-')) continue
    await fs.unlink(path.join(mediaDir, file)).catch(() => undefined)
  }

  await client.query(`delete from media where filename like 'mukitob-az-%'`)
}

async function main() {
  await loadEnvFile(path.resolve(adminRoot, '.env'))
  await fs.mkdir(mediaDir, { recursive: true })

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    await ensureSchema(client)
    await cleanupLocalizedArtifacts(client)

    const raw = await fs.readFile(importFile, 'utf8')
    const data = JSON.parse(raw) as { books: ScrapedBook[] }

    await client.query('begin')
    await client.query('delete from books_downloads')
    await client.query("delete from books where source = 'mukitob' or source is null")

    for (const book of data.books) {
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
            $1, $2, 'az', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'published', now(), now()
          )
          returning id
        `,
        [
          book.title,
          slug,
          book.author ?? '',
          book.subtitle ?? '',
          book.description ?? '',
          book.imageUrl ?? '',
          'mukitob',
          book.sourceBookKey,
          book.externalId,
          book.detailUrl ?? '',
          book.readUrl ?? '',
          typeof book.previewPages === 'number' ? book.previewPages : null,
        ],
      )

      const parentId = inserted.rows[0].id as number
      const downloads = book.downloads.filter((entry) => !AUDIO_FORMATS.has(entry.format))

      for (const [index, file] of downloads.entries()) {
        const directUrl = await resolveActualDownloadUrl(file.downloadUrl, file.format)

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
            file.sizeLabel ?? '',
            file.title ?? '',
            directUrl,
            typeof file.fileOrder === 'number' ? file.fileOrder : index + 1,
          ],
        )
      }
    }

    await client.query('commit')
    console.log(`Imported ${data.books.length} AZ books with direct Mukitob file URLs.`)
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    await client.end()
  }
}

await main()
