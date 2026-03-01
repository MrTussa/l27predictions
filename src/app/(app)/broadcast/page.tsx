import configPromise from '@payload-config'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { userAgent } from 'next/server'
import { getPayload } from 'payload'

import { IconDeviceDesktop } from '@tabler/icons-react'

import { checkRole } from '@/access/utilities'
import { Card } from '@/components/ui/card'
import { getServerSideUser } from '@/utilities/getServerSideUser'

import { BroadcastLayout } from './_components/BroadcastLayout'

export const metadata: Metadata = {
  title: 'Трансляция',
  description: 'Смотрите трансляцию Формулы 1 вместе с любимым стримером',
  openGraph: mergeOpenGraph({ title: 'Трансляция', url: '/broadcast' }),
}

export const dynamic = 'force-dynamic'

export default async function BroadcastPage() {
  const { device } = userAgent({ headers: await headers() })
  const isMobile = device.type === 'mobile' || device.type === 'tablet'

  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'broadcast-settings' })
  const { user } = await getServerSideUser()
  const isAdmin = checkRole(['admin'], user)

  return (
    <div>
      <div className="container px-4 md:px-16 py-4">
        <h1 className="text-4xl font-bold uppercase tracking-tight">Трансляция</h1>
      </div>

      {isMobile ? (
        <div className="container px-4 md:px-16">
          <Card variant="default" corners="cut-corner">
            <div className="flex items-center justify-center py-20 px-4">
              <div className="text-center space-y-3">
                <IconDeviceDesktop size={48} className="mx-auto text-muted-foreground" />
                <p className="text-muted-foreground font-bold uppercase tracking-wider text-lg">
                  Доступно только на ПК
                </p>
                <p className="text-muted-foreground text-sm">
                  Откройте эту страницу на компьютере для просмотра трансляции
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <BroadcastLayout settings={settings} isAdmin={isAdmin} />
      )}
    </div>
  )
}
