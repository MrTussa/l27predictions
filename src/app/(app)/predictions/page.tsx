import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { PredictionsPageClient } from './PredictionsPageClient'

export default async function PredictionsPage() {
  const { user } = await getServerSideUser()
  const payload = await getPayload({ config: configPromise })

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent('/predictions')}`)
  }

  const currentYear = new Date().getFullYear()

  const { docs: races } = await payload.find({
    collection: 'races',
    where: {
      season: {
        equals: currentYear,
      },
    },
    sort: 'round',
    limit: 100,
    depth: 2,
  })

  const { docs: userPredictions } = await payload.find({
    collection: 'predictions',
    where: {
      user: {
        equals: user.id,
      },
    },
    depth: 2,
    limit: 100,
  })

  return <PredictionsPageClient races={races} user={user} userPredictions={userPredictions} />
}

export const metadata: Metadata = {
  title: 'Прогнозы',
  description: 'Делайте прогнозы на гонки Формулы 1 и соревнуйтесь с другими участниками',
}
