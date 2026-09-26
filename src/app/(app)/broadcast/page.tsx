import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { userAgent } from 'next/server'

import { isAdmin } from '@/access'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getBroadcastSettings } from '@/utilities/queries'

import { BroadcastLayout } from './_components/BroadcastLayout'

export const metadata: Metadata = {
  title: 'Трансляция',
  description: 'Смотрите трансляцию Формулы 1 вместе с любимым стримером',
  openGraph: mergeOpenGraph({ title: 'Трансляция', url: '/broadcast' }),
}


export default async function BroadcastPage() {
  const headersList = await headers()
  const { device } = userAgent({ headers: headersList })
  const ua = headersList.get('user-agent') ?? ''
  const isMobile =
    device.type === 'mobile' || device.type === 'tablet' || /iPhone|iPad|iPod|Android/i.test(ua)

  const [settings, { user }] = await Promise.all([getBroadcastSettings(), getServerSideUser()])
  return (
    <div>
      <div className="container px-4 md:px-16 py-4">
        <h1 className="text-4xl font-bold uppercase tracking-tight">Трансляция</h1>
      </div>

      <BroadcastLayout settings={settings} isAdmin={isAdmin(user)} isMobile={isMobile} />
    </div>
  )
}
