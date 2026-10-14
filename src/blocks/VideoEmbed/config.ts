import type { Block } from 'payload'
import type { TextFieldSingleValidation } from 'payload'

import { getVideoEmbed } from '@/utilities/getVideoEmbed'

export const VideoEmbed: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: {
    singular: 'Video Embed',
    plural: 'Video Embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'URL Video (YouTube atau Vimeo)',
      required: true,
      admin: {
        description:
          'Tempel link biasa video, misalnya https://www.youtube.com/watch?v=xxxx atau https://vimeo.com/xxxx. Parameter pelacakan seperti ?si=... akan diabaikan otomatis. Kode <iframe> embed juga diterima, tetapi link biasa lebih disarankan.',
      },
      validate: ((value) => {
        if (!value) return 'URL video wajib diisi'
        const result = getVideoEmbed(value)
        if (!result) {
          return 'URL tidak dikenali. Gunakan link YouTube atau Vimeo yang valid.'
        }
        return true
      }) as TextFieldSingleValidation,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Keterangan (opsional)',
      admin: {
        description: 'Teks keterangan yang ditampilkan di bawah video.',
      },
    },
  ],
}
