import React from 'react'

import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'

import type { AccentSectionBlock as AccentSectionProps } from '@/payload-types'

type Props = AccentSectionProps & {
  className?: string
  disableInnerContainer?: boolean
  id?: string
}

// All classes are theme-token based so they automatically adapt to dark/light.
const backgroundClasses: Record<string, string> = {
  none: '',
  muted: 'bg-muted',
  card: 'bg-card',
  primary: 'bg-primary text-primary-foreground',
}

const accentColorClasses = {
  primary: {
    gradient: 'from-primary/25 via-primary/5',
    soft: 'bg-primary/15',
    line: 'via-primary/60',
    dot: 'bg-primary',
    ring: 'ring-primary/30',
  },
  accent: {
    gradient: 'from-accent/30 via-accent/10',
    soft: 'bg-accent/20',
    line: 'via-accent/70',
    dot: 'bg-accent',
    ring: 'ring-accent/40',
  },
}

function renderAccent(style: string, color: 'primary' | 'accent') {
  const ac = accentColorClasses[color] ?? accentColorClasses.primary

  if (style === 'diagonal') {
    return (
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 -skew-y-3 bg-gradient-to-r to-transparent',
          ac.gradient,
        )}
      />
    )
  }

  if (style === 'band') {
    return (
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-1/2 h-28 -translate-y-1/2',
          ac.soft,
        )}
      />
    )
  }

  if (style === 'line') {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center"
      >
        <div
          className={cn('h-px w-full bg-gradient-to-r from-transparent to-transparent', ac.line)}
        />
        <div className={cn('absolute h-3 w-3 rotate-45 rounded-[2px]', ac.dot)} />
      </div>
    )
  }

  return null
}

export const AccentSectionBlock: React.FC<Props> = (props) => {
  const {
    background = 'muted',
    accentStyle = 'diagonal',
    accentColor = 'primary',
    align = 'left',
    eyebrow,
    heading,
    description,
    media,
    mediaPosition = 'right',
    links,
    className,
  } = props

  const bg = background ?? 'muted'
  const style = accentStyle ?? 'diagonal'
  const onPrimary = bg === 'primary'
  const hasMedia = Boolean(media) && typeof media === 'object'
  const centered = align === 'center' && !hasMedia

  const headingColor = onPrimary ? 'text-primary-foreground' : 'text-foreground'
  const descColor = onPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'
  const eyebrowColor = onPrimary ? 'text-primary-foreground/70' : 'text-primary'

  const safeAccentColor = accentColor === 'accent' ? 'accent' : 'primary'

  const content = (
    <div
      className={cn(
        'flex flex-col gap-5',
        centered && 'mx-auto max-w-2xl items-center text-center',
      )}
    >
      {eyebrow && (
        <span
          className={cn('text-label-mono font-semibold uppercase tracking-widest', eyebrowColor)}
        >
          {eyebrow}
        </span>
      )}
      <h2 className={cn('font-headline text-headline-xl font-bold', headingColor)}>{heading}</h2>
      {description && (
        <p
          className={cn('text-body-lg max-w-xl leading-relaxed', descColor, centered && 'mx-auto')}
        >
          {description}
        </p>
      )}
      {Array.isArray(links) && links.length > 0 && (
        <div className={cn('flex flex-wrap gap-4 pt-2', centered && 'justify-center')}>
          {links.map(({ link }, i) => (
            <CMSLink key={i} size="lg" {...link} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden py-20 md:py-28',
        backgroundClasses[bg] ?? backgroundClasses.muted,
        className,
      )}
    >
      {renderAccent(style, safeAccentColor)}

      <div className="container relative z-10">
        {hasMedia ? (
          <div
            className={cn('flex flex-col gap-10 md:flex-row md:items-center', {
              'md:flex-row-reverse': mediaPosition === 'left',
            })}
          >
            <div className="w-full md:w-1/2">{content}</div>
            <div className="w-full md:w-1/2">
              <div
                className={cn(
                  'relative overflow-hidden rounded-2xl border border-border shadow-lg ring-1',
                  accentColorClasses[safeAccentColor].ring,
                )}
              >
                <Media imgClassName="w-full h-auto object-cover" resource={media} />
              </div>
            </div>
          </div>
        ) : (
          content
        )}
      </div>
    </section>
  )
}
