import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import { getHeaderData } from '@/utilities/queries'
import { ClarityAnalytics } from '@/components/metrics/ClarityAnalytics'
import { TimezoneDetector } from '@/components/TimezoneDetector'
import { Providers } from '@/providers'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: 'L27 F1 Predictions',
    template: '%s | L27 F1 Predictions',
  },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { isLive, unvotedEventsCount } = await getHeaderData()

  return (
    <html
      className={[GeistSans.variable, GeistMono.variable, 'dark'].filter(Boolean).join(' ')}
      data-theme="dark"
      lang="ru"
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <ClarityAnalytics projectId={process.env.CLARITY_ID!} />
        <TimezoneDetector />
        <Providers>
          <AdminBar />

          <Header isLive={isLive} unvotedEventsCount={unvotedEventsCount} />
          <main className="canvas min-h-[70dvh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
