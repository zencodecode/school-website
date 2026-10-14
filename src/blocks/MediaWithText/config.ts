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
    singular: 'Media + Text (side by side)',
    plural: 'Media + Text (side by side)',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'mediaPosition',
          type: 'select',
          defaultValue: 'left',
          label: 'Media Position',
          options: [
            { label: 'Media on left', value: 'left' },
            { label: 'Media on right', value: 'right' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'mediaWidth',
          type: 'select',
          defaultValue: 'half',
          label: 'Media Width',
          options: [
            { label: 'One third', value: 'oneThird' },
            { label: 'Half', value: 'half' },
            { label: 'Two thirds', value: 'twoThirds' },
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
      label: 'Text',
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
      label: 'Vertical Alignment',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Top', value: 'start' },
      ],
      admin: {
        description: 'Vertical alignment between the media and text when shown side by side.',
      },
    },
  ],
}
