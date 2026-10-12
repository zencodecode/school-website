import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Media } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const headerData = await getCachedGlobal('header', 2)()

  const navItems = footerData?.navItems || []

  const logo = typeof headerData?.logo === 'object' ? (headerData.logo as Media) : null
  const logoDark = typeof headerData?.logoDark === 'object' ? (headerData.logoDark as Media) : null
  const siteName = headerData?.siteName || 'Ponpes Abu Bakar Shiddiq'

  return (
    <footer className="mt-auto border-t border-border bg-card text-foreground transition-colors">
      <div className="container py-10 gap-8 flex flex-col md:flex-row md:justify-between md:items-center">
        <Link className="flex items-center" href="/">
          {logo ? (
            <>
              {/* Light mode: show logo, Dark mode: show logoDark or invert */}
              <img
                src={logo.url || ''}
                alt={logo.alt || siteName}
                width={193}
                height={34}
                loading="lazy"
                decoding="async"
                className={`max-w-[9.375rem] w-full h-[34px] object-contain ${
                  logoDark ? 'dark:hidden' : 'dark:invert'
                }`}
              />
              {logoDark && (
                <img
                  src={logoDark.url || ''}
                  alt={logoDark.alt || siteName}
                  width={193}
                  height={34}
                  loading="lazy"
                  decoding="async"
                  className="max-w-[9.375rem] w-full h-[34px] object-contain hidden dark:block"
                />
              )}
            </>
          ) : logoDark ? (
            <img
              src={logoDark.url || ''}
              alt={logoDark.alt || siteName}
              width={193}
              height={34}
              loading="lazy"
              decoding="async"
              className="max-w-[9.375rem] w-full h-[34px] object-contain"
            />
          ) : (
            <span className="text-xl font-bold tracking-tight text-foreground">{siteName}</span>
          )}
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-6 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-5">
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  key={i}
                  {...link}
                />
              )
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
