import type { CollectionConfig } from 'payload'

// Replaces the static BIBLES_CONFIG JSON files (apps/*/src/shared/config/bibles/*.json):
// controls how each bible/commentary corpus is presented on the public sites.
export const Bibles: CollectionConfig = {
  slug: 'bibles',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'bibleKey',
    defaultColumns: ['bibleKey', 'locale', 'primary', 'isIndependent', 'isCommentary', 'updatedAt'],
    listSearchableFields: ['bibleKey', 'primary', 'displayName'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'bibleKey',
          type: 'text',
          label: 'Bible key',
          required: true,
          unique: true,
          admin: {
            description: 'Stable key used in public URLs, e.g. azb, barclay, mbc, muqaddas-kitob.',
          },
        },
        {
          name: 'locale',
          type: 'select',
          label: 'Language',
          required: true,
          index: true,
          options: [
            { label: 'Azerbaijani', value: 'az' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primary',
          type: 'text',
          label: 'Primary title',
          required: true,
        },
        {
          name: 'displayName',
          type: 'text',
          label: 'Display name',
        },
      ],
    },
    {
      name: 'secondary',
      type: 'text',
      label: 'Secondary titles',
      hasMany: true,
    },
    {
      name: 'attachment',
      type: 'relationship',
      relationTo: 'bibles',
      label: 'Attached commentary/translation',
      admin: {
        description: 'The other bible shown alongside this one in split-screen view.',
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'defaultView',
          type: 'select',
          label: 'Default view',
          required: true,
          defaultValue: 'single-column',
          options: [
            { label: 'Single column', value: 'single-column' },
            { label: 'Split screen', value: 'split-screen' },
          ],
        },
        {
          name: 'formattingStyle',
          type: 'text',
          label: 'Formatting style',
          admin: {
            description: 'CSS profile key used to style chapter HTML, e.g. azb, barclay.',
          },
        },
      ],
    },
    {
      name: 'storageMode',
      type: 'select',
      label: 'Storage mode',
      required: true,
      defaultValue: 'chapter',
      options: [
        { label: 'Chapter HTML', value: 'chapter' },
        { label: 'Verses (chapter assembled on read)', value: 'verse' },
      ],
      admin: {
        description:
          'chapter = the Chapter HTML field is the source of truth. verse = Bible Verses are the source of truth and chapter HTML is derived, read-only, and kept only as a rollback artifact. Only corpora with verse markup (azb) can use verse mode; prose commentaries cannot.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'chapterSlug',
          type: 'text',
          label: 'Chapter noun',
          admin: {
            description:
              'The noun only, e.g. "fəsil" — chapter 1 reads "1-ci fəsil", chapter 3 "3-cü fəsil". The ordinal suffix is derived from the number and the locale, so do not include it here.',
          },
        },
        {
          name: 'introductionName',
          type: 'text',
          label: 'Introduction chapter name',
        },
      ],
    },
    {
      name: 'mappingChapterSlug',
      type: 'text',
      label: 'Explicit chapter names',
      hasMany: true,
      admin: {
        description:
          'Optional per-chapter override, indexed by chapter number (index 0 = the introduction). Chapters without an entry fall back to the computed "N-ci fəsil" form, so the list does not have to cover the whole book.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isIndependent',
          type: 'checkbox',
          label: 'Independent (top-level nav link)',
          defaultValue: false,
        },
        {
          name: 'isCommentary',
          type: 'checkbox',
          label: 'Is commentary',
          defaultValue: false,
        },
      ],
    },
  ],
}
