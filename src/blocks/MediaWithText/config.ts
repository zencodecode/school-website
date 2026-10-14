import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const MediaWithText: Block = {
  slug: 'mediaWithText',
  interfaceName: 'MediaWithTextBlock',
  labels: {
    singular: 'Media + Teks (berdampingan)',
    plural: 'Media + Teks (berdampingan)',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'mediaPosition',
          type: 'select',
          defaultValue: 'left',
          label: 'Posisi Media',
          options: [
            { label: 'Media di kiri', value: 'left' },
            { label: 'Media di kanan', value: 'right' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'mediaWidth',
          type: 'select',
          defaultValue: 'half',
          label: 'Lebar Media',
          options: [
            { label: 'Sepertiga', value: 'oneThird' },
            { label: 'Setengah', value: 'half' },
            { label: 'Dua pertiga', value: 'twoThirds' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      label: 'Teks',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'verticalAlignment',
      type: 'select',
      defaultValue: 'center',
      label: 'Perataan Vertikal',
      options: [
        { label: 'Tengah', value: 'center' },
        { label: 'Rata atas', value: 'start' },
      ],
      admin: {
        description: 'Perataan vertikal antara media dan teks ketika ditampilkan berdampingan.',
      },
    },
  ],
}
