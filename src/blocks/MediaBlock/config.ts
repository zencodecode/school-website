import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default (lebar penuh)', value: 'default' },
        { label: 'Mengambang ke kiri (teks membungkus di kanan)', value: 'left' },
        { label: 'Mengambang ke kanan (teks membungkus di kiri)', value: 'right' },
      ],
      admin: {
        description:
          'Atur posisi media di dalam teks. Opsi "mengambang" membuat paragraf di sekitarnya membungkus di sisi media. Efektif di layar lebar; di layar ponsel media otomatis menumpuk (lebar penuh).',
      },
    },
  ],
}
