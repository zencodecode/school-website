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
      label: 'Video URL (YouTube or Vimeo)',
      required: true,
      admin: {
        description:
          'Paste a plain video link, e.g. https://www.youtube.com/watch?v=xxxx or https://vimeo.com/xxxx. Tracking parameters such as ?si=... are ignored automatically. A full <iframe> embed code is also accepted, but a plain link is recommended.',
      },
      validate: ((value) => {
        if (!value) return 'Video URL is required'
        const result = getVideoEmbed(value)
        if (!result) {
          return 'Unrecognized URL. Please use a valid YouTube or Vimeo link.'
        }
        return true
      }) as TextFieldSingleValidation,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
      admin: {
        description: 'Caption text shown below the video.',
      },
    },
  ],
}
