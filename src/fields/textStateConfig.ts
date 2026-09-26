import { defaultColors } from '@payloadcms/richtext-lexical'

export const textStateConfig = {
  color: {
    ...defaultColors.text,
    galaxy: {
      label: 'Galaxy',
      css: { background: 'linear-gradient(to right, #0000ff, #ff0000)', color: 'white' },
    },
    sunset: {
      label: 'Sunset',
      css: { background: 'linear-gradient(to top, #ff5f6d, #6a3093)' },
    },
  },
} as const
