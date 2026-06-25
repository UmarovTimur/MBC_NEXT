import type { CollectionConfig } from 'payload'

// Canonical book names per language. Shared by every Bible/commentary of that
// locale (e.g. azb and barclay both use the same Azerbaijani book names), so
// names live here once instead of being duplicated per bible.
export const BibleBooks: CollectionConfig = {
  slug: 'bible-books',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'shortName', 'locale', 'bookId', 'updatedAt'],
    listSearchableFields: ['name', 'shortName', 'bookId'],
  },
  indexes: [
    {
      fields: ['locale', 'bookId'],
      unique: true,
    },
  ],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'locale',
          type: 'select',
          label: 'Language',
          required: true,
          index: true,
          options: [
            { label: 'Azerbaijani', value: 'az' },
            { label: 'Uzbek', value: 'uz' },
          ],
        },
        {
          name: 'bookId',
          type: 'text',
          label: 'Book ID',
          required: true,
          admin: {
            description: 'Zero-padded canonical id, e.g. "01".."66".',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Long name',
          required: true,
        },
        {
          name: 'shortName',
          type: 'text',
          label: 'Short name',
          admin: {
            description: 'Falls back to the long name if left blank.',
          },
        },
      ],
    },
  ],
}
