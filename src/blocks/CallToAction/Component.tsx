import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container my-12">
      <div className="bg-card rounded-2xl border-border/80 border p-8 md:p-12 flex flex-col gap-8 md:flex-row md:justify-between md:items-center shadow-md relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 group">
        {/* Decorative ambient glowing orbs */}
        <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-125" />
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-[48rem] flex items-center relative z-10">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 relative z-10">
          {(links || []).map(({ link }, i) => {
            return (
              <div
                key={i}
                className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 rounded-lg inline-block"
              >
                <CMSLink size="lg" {...link} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
