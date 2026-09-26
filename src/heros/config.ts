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
      name: 'highImpactVariant',
      type: 'select',
      label: 'High Impact layout',
      defaultValue: 'single',
      options: [
        {
          label: 'Single image',
          value: 'single',
        },
        {
          label: 'Carousel slider',
          value: 'carousel',
        },
      ],
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description: 'Choose whether the High Impact hero shows one image or an autoplay carousel.',
      },
    },
    {
      name: 'media',
      type: 'upload',
      admin: {
        // Shown for Medium Impact, and for High Impact when the "single image"
        // layout is selected. Also used as a fallback background for carousel.
        condition: (_, { type, highImpactVariant } = {}) =>
          type === 'mediumImpact' || (type === 'highImpact' && highImpactVariant !== 'carousel'),
        description: 'The hero image shown for Medium Impact and single-image High Impact heroes.',
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
        condition: (_, { type, highImpactVariant } = {}) =>
          type === 'highImpact' && highImpactVariant === 'carousel',
        description: 'Add the images to show in the carousel. Add two or more for a slider.',
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
        condition: (_, { type, highImpactVariant } = {}) =>
          type === 'highImpact' && highImpactVariant === 'carousel',
      },
    },
    {
      name: 'autoplayInterval',
      type: 'number',
      label: 'Autoplay interval (ms)',
      defaultValue: 5000,
      min: 1000,
      admin: {
        condition: (_, { type, highImpactVariant, autoplay } = {}) =>
          type === 'highImpact' && highImpactVariant === 'carousel' && Boolean(autoplay),
        description: 'Time each slide is shown before advancing, in milliseconds.',
        step: 500,
      },
    },
  ],
  label: false,
}
