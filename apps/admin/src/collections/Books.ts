import type { CollectionConfig } from 'payload'

export const Books: CollectionConfig = {
  slug: 'books',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'locale', 'status', 'updatedAt'],
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
        description: 'URL-friendly identifier (e.g. matthew, john)',
      },
    },
    {
      name: 'locale',
      type: 'select',
      label: 'Language',
      required: true,
      options: [
        { label: 'Azerbaijani', value: 'az' },
        { label: 'Uzbek', value: 'uz' },
        { label: 'Russian', value: 'ru' },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: 'Cover Image',
      relationTo: 'media',
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
