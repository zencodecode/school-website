import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        // High impact now supports a carousel via `slides`, so `media` is only
        // required (and shown) for medium impact. It also stays as the fallback
        // image for high impact when no slides are configured.
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
        description:
          'Used by Medium Impact. For High Impact this is an optional fallback image shown when no carousel slides are added.',
      },
      relationTo: 'media',
      required: false,
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Carousel slides',
      labels: {
        singular: 'Slide',
        plural: 'Slides',
      },
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description:
          'Add two or more images to turn the High Impact hero into a carousel. A single slide renders as a static image.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: 'Autoplay carousel',
      defaultValue: true,
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
      },
    },
    {
      name: 'autoplayInterval',
      type: 'number',
      label: 'Autoplay interval (ms)',
      defaultValue: 5000,
      min: 1000,
      admin: {
        condition: (_, { type, autoplay } = {}) => type === 'highImpact' && Boolean(autoplay),
        description: 'Time each slide is shown before advancing, in milliseconds.',
        step: 500,
      },
    },
  ],
  label: false,
}
