import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'default',
      label: 'Alignment',
      options: [
        { label: 'Default (full width)', value: 'default' },
        { label: 'Float left (text wraps on the right)', value: 'left' },
        { label: 'Float right (text wraps on the left)', value: 'right' },
      ],
      admin: {
        description:
          'Set the media position within the text. The "float" options let surrounding paragraphs wrap beside the media. Effective on wide screens; on mobile the media stacks (full width).',
      },
    },
  ],
}
