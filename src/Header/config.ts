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
                  'Logo untuk tampilan di background terang. Rekomendasi: SVG atau PNG transparan, lebar 200-400px.',
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
                  'Logo untuk tampilan di background gelap (header transparan, footer). Jika kosong, logo utama akan digunakan.',
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
                  'Ikon kecil yang muncul di tab browser. Upload file .ico berukuran 32x32px. Hanya file berformat ICO yang diterima.',
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
                  'Favicon versi SVG untuk browser modern (Chrome, Firefox, Edge). Upload file .svg. Hanya file berformat SVG yang diterima.',
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
              'Ditampilkan sebagai fallback jika logo belum diupload, dan sebagai alt text logo.',
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
