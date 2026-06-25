import type { CollectionConfig } from 'payload'

export const BibleChapters: CollectionConfig = {
  slug: 'bible-chapters',
  // Public read so the az/uz sites can fetch chapter HTML; writes require auth.
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
      async ({ req, data }) => {
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

        if (data.bible && data.locale) {
          const bibleId = typeof data.bible === 'object' ? data.bible.id : data.bible
          const bible = await req.payload.findByID({ collection: 'bibles', id: bibleId, depth: 0 })
          if (bible.locale !== data.locale) {
            throw new Error(
              `Bible "${bible.bibleKey}" is locale "${bible.locale}" but the selected book is locale "${data.locale}".`,
            )
          }
        }

        return data
      },
    ],
  },
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
            { label: 'Uzbek', value: 'uz' },
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
      name: 'html',
      type: 'code',
      label: 'Chapter HTML',
      required: true,
      admin: {
        language: 'html',
        description: 'Raw chapter HTML. Verse spans and custom classes are stored verbatim.',
      },
    },
    {
      name: 'htmlPreview',
      type: 'ui',
      label: 'Preview',
      admin: {
        components: {
          Field: './src/components/admin/BibleHtmlPreview#BibleHtmlPreview',
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
