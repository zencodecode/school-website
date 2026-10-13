'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { StatsGridBlock as StatsGridProps } from '@/payload-types'

function AnimatedCounter({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Parse value: prefix, numeric portion, and suffix
    // e.g. "1500+" -> prefix: "", numStr: "1500", suffix: "+"
    // "100%" -> prefix: "", numStr: "100", suffix: "%"
    const match = value.match(/^([^0-9]*)([0-9]+(?:[.,][0-9]+)?)(.*)$/)
    if (!match) {
      setDisplayValue(value)
      return
    }

    const [, prefix, numStr, suffix] = match
    const hasComma = numStr.includes(',')
    const cleanNum = parseFloat(numStr.replace(/,/g, ''))
    if (isNaN(cleanNum)) {
      setDisplayValue(value)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 1600
          const startTime = performance.now()

          const update = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out exponential
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            const current = Math.round(cleanNum * ease)

            let formatted = current.toString()
            if (hasComma || cleanNum >= 1000) {
              formatted = current.toLocaleString('id-ID')
            }

            setDisplayValue(`${prefix}${formatted}${suffix}`)

            if (progress < 1) {
              requestAnimationFrame(update)
            } else {
              setDisplayValue(value)
            }
          }

          requestAnimationFrame(update)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <div
      ref={ref}
      className="font-headline text-headline-xl font-bold text-primary tracking-tight transition-transform duration-300 group-hover:scale-105"
    >
      {displayValue}
    </div>
  )
}

export const StatsGridBlock: React.FC<StatsGridProps & { id?: string }> = (props) => {
  const { items } = props

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-2 shadow-sm w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/80">
        {items?.map((item, index) => (
          <div
            key={index}
            className="group relative flex flex-col justify-between gap-3 p-6 hover:bg-muted/40 transition-all duration-300 rounded-xl hover:-translate-y-1 hover:shadow-md cursor-default overflow-hidden"
          >
            {/* Top accent shine on hover */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between">
              <span className="text-label-mono text-muted-foreground uppercase tracking-wider text-xs font-semibold">
                {item.label}
              </span>
              {item.icon && (
                <span className="material-symbols-outlined text-primary text-[22px] transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
                  {item.icon}
                </span>
              )}
            </div>
            <div>
              <AnimatedCounter value={item.value} />
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
