import { PredictionForm } from '@/components/PredictionForm'
import { AboutRace } from '@/components/PredictionPage/AboutRace'
import type { User } from '@/payload-types'
import { canMakePrediction, getRaceStatus } from '@/utilities/raceStatus'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

type Props = {
  params: Promise<{
    raceId: string
  }>
}

export default async function PredictionPage({ params }: Props) {
  const { raceId } = await params
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/predictions/${raceId}`)}`)
  }

  const race = await payload.findByID({
    collection: 'races',
    id: raceId,
  })

  if (!race) {
    notFound()
  }

  const { docs: drivers } = await payload.find({
    collection: 'drivers',
    where: {
      and: [
        {
          season: {
            equals: race.season,
          },
        },
        {
          isActive: {
            equals: true,
          },
        },
      ],
    },
    sort: 'number',
    limit: 100,
  })

  const { docs: existingPredictions } = await payload.find({
    collection: 'predictions',
    where: {
      and: [
        {
          user: {
            equals: user.id,
          },
        },
        {
          race: {
            equals: raceId,
          },
        },
      ],
    },
    limit: 1,
  })

  const existingPrediction = existingPredictions[0] || null

  // последние 5 проголосовавших
  const { docs: allPredictions } = await payload.find({
    collection: 'predictions',
    where: {
      race: {
        equals: raceId,
      },
    },
    sort: '-createdAt',
    limit: 5,
    depth: 1,
  })

  const recentPredictors = allPredictions
    .map((pred) => (typeof pred.user === 'object' ? pred.user : null))
    .filter((u): u is User => u !== null)

  const raceStatus = getRaceStatus(race)
  const isPredictionOpen = canMakePrediction(race)
  const isPredictionClosed = raceStatus === 'closed' || raceStatus === 'completed'

  return (
    <div className="p-16">
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
  const payload = await getPayload({ config: configPromise })

  try {
    const race = await payload.findByID({
      collection: 'races',
      id: raceId,
    })

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
