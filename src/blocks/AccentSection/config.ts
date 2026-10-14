import type { Block } from 'payload'

import { linkGroup } from '../../fields/linkGroup'

export const AccentSection: Block = {
  slug: 'accentSection',
  interfaceName: 'AccentSectionBlock',
  labels: { singular: 'Accent Section', plural: 'Accent Sections' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'background',
          type: 'select',
          defaultValue: 'muted',
          label: 'Background',
          options: [
            { label: 'Transparent (inherit page)', value: 'none' },
            { label: 'Muted (soft gray)', value: 'muted' },
            { label: 'Card', value: 'card' },
            { label: 'Primary (theme green)', value: 'primary' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'accentStyle',
          type: 'select',
          defaultValue: 'diagonal',
          label: 'Divider Accent Style',
          options: [
            { label: 'Diagonal', value: 'diagonal' },
            { label: 'Horizontal band', value: 'band' },
            { label: 'Thin line + ornament', value: 'line' },
            { label: 'None', value: 'none' },
          ],
          admin: {
            width: '50%',
            description: 'Decorative accent that cuts across the middle of the section.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'accentColor',
          type: 'select',
          defaultValue: 'primary',
          label: 'Accent Color',
          options: [
            { label: 'Primary (green)', value: 'primary' },
            { label: 'Accent (gold)', value: 'accent' },
          ],
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.accentStyle !== 'none',
          },
        },
        {
          name: 'align',
          type: 'select',
          defaultValue: 'left',
          label: 'Text Alignment (when no image)',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'eyebrow', type: 'text', label: 'Eyebrow label (optional)' },
    { name: 'heading', type: 'text', label: 'Heading', required: true },
    { name: 'description', type: 'textarea', label: 'Description (optional)' },
    {
      type: 'row',
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          label: 'Image (optional)',
          admin: { width: '50%' },
        },
        {
          name: 'mediaPosition',
          type: 'select',
          defaultValue: 'right',
          label: 'Image Position',
          options: [
            { label: 'Right', value: 'right' },
            { label: 'Left', value: 'left' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
        admin: { description: 'Optional call-to-action buttons (max 2).' },
      },
    }),
  ],
}
