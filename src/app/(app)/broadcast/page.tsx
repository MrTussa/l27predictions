import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { userAgent } from 'next/server'
import { getPayload } from 'payload'

import { checkRole } from '@/access/utilities'
import { getServerSideUser } from '@/utilities/getServerSideUser'

import { BroadcastLayout } from './_components/BroadcastLayout'

export const metadata: Metadata = {
  title: 'Трансляция',
  description: 'Смотрите трансляцию Формулы 1 вместе с любимым стримером',
  openGraph: mergeOpenGraph({ title: 'Трансляция', url: '/broadcast' }),
}

export const dynamic = 'force-dynamic'

export default async function BroadcastPage() {
  const headersList = await headers()
  const { device } = userAgent({ headers: headersList })
  const ua = headersList.get('user-agent') ?? ''
  const isMobile =
    device.type === 'mobile' || device.type === 'tablet' || /iPhone|iPad|iPod|Android/i.test(ua)

  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'broadcast-settings' })
  const { user } = await getServerSideUser()
  const isAdmin = checkRole(['admin'], user)

  return (
    <div>
      <div className="container px-4 md:px-16 py-4">
        <h1 className="text-4xl font-bold uppercase tracking-tight">Трансляция</h1>
      </div>

      <BroadcastLayout settings={settings} isAdmin={isAdmin} isMobile={isMobile} />
    </div>
  )
}
