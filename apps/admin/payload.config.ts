import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sql } from 'drizzle-orm'
import { index, integer, pgTable, serial, unique, varchar } from 'drizzle-orm/pg-core'
import { AZ_FOLD, AZ_TSV, VERSE_FTS_INDEX, VERSE_TRGM_INDEX } from './src/lib/search/azFold'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { Users } from './src/collections/Users'
import { Books } from './src/collections/Books'
import { Media } from './src/collections/Media'
import { BibleChapters } from './src/collections/BibleChapters'
import { Bibles } from './src/collections/Bibles'
import { BibleBooks } from './src/collections/BibleBooks'
import { BibleVerses } from './src/collections/BibleVerses'
import { ContentReports } from './src/collections/ContentReports'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const payloadServerURL = process.env.PAYLOAD_SERVER_URL?.trim() ?? ''
const corsUrls = (process.env.CORS_URLS || 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)
const csrfUrls = (process.env.PAYLOAD_CSRF || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

export default buildConfig({
  // Leave serverURL empty unless it is explicitly required so Payload does not
  // auto-populate csrf with the same origin and reject cookie auth requests
  // that arrive without Origin / Sec-Fetch-Site headers.
  serverURL: payloadServerURL,
  csrf: csrfUrls,
  admin: {
    suppressHydrationWarning: true,
    user: 'users',
    components: {
      views: {
        login: {
          Component: './src/components/admin/FixedLoginView#FixedLoginView',
        },
      },
    },
  },
  collections: [Users, Books, Media, Bibles, BibleBooks, BibleChapters, BibleVerses, ContentReports],
  editor: lexicalEditor(),
  sharp,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: process.env.NODE_ENV === 'development',
    // The verse full-text and trigram indexes are expression indexes Payload has
    // no field-level way to declare. Registering them here means both `push`
    // (development) and `migrate:create` (production) know about them —
    // otherwise drizzle-kit treats them as unknown objects and drops them on the
    // next push. `pg_trgm` itself is NOT created by push (extensions aren't part
    // of schema diffing) — it must already exist, via the trgm migration or a
    // one-off `CREATE EXTENSION IF NOT EXISTS pg_trgm;` on a fresh dev database.
    afterSchemaInit: [
      ({ schema, extendTable }) => {
        const table = schema.tables.bible_verses
        if (table) {
          extendTable({
            table,
            extraConfig: () => ({
              [VERSE_FTS_INDEX]: index(VERSE_FTS_INDEX).using(
                'gin',
                sql.raw(AZ_TSV('"plain_text"')),
              ),
              [VERSE_TRGM_INDEX]: index(VERSE_TRGM_INDEX).using(
                'gin',
                sql.raw(`${AZ_FOLD('"plain_text"')} gin_trgm_ops`),
              ),
            }),
          })
        }

        // `bible_words` (Symphony/concordance index) is not a Payload
        // collection — it's derived, read-only data populated by
        // `rebuild-bible-words.ts`, not editorial content. It still has to be
        // declared here, though: `push` (dev) diffs the DB against exactly the
        // tables Payload knows about and drops anything it doesn't recognize,
        // so an undeclared table would vanish on the next dev server boot. The
        // FK to `bibles` and the `ON DELETE CASCADE` are enforced by the real
        // migration (20260820_090000_bible_words), not repeated here.
        schema.tables.bible_words = pgTable(
          'bible_words',
          {
            id: serial('id').primaryKey(),
            bibleId: integer('bible_id').notNull(),
            word: varchar('word').notNull(),
            firstLetter: varchar('first_letter').notNull(),
            occurrenceCount: integer('occurrence_count').notNull(),
          },
          (t) => [
            unique('bible_words_bible_id_word_unique').on(t.bibleId, t.word),
            index('bible_words_letter_idx').on(t.bibleId, t.firstLetter),
          ],
        )

        return schema
      },
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 5_000_000,
    },
  },
  cors: corsUrls,
})
