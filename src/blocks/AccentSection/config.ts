import type { Block } from 'payload'

import { linkGroup } from '../../fields/linkGroup'

export const AccentSection: Block = {
  slug: 'accentSection',
  interfaceName: 'AccentSectionBlock',
  labels: { singular: 'Seksi Aksen', plural: 'Seksi Aksen' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'background',
          type: 'select',
          defaultValue: 'muted',
          label: 'Latar',
          options: [
            { label: 'Transparan (ikut halaman)', value: 'none' },
            { label: 'Muted (abu lembut)', value: 'muted' },
            { label: 'Kartu', value: 'card' },
            { label: 'Primary (hijau tema)', value: 'primary' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'accentStyle',
          type: 'select',
          defaultValue: 'diagonal',
          label: 'Gaya Aksen Pemotong',
          options: [
            { label: 'Diagonal (miring)', value: 'diagonal' },
            { label: 'Pita horizontal', value: 'band' },
            { label: 'Garis tipis + ornamen', value: 'line' },
            { label: 'Tanpa aksen', value: 'none' },
          ],
          admin: {
            width: '50%',
            description: 'Aksen dekoratif yang memotong seksi di bagian tengah.',
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
          label: 'Warna Aksen',
          options: [
            { label: 'Primary (hijau)', value: 'primary' },
            { label: 'Accent (emas)', value: 'accent' },
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
          label: 'Perataan Teks (saat tanpa gambar)',
          options: [
            { label: 'Kiri', value: 'left' },
            { label: 'Tengah', value: 'center' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'eyebrow', type: 'text', label: 'Label kecil (opsional)' },
    { name: 'heading', type: 'text', label: 'Judul', required: true },
    { name: 'description', type: 'textarea', label: 'Deskripsi (opsional)' },
    {
      type: 'row',
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          label: 'Gambar (opsional)',
          admin: { width: '50%' },
        },
        {
          name: 'mediaPosition',
          type: 'select',
          defaultValue: 'right',
          label: 'Posisi Gambar',
          options: [
            { label: 'Kanan', value: 'right' },
            { label: 'Kiri', value: 'left' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
        admin: { description: 'Tombol ajakan opsional (maksimal 2).' },
      },
    }),
  ],
}
