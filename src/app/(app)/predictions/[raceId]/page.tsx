import { PredictionForm } from '@/components/PredictionForm'
import { AboutRace } from '@/components/PredictionPage/AboutRace'
import type { User } from '@/payload-types'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import {
  getDrivers,
  getPredictionsForRace,
  getRaceById,
  getUserPredictionForRace,
} from '@/utilities/queries'
import { canMakePrediction, getRaceStatus } from '@/utilities/raceStatus'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

type Props = {
  params: Promise<{
    raceId: string
  }>
}

export default async function PredictionPage({ params }: Props) {
  const { raceId } = await params
  const { user } = await getServerSideUser()

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/predictions/${raceId}`)}`)
  }

  const race = await getRaceById(raceId)

  if (!race) {
    notFound()
  }

  const [drivers, existingPrediction, recentPredictions] = await Promise.all([
    getDrivers({ season: race.season, activeOnly: true }),
    getUserPredictionForRace(user.id, raceId),
    getPredictionsForRace(raceId, { limit: 5, sort: '-createdAt' }),
  ])

  const recentPredictors = recentPredictions
    .map((pred) => (typeof pred.user === 'object' ? pred.user : null))
    .filter((u): u is User => u !== null)

  const raceStatus = getRaceStatus(race)
  const isPredictionOpen = canMakePrediction(race)
  const isPredictionClosed = raceStatus === 'closed' || raceStatus === 'completed'

  return (
    <div className="px-4 md:px-16 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Форма прогноза - 75% */}
        <div className="lg:col-span-3">
          <PredictionForm
            race={race}
            drivers={drivers}
            user={user}
            existingPrediction={existingPrediction}
            isPredictionOpen={isPredictionOpen}
            isPredictionClosed={isPredictionClosed}
          />
        </div>

        {/* Информация о гонке - 25% */}
        <div className="lg:col-span-1">
          <AboutRace
            race={race}
            isPredictionOpen={isPredictionOpen}
            isPredictionClosed={isPredictionClosed}
            hasUserPrediction={!!existingPrediction}
            recentPredictors={recentPredictors}
          />
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceId } = await params

  try {
    const race = await getRaceById(raceId)

    return {
      title: `Прогноз на ${race.name}`,
      description: `Сделайте прогноз на гонку ${race.name}`,
    }
  } catch {
    return {
      title: 'Прогноз на гонку',
    }
  }
}
