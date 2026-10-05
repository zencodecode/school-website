import React from 'react'
import type { ProgramGridBlock as ProgramGridProps } from '@/payload-types'

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
                  className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between group hover:border-primary transition-all shadow-sm"
                >
                  <div className="flex flex-col gap-4">
                    {/* Code + Badge header */}
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      {code && (
                        <span className="text-xs text-primary font-bold">{code}</span>
                      )}
                      {badge && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded ${
                            badgeStyle === 'gold'
                              ? 'bg-gold-badge-bg text-amber-700'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </div>

                    {/* Program heading + description */}
                    <div>
                      <h3 className="font-headline text-headline-md font-bold group-hover:text-primary transition-colors">
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
                            className={`flex items-center justify-between py-1 ${
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
                        className="inline-flex items-center justify-between w-full text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>{linkLabel}</span>
                        <span className="material-symbols-outlined text-[16px]">east</span>
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
