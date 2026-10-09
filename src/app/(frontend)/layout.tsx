import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Plus_Jakarta_Sans } from 'next/font/google'
import React from 'react'

import type { Media } from '@/payload-types'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { getCachedGlobal } from '@/utilities/getGlobals'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const headerData = await getCachedGlobal('header', 2)()

  const faviconIco =
    typeof headerData?.faviconIco === 'object' ? (headerData.faviconIco as Media) : null
  const faviconSvg =
    typeof headerData?.faviconSvg === 'object' ? (headerData.faviconSvg as Media) : null

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable, plusJakartaSans.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href={faviconIco?.url || '/favicon.ico'} rel="icon" sizes="32x32" />
        <link href={faviconSvg?.url || '/favicon.svg'} rel="icon" type="image/svg+xml" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
