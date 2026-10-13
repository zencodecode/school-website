'use client'

import React, { useEffect, useRef, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { ChevronDown, SearchIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // Close dropdown on route change
  useEffect(() => {
    setOpenIndex(null)
  }, [pathname])

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenIndex(null)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenIndex(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleMouseEnter = (i: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setOpenIndex(i)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setOpenIndex(null)
    }, 200)
  }

  const handleItemClick = (i: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setOpenIndex((prev) => (prev === i ? null : i))
  }

  return (
    <nav ref={navRef} className="flex gap-3 items-center">
      {navItems.map((navItem, i) => {
        const subItems = navItem.subNavItems || []

        if (subItems.length === 0) {
          return (
            <div
              key={i}
              className="flex items-center"
              onMouseEnter={() => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current)
                  timeoutRef.current = null
                }
                setOpenIndex(null)
              }}
            >
              <CMSLink {...navItem.link} appearance="link" />
            </div>
          )
        }

        const isOpen = openIndex === i

        return (
          <div
            key={i}
            className="relative"
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4 cursor-pointer"
              onClick={() => handleItemClick(i)}
              aria-expanded={isOpen}
            >
              {navItem.link?.label}
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </button>

            {isOpen && (
              <div
                className="absolute left-0 top-full pt-2 min-w-[200px] z-50 animate-in fade-in-0 zoom-in-95 duration-150"
                onClick={() => setOpenIndex(null)}
              >
                <div className="rounded-md border bg-background shadow-md py-1 overflow-hidden">
                  {subItems.map((subItem, j) => (
                    <CMSLink
                      key={j}
                      {...subItem.link}
                      appearance="inline"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                    />
                  ))}
                </div>
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
