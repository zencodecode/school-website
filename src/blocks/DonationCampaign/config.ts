import type { Block } from 'payload'

export const DonationCampaign: Block = {
  slug: 'donationCampaign',
  interfaceName: 'DonationCampaignBlock',
  labels: {
    singular: 'Donation Campaign',
    plural: 'Donation Campaigns',
  },
  fields: [
    {
      name: 'badge',
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
      name: 'targetAmount',
      type: 'number',
      required: true,
      admin: {
        description: 'Target amount in IDR (number only, e.g. 500000000)',
      },
    },
    {
      name: 'collectedAmount',
      type: 'number',
      required: true,
      admin: {
        description: 'Collected amount in IDR',
      },
    },
    {
      name: 'donorCount',
      type: 'number',
    },
    {
      name: 'auditInfo',
      type: 'text',
    },
    {
      name: 'donationOptions',
      type: 'array',
      maxRows: 6,
      labels: {
        singular: 'Option',
        plural: 'Options',
      },
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          admin: {
            description: 'Amount in IDR',
          },
        },
        {
          name: 'isHighlighted',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'bankInfo',
      type: 'text',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Wakaf Sekarang',
    },
    {
      name: 'ctaUrl',
      type: 'text',
    },
    {
      name: 'secondaryCtaLabel',
      type: 'text',
    },
    {
      name: 'secondaryCtaUrl',
      type: 'text',
    },
  ],
}
