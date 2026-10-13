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
  const [isScrolled, setIsScrolled] = useState(false)
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const logo = typeof data.logo === 'object' ? (data.logo as Media) : null
  const logoDark = typeof data.logoDark === 'object' ? (data.logoDark as Media) : null
  const siteName = data.siteName || 'Ponpes Abu Bakar Shiddiq'

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border/50 shadow-xs py-3.5'
          : 'bg-transparent py-5'
      }`}
      {...(theme && !isScrolled ? { 'data-theme': theme } : {})}
    >
      <div className="container flex justify-between items-center">
        <Link href="/" className="flex items-center">
          {logo ? (
            <>
              {/* Light mode: show logo, Dark mode: show logoDark or logo */}
              <img
                src={logo.url || ''}
                alt={logo.alt || siteName}
                width={logo.width || 280}
                height={logo.height || 88}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className={`h-12 w-auto max-w-[14rem] md:max-w-[18rem] object-contain ${
                  logoDark ? 'dark:hidden' : ''
                }`}
              />
              {logoDark && (
                <img
                  src={logoDark.url || ''}
                  alt={logoDark.alt || siteName}
                  width={logoDark.width || 280}
                  height={logoDark.height || 88}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="h-12 w-auto max-w-[14rem] md:max-w-[18rem] object-contain hidden dark:block"
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
