'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, Media } from '@/payload-types'

import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const logo = typeof data.logo === 'object' ? (data.logo as Media) : null
  const logoDark = typeof data.logoDark === 'object' ? (data.logoDark as Media) : null
  const siteName = data.siteName || 'Ponpes Abu Bakar Sidik'

  return (
    <header className="container relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between">
        <Link href="/" className="flex items-center">
          {logo ? (
            <>
              {/* Light mode: show logo, Dark mode: show logoDark or logo */}
              <img
                src={logo.url || ''}
                alt={logo.alt || siteName}
                width={193}
                height={34}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className={`max-w-[9.375rem] w-full h-[34px] object-contain ${logoDark ? 'dark:hidden' : 'dark:invert'}`}
              />
              {logoDark && (
                <img
                  src={logoDark.url || ''}
                  alt={logoDark.alt || siteName}
                  width={193}
                  height={34}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="max-w-[9.375rem] w-full h-[34px] object-contain hidden dark:block"
                />
              )}
            </>
          ) : (
            <span className="text-xl font-bold">{siteName}</span>
          )}
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
