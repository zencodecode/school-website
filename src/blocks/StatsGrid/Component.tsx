import React from 'react'
import type { StatsGridBlock as StatsGridProps } from '@/payload-types'

export const StatsGridBlock: React.FC<StatsGridProps & { id?: string }> = (props) => {
  const { items } = props

  return (
    <div className="bg-card border border-border rounded-xl p-2 shadow-sm w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {items?.map((item, index) => (
          <div
            key={index}
            className="flex flex-col justify-between gap-3 p-6 hover:bg-muted/30 transition-colors rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-label-mono text-muted-foreground uppercase tracking-wider">
                {item.label}
              </span>
              {item.icon && (
                <span className="material-symbols-outlined text-primary text-[20px]">
                  {item.icon}
                </span>
              )}
            </div>
            <div>
              <div className="font-headline text-headline-xl font-bold">{item.value}</div>
              {item.description && (
                <p className="text-body-sm text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
