import type { CollectionConfig } from 'payload'
import { assembleChapterById, assembleChapterByKeys } from '../lib/bible/assembleChapter'

export const BibleChapters: CollectionConfig = {
  slug: 'bible-chapters',
  // Public read so the az site can fetch chapter HTML; writes require auth.
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'bible', 'book', 'chapterId', 'lastEditedBy', 'updatedAt'],
    listSearchableFields: ['title'],
  },
  // Built-in version history → who/when/what + one-click "Restore" (rollback).
  versions: {
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [
      async ({ req, data, context, originalDoc }) => {
        if (req?.user) {
          data.lastEditedBy = req.user.id
        }

        // bookNumber/locale are denormalized from the linked book for fast
        // public queries; the `book` relationship is the single source of truth.
        if (data.book) {
          const bookId = typeof data.book === 'object' ? data.book.id : data.book
          const book = await req.payload.findByID({ collection: 'bible-books', id: bookId, depth: 0 })
          data.bookNumber = book.bookId
          data.locale = book.locale
        }

        if (data.bible) {
          const bibleId = typeof data.bible === 'object' ? data.bible.id : data.bible
          const bible = await req.payload.findByID({ collection: 'bibles', id: bibleId, depth: 0 })
          if (data.locale && bible.locale !== data.locale) {
            throw new Error(
              `Bible "${bible.bibleKey}" is locale "${bible.locale}" but the selected book is locale "${data.locale}".`,
            )
          }

          // Denormalized so the admin UI can hide the derived HTML field without
          // a lookup, and so the guard below works on a plain value.
          data.storageMode = bible.storageMode ?? 'chapter'

          // In verse mode the HTML is assembled from bible-verses on read. It is
          // kept in the column as the rollback artifact and as the reference the
          // round-trip check diffs against — but it must not drift, or that
          // reference silently stops meaning anything.
          if (
            data.storageMode === 'verse' &&
            !context?.fromVerseSync &&
            typeof data.html === 'string' &&
            originalDoc &&
            data.html !== originalDoc.html
          ) {
            throw new Error(
              `Chapter HTML for "${bible.bibleKey}" is derived from Bible Verses; edit the verses instead.`,
            )
          }
        }

        return data
      },
    ],
  },
  endpoints: [
    {
      // Reader-facing: the public site addresses chapters by key, not by id.
      path: '/assembled',
      method: 'get',
      handler: async (req) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const bible = url.searchParams.get('bible')
        const book = url.searchParams.get('book')
        const chapter = url.searchParams.get('chapter')
        if (!bible || !book || !chapter) {
          return Response.json({ error: 'bible, book and chapter are required' }, { status: 400 })
        }
        const html = await assembleChapterByKeys(req.payload, bible, book, chapter)
        if (html === null) return Response.json({ error: 'not found' }, { status: 404 })
        return Response.json({ html })
      },
    },
    {
      // Admin-facing: the verses panel already holds the chapter document id.
      path: '/:id/assembled',
      method: 'get',
      handler: async (req) => {
        const id = (req.routeParams as { id?: string })?.id
        if (!id) return Response.json({ error: 'id is required' }, { status: 400 })
        const html = await assembleChapterById(req.payload, id)
        if (html === null) return Response.json({ error: 'not found' }, { status: 404 })
        return Response.json({ html })
      },
    },
  ],
  // One chapter per (bible, bookNumber, chapterId); keeps the migration upserts safe.
  indexes: [
    {
      fields: ['bible', 'bookNumber', 'chapterId'],
      unique: true,
    },
  ],
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
          name: 'book',
          type: 'relationship',
          relationTo: 'bible-books',
          label: 'Book',
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
          admin: {
            readOnly: true,
            description: 'Auto-filled from the linked book.',
          },
        },
        {
          name: 'chapterId',
          type: 'text',
          label: 'Chapter ID',
          required: true,
          admin: {
            description: '"0" = introduction, then "1", "2", … (no padding).',
          },
        },
        {
          name: 'locale',
          type: 'select',
          label: 'Language',
          admin: {
            readOnly: true,
            description: 'Auto-filled from the linked book.',
          },
          options: [
            { label: 'Azerbaijani', value: 'az' },
          ],
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      admin: {
        description: 'Optional human-friendly label shown in the admin list.',
      },
    },
    {
      // Denormalized from the linked bible so the conditions below can run
      // client-side without a lookup.
      name: 'storageMode',
      type: 'text',
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'html',
      type: 'code',
      label: 'Chapter HTML',
      // Not `required` at the schema level any more: verse-mode chapters are
      // assembled from bible-verses. Chapter-mode still demands it.
      validate: (value: unknown, { data }: { data?: Record<string, unknown> }) =>
        data?.storageMode === 'verse' ||
        (typeof value === 'string' && value.length > 0) ||
        'Chapter HTML is required.',
      admin: {
        language: 'html',
        description: 'Raw chapter HTML. Verse spans and custom classes are stored verbatim.',
        condition: (data) => data?.storageMode !== 'verse',
        editorProps: {
          height: '70vh',
        },
        editorOptions: {
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        },
      },
    },
    {
      name: 'htmlPreview',
      type: 'ui',
      label: 'Preview',
      admin: {
        condition: (data) => data?.storageMode !== 'verse',
        components: {
          Field: './src/components/admin/BibleHtmlPreview#BibleHtmlPreview',
        },
      },
    },
    {
      name: 'versesPanel',
      type: 'ui',
      label: 'Verses',
      admin: {
        condition: (data) => data?.storageMode === 'verse',
        components: {
          Field: './src/components/admin/ChapterVersesPanel#ChapterVersesPanel',
        },
      },
    },
    {
      name: 'lastEditedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Last edited by',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
