import React from 'react'
import type { ProgramGridBlock as ProgramGridProps } from '@/payload-types'

const badgeStyleMap: Record<string, string> = {
  default:
    'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/30 font-semibold',
  primary:
    'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/30 font-semibold',
  gold: 'bg-accent/15 text-accent-foreground border border-accent/30 dark:bg-accent/15 dark:text-accent dark:border-accent/30 font-semibold',
  muted:
    'bg-muted text-foreground/80 border border-border/80 dark:bg-muted/60 dark:text-muted-foreground dark:border-border/60 font-medium',
}

export const ProgramGridBlock: React.FC<ProgramGridProps & { id?: string }> = (props) => {
  const { id, sectionLabel, heading, programs } = props

  return (
    <section id={id ?? undefined} className="w-full py-20">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-8">
          {sectionLabel && (
            <div className="text-label-mono text-primary font-semibold tracking-widest uppercase">
              {sectionLabel}
            </div>
          )}
          <h2 className="font-headline text-headline-xl font-bold">{heading}</h2>
        </div>

        {/* Program Cards Grid */}
        {programs && programs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {programs.map((program, index) => {
              const {
                id: programId,
                code,
                badge,
                badgeStyle = 'default',
                heading: programHeading,
                description,
                specs,
                linkLabel = 'Curriculum Details',
                linkUrl,
              } = program

              return (
                <div
                  key={programId || index}
                  className="bg-card border border-border/80 rounded-2xl p-6 flex flex-col justify-between group hover:border-primary/60 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 shadow-xs relative overflow-hidden"
                >
                  {/* Subtle top shimmer glow on hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl pointer-events-none" />

                  <div className="flex flex-col gap-4">
                    {/* Code + Badge header */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/80">
                      {code && (
                        <span className="text-xs text-primary font-bold tracking-wider">{code}</span>
                      )}
                      {badge && (
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full transition-colors ${
                            badgeStyleMap[badgeStyle || 'default'] || badgeStyleMap.default
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </div>

                    {/* Program heading + description */}
                    <div>
                      <h3 className="font-headline text-headline-md font-bold group-hover:text-primary transition-colors duration-200">
                        {programHeading}
                      </h3>
                      <p className="text-body-sm text-muted-foreground mt-2">{description}</p>
                    </div>

                    {/* Specs table */}
                    {specs && specs.length > 0 && (
                      <div className="flex flex-col gap-2 pt-2 text-xs text-muted-foreground">
                        {specs.map((spec, specIndex) => (
                          <div
                            key={spec.id || specIndex}
                            className={`flex items-center justify-between py-1 transition-colors hover:text-foreground ${
                              specIndex < specs.length - 1
                                ? 'border-b border-dashed border-border'
                                : ''
                            }`}
                          >
                            <span>{spec.label}:</span>
                            <span
                              className={
                                specIndex === 0
                                  ? 'font-bold text-primary'
                                  : 'font-semibold text-foreground'
                              }
                            >
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Link footer */}
                  {linkUrl && (
                    <div className="border-t border-border mt-6 pt-4">
                      <a
                        href={linkUrl}
                        className="inline-flex items-center justify-between w-full text-xs font-semibold text-primary group/link transition-colors"
                      >
                        <span>{linkLabel}</span>
                        <span className="material-symbols-outlined text-[16px] group-hover/link:translate-x-1.5 transition-transform duration-200">
                          east
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
