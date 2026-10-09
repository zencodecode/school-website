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

  // Footer has dark background, prefer logoDark, fallback to logo
  const logoDark = typeof headerData?.logoDark === 'object' ? (headerData.logoDark as Media) : null
  const logo = typeof headerData?.logo === 'object' ? (headerData.logo as Media) : null
  const footerLogo = logoDark || logo
  const siteName = headerData?.siteName || 'Ponpes Abu Bakar Sidik'

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          {footerLogo ? (
            <img
              src={footerLogo.url || ''}
              alt={footerLogo.alt || siteName}
              width={193}
              height={34}
              loading="lazy"
              decoding="async"
              className="max-w-[9.375rem] w-full h-[34px] object-contain"
            />
          ) : (
            <span className="text-xl font-bold">{siteName}</span>
          )}
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
