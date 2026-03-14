import type { Race, User } from '@/payload-types'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getTimezone } from '@/utilities/getTimezone'
import {
  getDrivers,
  getPredictionsForRace,
  getRaceById,
  getUserPredictionForRace,
} from '@/utilities/queries'
import { canMakePrediction, getRaceStatus } from '@/utilities/raceStatus'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { userAgent } from 'next/server'

import { AboutRace } from './_components/AboutRace'
import { PredictionDrawer } from './_components/PredictionDrawer'
import { PredictionForm } from './_components/PredictionForm'

type Props = {
  params: Promise<{
    raceId: string
  }>
}

export default async function PredictionPage({ params }: Props) {
  const headersList = await headers()
  const { device } = userAgent({ headers: headersList })
  const ua = headersList.get('user-agent') ?? ''
  const isMobile =
    device.type === 'mobile' || device.type === 'tablet' || /iPhone|iPad|iPod|Android/i.test(ua)

  const { raceId } = await params
  const [{ user }, timeZone, race] = await Promise.all([
    getServerSideUser(),
    getTimezone(),
    getRaceById(raceId).catch(() => null) as Promise<Race | null>,
  ])

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/predictions/${raceId}`)}`)
  }

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
          {isMobile ? (
            <PredictionDrawer
              race={race}
              drivers={drivers}
              existingPrediction={existingPrediction}
              isPredictionOpen={isPredictionOpen}
            />
          ) : (
            <PredictionForm
              race={race}
              drivers={drivers}
              existingPrediction={existingPrediction}
              isPredictionOpen={isPredictionOpen}
            />
          )}
        </div>

        {/* Информация о гонке - 25% */}
        <div className="lg:col-span-1">
          <AboutRace
            race={race}
            isPredictionOpen={isPredictionOpen}
            isPredictionClosed={isPredictionClosed}
            hasUserPrediction={!!existingPrediction}
            recentPredictors={recentPredictors}
            timeZone={timeZone}
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

export const dynamic = 'force-dynamic'
