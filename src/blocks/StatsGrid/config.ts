import type { Block } from 'payload'

export const StatsGrid: Block = {
  slug: 'statsGrid',
  interfaceName: 'StatsGridBlock',
  labels: { singular: 'Stats Grid', plural: 'Stats Grids' },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      labels: { singular: 'Stat', plural: 'Stats' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description:
              'Material Symbols icon name, e.g. groups, menu_book, verified, school',
          },
        },
      ],
    },
  ],
}
