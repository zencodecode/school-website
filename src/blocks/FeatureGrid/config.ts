import type { Block } from 'payload'

export const FeatureGrid: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: { singular: 'Feature Grid', plural: 'Feature Grids' },
  fields: [
    {
      name: 'sectionLabel',
      type: 'text',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'features',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Feature', plural: 'Features' },
      fields: [
        {
          name: 'badge',
          type: 'text',
        },
        {
          name: 'badgeStyle',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Gold', value: 'gold' },
          ],
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Material Symbols icon name (optional)',
          },
        },
        {
          name: 'colSpan',
          type: 'select',
          defaultValue: 'half',
          options: [
            { label: 'Standard (1/2)', value: 'half' },
            { label: 'Wide (7/12)', value: 'wide' },
            { label: 'Narrow (5/12)', value: 'narrow' },
          ],
        },
        {
          name: 'tags',
          type: 'array',
          fields: [
            {
              name: 'tag',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'footnote',
          type: 'group',
          admin: {
            description: 'Optional bottom section with label and value',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
            },
            {
              name: 'value',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
