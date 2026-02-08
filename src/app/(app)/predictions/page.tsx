import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getRaces, getTeams, getUserPredictions } from '@/utilities/queries'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PredictionsPageClient } from './PredictionsPageClient'

export default async function PredictionsPage() {
  const { user } = await getServerSideUser()

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent('/predictions')}`)
  }

  const [races, userPredictions, teams] = await Promise.all([
    getRaces({ depth: 2 }),
    getUserPredictions(user.id, { depth: 1 }),
    getTeams({ depth: 1 }),
  ])

  return <PredictionsPageClient races={races} teams={teams} userPredictions={userPredictions} />
}

export const metadata: Metadata = {
  title: 'Прогнозы',
  description: 'Делайте прогнозы на гонки Формулы 1 и соревнуйтесь с другими участниками',
}

export const dynamic = 'force-dynamic'
