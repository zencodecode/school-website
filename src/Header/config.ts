import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Branding',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo (Light Background)',
              admin: {
                description:
                  'Logo for light background display. Recommended: SVG or transparent PNG, width 200-400px.',
                width: '50%',
              },
            },
            {
              name: 'logoDark',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo (Dark Background)',
              admin: {
                description:
                  'Logo for dark background display (transparent header, footer). If left empty, the primary logo will be used.',
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'faviconIco',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon (ICO)',
              filterOptions: {
                mimeType: { equals: 'image/x-icon' },
              },
              admin: {
                description:
                  'Small icon displayed in browser tabs. Upload a 32x32px .ico file. Only files in ICO format are accepted.',
                width: '50%',
              },
            },
            {
              name: 'faviconSvg',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon (SVG)',
              filterOptions: {
                mimeType: { equals: 'image/svg+xml' },
              },
              admin: {
                description:
                  'SVG favicon for modern browsers (Chrome, Firefox, Edge). Upload a .svg file. Only files in SVG format are accepted.',
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'siteName',
          type: 'text',
          label: 'Site Name',
          defaultValue: 'School Website',
          admin: {
            description:
              'Displayed as a fallback if logo is not uploaded, and used as the logo alt text.',
          },
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'style',
          type: 'select',
          defaultValue: 'link',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Dropdown', value: 'dropdown' },
          ],
        },
        {
          name: 'subNavItems',
          type: 'array',
          admin: {
            condition: (_, siblingData) => siblingData?.style === 'dropdown',
          },
          fields: [link({ appearances: false })],
        },
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
