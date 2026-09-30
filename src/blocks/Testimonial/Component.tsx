import React from 'react'
import type { TestimonialBlock as TestimonialProps } from '@/payload-types'
import { Media } from '@/components/Media'

const parseQuote = (text: string) => {
  const parts = text.split('|')
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span key={index} className="text-gold-badge">
          {part}
        </span>
      )
    }
    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}

export const TestimonialBlock: React.FC<TestimonialProps & { id?: string }> = (props) => {
  const {
    id,
    sectionLabel,
    quote,
    personName,
    personTitle,
    personCredentials,
    photo,
    orgName,
    orgDescription,
    linkLabel,
    linkUrl,
  } = props

  const hasPhoto = typeof photo === 'object' && photo !== null

  return (
    <section
      id={id ?? undefined}
      className="w-full bg-dark-section text-white py-20 relative overflow-hidden"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column — Photo */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-xl overflow-hidden border border-gray-800 shadow-2xl bg-gray-900">
              {hasPhoto ? (
                <Media resource={photo} fill className="object-cover object-center" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-600">
                  {personName?.charAt(0)}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <p className="font-mono text-[10px] text-primary uppercase tracking-wider mb-1">
                  {personTitle}
                </p>
                <p className="font-headline font-bold text-white text-lg leading-tight">
                  {personName}
                </p>
              </div>
            </div>

            {personCredentials && (
              <div className="mt-4 flex items-start gap-2 max-w-[320px]">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-body-sm text-gray-400">{personCredentials}</p>
              </div>
            )}
          </div>

          {/* Right Column — Quote */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-gold-badge text-3xl">
                format_quote
              </span>
              {sectionLabel && (
                <span className="font-mono text-label-mono text-gray-400 uppercase tracking-widest">
                  // {sectionLabel}
                </span>
              )}
            </div>

            <blockquote className="font-headline text-headline-lg font-medium leading-relaxed text-white">
              &ldquo;{parseQuote(quote)}&rdquo;
            </blockquote>

            {(orgName || orgDescription || linkUrl) && (
              <div className="border-t border-gray-700 pt-6 mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  {orgName && <p className="font-semibold text-white">{orgName}</p>}
                  {orgDescription && (
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">{orgDescription}</p>
                  )}
                </div>

                {linkUrl && (
                  <a
                    href={linkUrl}
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary hover:text-white transition-colors"
                  >
                    <span>{linkLabel || 'Learn More'}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
