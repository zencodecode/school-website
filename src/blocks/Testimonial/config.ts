import type { Block } from 'payload'

export const Testimonial: Block = {
  slug: 'testimonial',
  interfaceName: 'TestimonialBlock',
  labels: {
    singular: 'Testimonial',
    plural: 'Testimonials',
  },
  fields: [
    {
      name: 'sectionLabel',
      type: 'text',
      label: 'Section Label',
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'The main quote text. Use the pipe character | to mark a highlighted phrase (e.g. "text |highlighted part| more text")',
      },
    },
    {
      name: 'personName',
      type: 'text',
      required: true,
    },
    {
      name: 'personTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'personCredentials',
      type: 'text',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'orgName',
      type: 'text',
    },
    {
      name: 'orgDescription',
      type: 'text',
    },
    {
      name: 'linkLabel',
      type: 'text',
    },
    {
      name: 'linkUrl',
      type: 'text',
    },
  ],
}
