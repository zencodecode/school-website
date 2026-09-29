import type { Block } from 'payload'

export const ProgramGrid: Block = {
  slug: 'programGrid',
  interfaceName: 'ProgramGridBlock',
  labels: {
    singular: 'Program Grid',
    plural: 'Program Grids',
  },
  fields: [
    {
      name: 'sectionLabel',
      type: 'text',
      label: 'Section Label',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
    },
    {
      name: 'programs',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      labels: {
        singular: 'Program',
        plural: 'Programs',
      },
      fields: [
        {
          name: 'code',
          type: 'text',
          label: 'Code',
          admin: {
            description: 'Short code like "PROG-01"',
          },
        },
        {
          name: 'badge',
          type: 'text',
          label: 'Badge',
          admin: {
            description: 'Badge text like "Full Boarding"',
          },
        },
        {
          name: 'badgeStyle',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Gold', value: 'gold' },
          ],
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
          label: 'Heading',
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          label: 'Description',
        },
        {
          name: 'specs',
          type: 'array',
          maxRows: 5,
          labels: {
            singular: 'Spec',
            plural: 'Specs',
          },
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
          ],
        },
        {
          name: 'linkLabel',
          type: 'text',
          defaultValue: 'Detail Kurikulum',
        },
        {
          name: 'linkUrl',
          type: 'text',
          admin: {
            description: 'URL or anchor link, e.g. /programs or #section-id',
          },
        },
      ],
    },
  ],
}
