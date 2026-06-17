import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import { ClarityAnalytics } from '@/components/metrics/ClarityAnalytics'
import { TimezoneDetector } from '@/components/TimezoneDetector'
import BgStage from '@/components/ui/background'
import { Providers } from '@/providers'
import { getHeaderData } from '@/utilities/queries'
import localFont from 'next/font/local'

const titillium = localFont({
  src: [
    { path: '../../fonts/titillium/TitilliumWeb-Regular.ttf',    weight: '400', style: 'normal' },
    { path: '../../fonts/titillium/TitilliumWeb-SemiBold.ttf',   weight: '600', style: 'normal' },
    { path: '../../fonts/titillium/TitilliumWeb-Bold.ttf',       weight: '700', style: 'normal' },
    { path: '../../fonts/titillium/TitilliumWeb-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../../fonts/titillium/TitilliumWeb-Black.ttf',      weight: '900', style: 'normal' },
  ],
  variable: '--font-geist-sans',
})

const jetbrains = localFont({
  src: '../../fonts/jetBrainsMono/JetBrainsMono-VariableFont_wght.ttf',
  variable: '--font-geist-mono',
})
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
      className={[titillium.variable, jetbrains.variable, 'dark'].filter(Boolean).join(' ')}
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
          <BgStage />
          <Header isLive={isLive} unvotedEventsCount={unvotedEventsCount} />
          <main className="canvas min-h-[70dvh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
