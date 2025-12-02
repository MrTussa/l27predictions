import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RaceCard } from '@/components/RaceCard'

export default async function PredictionsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent('/predictions')}`)
  }

  // Получаем активные гонки текущего сезона
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
  })

  // Разделяем гонки на категории
  const now = new Date()
  const openRaces = races.filter((race) => {
    const openDate = new Date(race.predictionOpenDate)
    const closeDate = new Date(race.predictionCloseDate)
    return openDate <= now && now < closeDate
  })

  const upcomingRaces = races.filter((race) => {
    const openDate = new Date(race.predictionOpenDate)
    return openDate > now
  })

  const closedRaces = races.filter((race) => {
    const closeDate = new Date(race.predictionCloseDate)
    return closeDate <= now
  })

  return (
    <div className="container py-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 relative">
          <div className="inline-block relative">
            <h1 className="text-5xl font-bold mb-2 tracking-tight text-accent uppercase">
              RACE PREDICTIONS
            </h1>
            <div className="h-1 w-full bg-linear-to-r from-accent to-transparent" />
          </div>
          <p className="text-muted-foreground mt-4 text-lg">
            Сезон {currentYear} — {races.length} {races.length === 1 ? 'гонка' : 'гонок'}
          </p>
        </div>

        {/* Открытые для прогнозов */}
        {openRaces.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 uppercase tracking-wide">
              <span className="inline-block w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(255,223,44,0.6)]"></span>
              Прогнозы открыты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openRaces.map((race) => (
                <RaceCard key={race.id} race={race} user={user} status="open" />
              ))}
            </div>
          </section>
        )}

        {/* Предстоящие */}
        {upcomingRaces.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 uppercase tracking-wide">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
              Предстоящие
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingRaces.map((race) => (
                <RaceCard key={race.id} race={race} user={user} status="upcoming" />
              ))}
            </div>
          </section>
        )}

        {/* Завершенные */}
        {closedRaces.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 uppercase tracking-wide text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded-full bg-muted"></span>
              Завершенные
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedRaces.map((race) => (
                <RaceCard key={race.id} race={race} user={user} status="closed" />
              ))}
            </div>
          </section>
        )}

        {races.length === 0 && (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-lg mb-6 font-bold uppercase">
              Пока нет активных гонок в этом сезоне
            </p>
            <Button asChild variant="outline">
              <Link href="/">НА ГЛАВНУЮ</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Прогнозы',
  description: 'Делайте прогнозы на гонки Формулы 1 и соревнуйтесь с другими участниками',
}
