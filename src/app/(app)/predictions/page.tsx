import { getServerSideUser } from '@/utilities/getServerSideUser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import {
  getAllPredictions,
  getRaces,
  getTeams,
  getUserPredictions,
  getUserRacesRating,
} from '@/utilities/queries'
import { isRaceCompleted } from '@/utilities/raceStatus'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { buildConsensusMap } from './_lib/buildConsensus'
import { PredictionsPageClient } from './PredictionsPageClient'

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ race?: string }>
}) {
  const { user } = await getServerSideUser()

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent('/predictions')}`)
  }

  const { race: initialRaceId } = await searchParams

  const [races, userPredictions, teams, racesRating] = await Promise.all([
    getRaces({ depth: 2 }),
    getUserPredictions(user.id, { depth: 1 }),
    getTeams({ depth: 1 }),
    getUserRacesRating(user.id),
  ])

  // Консенсус нужен только по завершённым гонкам — не тянем всю коллекцию.
  const completedRaceIds = races.filter(isRaceCompleted).map((race) => race.id)
  const allPredictions = await getAllPredictions({ raceIds: completedRaceIds, depth: 2 })

  return (
    <PredictionsPageClient
      races={races}
      teams={teams}
      userPredictions={userPredictions}
      racesRating={racesRating}
      consensusByRace={buildConsensusMap(races, allPredictions)}
      initialRaceId={initialRaceId}
    />
  )
}

export const metadata: Metadata = {
  title: 'Прогнозы',
  description: 'Делайте прогнозы на гонки Формулы 1 и соревнуйтесь с другими участниками',
  openGraph: mergeOpenGraph({ title: 'Прогнозы', url: '/predictions' }),
}

export const dynamic = 'force-dynamic'
