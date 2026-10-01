'use client'

import React, { useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { ChevronDown, SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map((navItem, i) => {
        const subItems = navItem.subNavItems || []

        if (subItems.length === 0) {
          return <CMSLink key={i} {...navItem.link} appearance="link" />
        }

        return (
          <div
            key={i}
            className="relative"
            onMouseEnter={() => setOpenIndex(i)}
            onMouseLeave={() => setOpenIndex(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              {navItem.link?.label}
              <ChevronDown className="w-4 h-4" />
            </button>

            {openIndex === i && (
              <div className="absolute left-0 top-full mt-2 min-w-[200px] rounded-md border bg-background shadow-md py-2 z-50">
                {subItems.map((subItem, j) => (
                  <CMSLink
                    key={j}
                    {...subItem.link}
                    appearance="link"
                    className="block px-4 py-2 hover:bg-muted"
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
