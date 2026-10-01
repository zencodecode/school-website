/**
 * Text state configuration for the Lexical rich text editor.
 *
 * We override `defaultColors.text` because Lexical's defaults use
 * `light-dark()` CSS function which responds to `prefers-color-scheme`
 * (the browser system preference), NOT the `data-theme` attribute used
 * by this project's theme system. This causes colors to render differently
 * in the HighImpact hero (`data-theme="dark"`) vs what the admin picks
 * in the editor.
 *
 * The colors below use plain oklch values so they are predictable everywhere.
 */

export const textStateConfig = {
  color: {
    // ── Standard palette (consistent, no light-dark() ambiguity) ──
    'text-red': {
      label: 'Red',
      css: { color: 'oklch(0.637 0.237 25.331)' },
    },
    'text-orange': {
      label: 'Orange',
      css: { color: 'oklch(0.705 0.213 47.604)' },
    },
    'text-yellow': {
      label: 'Yellow',
      css: { color: 'oklch(0.795 0.184 86.047)' },
    },
    'text-green': {
      label: 'Green',
      css: { color: 'oklch(0.723 0.191 149.579)' },
    },
    'text-blue': {
      label: 'Blue',
      css: { color: 'oklch(0.623 0.214 259.815)' },
    },
    'text-purple': {
      label: 'Purple',
      css: { color: 'oklch(0.627 0.265 303.9)' },
    },
    'text-pink': {
      label: 'Pink',
      css: { color: 'oklch(0.656 0.241 354.308)' },
    },
    'text-white': {
      label: 'White',
      css: { color: '#ffffff' },
    },

    // ── Brand colors (fixed values matching design system) ──
    brandGreen: {
      label: 'Brand Green',
      css: { color: 'oklch(48% 0.12 155deg)' },
    },
    brandGold: {
      label: 'Brand Gold',
      css: { color: 'oklch(80% 0.12 85deg)' },
    },
    brandMuted: {
      label: 'Muted',
      css: { color: 'oklch(50% 0.03 150deg)' },
    },
  },
  fontSize: {
    displayHero: {
      label: 'Display Hero',
      css: {
        'font-size': 'clamp(36px, 5vw, 56px)',
        'line-height': 'clamp(44px, 5.5vw, 64px)',
        'letter-spacing': '-0.03em',
        'font-weight': '700',
        'font-family': 'var(--font-headline)',
      },
    },
    headlineXl: {
      label: 'Headline XL',
      css: {
        'font-size': 'clamp(28px, 4vw, 40px)',
        'line-height': 'clamp(36px, 4.5vw, 48px)',
        'letter-spacing': '-0.025em',
        'font-weight': '700',
        'font-family': 'var(--font-headline)',
      },
    },
    headlineLg: {
      label: 'Headline LG',
      css: {
        'font-size': 'clamp(22px, 3vw, 30px)',
        'line-height': 'clamp(30px, 3.5vw, 38px)',
        'letter-spacing': '-0.02em',
        'font-weight': '600',
        'font-family': 'var(--font-headline)',
      },
    },
    bodyLg: {
      label: 'Body Large',
      css: {
        'font-size': '18px',
        'line-height': '28px',
        'font-weight': '400',
      },
    },
  },
} as const
