import type { CollectionConfig } from 'payload'

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

export const Books: CollectionConfig = {
  slug: 'books',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'locale', 'status', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier used in book pages.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.trim()) return value.trim()

            const title = typeof data?.title === 'string' ? data.title : ''
            const sourceId = typeof data?.sourceId === 'number' ? String(data.sourceId) : ''
            const candidate = [title, sourceId].filter(Boolean).join(' ')
            return slugify(candidate || title || 'book')
          },
        ],
      },
    },
    {
      name: 'locale',
      type: 'select',
      label: 'Language',
      required: true,
      defaultValue: 'az',
      options: [
        { label: 'Azerbaijani', value: 'az' },
        { label: 'Uzbek', value: 'uz' },
        { label: 'Russian', value: 'ru' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          type: 'text',
          label: 'Author',
        },
        {
          name: 'subtitle',
          type: 'text',
          label: 'Subtitle',
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'coverImage',
          type: 'upload',
          label: 'Cover Image',
          relationTo: 'media',
        },
        {
          name: 'coverImageUrl',
          type: 'text',
          label: 'External Cover URL',
          admin: {
            description: 'Used when the cover remains on the source website.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          label: 'Source',
          defaultValue: 'manual',
          options: [
            { label: 'Mukitob', value: 'mukitob' },
            { label: 'Manual', value: 'manual' },
          ],
        },
        {
          name: 'sourceBookKey',
          type: 'text',
          label: 'Source Book Key',
          unique: true,
        },
        {
          name: 'sourceId',
          type: 'number',
          label: 'Source ID',
          admin: {
            description: 'Numeric identifier from the source catalog.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'detailUrl',
          type: 'text',
          label: 'Detail URL',
        },
        {
          name: 'readUrl',
          type: 'text',
          label: 'Read URL',
        },
        {
          name: 'previewPages',
          type: 'number',
          label: 'Preview Pages',
        },
      ],
    },
    {
      name: 'downloads',
      type: 'array',
      label: 'Download Files',
      admin: {
        description: 'Audio formats are intentionally excluded for now.',
      },
      fields: [
        {
          name: 'format',
          type: 'text',
          label: 'Format',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
        },
        {
          name: 'fileSize',
          type: 'text',
          label: 'File Size',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Format Description',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Download URL',
          required: true,
        },
        {
          name: 'sortOrder',
          type: 'number',
          label: 'Sort Order',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'draft',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}
