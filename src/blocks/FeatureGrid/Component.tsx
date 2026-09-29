import React from 'react'
import type { FeatureGridBlock as FeatureGridProps } from '@/payload-types'

const colSpanMap: Record<string, string> = {
  wide: 'lg:col-span-7',
  narrow: 'lg:col-span-5',
  half: 'lg:col-span-6',
}

const badgeStyleMap: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-accent/10 text-accent-foreground',
  gold: 'bg-gold-badge-bg text-amber-700',
}

export const FeatureGridBlock: React.FC<FeatureGridProps & { id?: string }> = (props) => {
  const { sectionLabel, heading, description, features } = props

  return (
    <section className="w-full py-20">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-12 gap-6">
          <div className="max-w-2xl">
            {sectionLabel && (
              <div className="font-mono text-label-mono text-primary font-semibold tracking-widest uppercase mb-4">
                // {sectionLabel}
              </div>
            )}
            <h2 className="font-headline text-headline-xl font-bold">{heading}</h2>
          </div>
          {description && (
            <p className="max-w-md text-muted-foreground text-body-md">{description}</p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mt-12">
          {features?.map((feature, index) => {
            const spanClass = colSpanMap[feature.colSpan || 'half'] || colSpanMap.half
            const badgeClass =
              badgeStyleMap[feature.badgeStyle || 'primary'] || badgeStyleMap.primary
            const headingSize =
              feature.colSpan === 'wide' ? 'text-headline-lg' : 'text-headline-md'

            return (
              <div
                key={index}
                className={`bg-background border border-border rounded-xl p-8 flex flex-col justify-between group hover:border-primary transition-all md:col-span-1 ${spanClass}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    {feature.badge ? (
                      <span
                        className={`font-mono text-xs px-2.5 py-1 rounded-full font-semibold ${badgeClass}`}
                      >
                        {feature.badge}
                      </span>
                    ) : (
                      <div />
                    )}
                    {feature.icon && (
                      <span className="material-symbols-outlined text-muted-foreground text-[20px]">
                        {feature.icon}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className={`font-headline ${headingSize} font-bold mt-2`}>
                      {feature.heading}
                    </h3>
                    <p className="text-body-md text-muted-foreground leading-relaxed mt-3 max-w-xl">
                      {feature.description}
                    </p>
                  </div>

                  {feature.tags && feature.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {feature.tags.map((tagObj, tagIdx) => (
                        <div key={tagIdx} className="flex items-center gap-1.5 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{tagObj.tag}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {feature.footnote &&
                  (feature.footnote.label || feature.footnote.value) && (
                    <div className="border-t border-border mt-8 pt-6 flex items-center justify-between font-mono text-xs text-muted-foreground">
                      <span>{feature.footnote.label}</span>
                      <span className="font-semibold">{feature.footnote.value}</span>
                    </div>
                  )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
