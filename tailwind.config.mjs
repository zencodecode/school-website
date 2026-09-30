/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      fontSize: {
        'display-hero': [
          '56px',
          { lineHeight: '64px', letterSpacing: '-0.03em', fontWeight: '700' },
        ],
        'display-hero-mobile': [
          '36px',
          { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'headline-xl': [
          '40px',
          { lineHeight: '48px', letterSpacing: '-0.025em', fontWeight: '700' },
        ],
        'headline-xl-mobile': [
          '28px',
          { lineHeight: '36px', letterSpacing: '-0.015em', fontWeight: '700' },
        ],
        'headline-lg': [
          '30px',
          { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        'headline-md': [
          '22px',
          { lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        'headline-sm': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'label-ui': [
          '14px',
          { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' },
        ],
        'label-mono': [
          '12px',
          { lineHeight: '16px', letterSpacing: '0.04em', fontWeight: '500' },
        ],
      },
      typography: {
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
