import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: 'Gallery',
    plural: 'Galleries',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'grid',
          label: 'Layout',
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Masonry (varied height)', value: 'masonry' },
            { label: 'Carousel (slider)', value: 'carousel' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          label: 'Columns',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
          admin: {
            width: '50%',
            description: 'Applies to Grid and Masonry layouts (on wide screens).',
            condition: (_, siblingData) => siblingData?.layout !== 'carousel',
          },
        },
      ],
    },
    {
      name: 'enableLightbox',
      type: 'checkbox',
      label: 'Enable Lightbox',
      defaultValue: true,
      admin: {
        description: 'Click an image to open it fullscreen with previous/next navigation.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'autoplay',
          type: 'checkbox',
          label: 'Autoplay (Carousel)',
          defaultValue: true,
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.layout === 'carousel',
          },
        },
        {
          name: 'autoplayInterval',
          type: 'number',
          label: 'Autoplay Interval (ms)',
          defaultValue: 5000,
          min: 1000,
          admin: {
            width: '50%',
            step: 500,
            condition: (_, siblingData) =>
              siblingData?.layout === 'carousel' && Boolean(siblingData?.autoplay),
          },
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      minRows: 1,
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption (optional)',
        },
      ],
    },
  ],
}
