import { LeaderboardTable } from '@/components/LeaderboardTable'
import { PointsEvolutionChart } from '@/components/PointsEvolutionChart'
import { Card } from '@/components/ui/card'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

export default async function LeaderboardPage() {
  const payload = await getPayload({ config: configPromise })

  const currentYear = new Date().getFullYear()

  const { docs: seasonStats } = await payload.find({
    collection: 'season-stats',
    where: {
      season: {
        equals: currentYear,
      },
    },
    limit: 1000,
    sort: '-totalPoints', // Cортировка по убыванию очков
    depth: 1,
  })

  const leaderboardData = seasonStats.map((stat) => {
    const user = typeof stat.user === 'object' ? stat.user : null

    return {
      id: user?.id || '',
      nickname: user?.nickname || user?.email || 'Unknown',
      chartColor: user?.chartColor || '#FFDF2C',
      totalPoints: stat.totalPoints,
      totalPredictions: stat.predictionsCount,
      perfectPredictions: stat.perfectPredictions,
      averagePoints: stat.predictionsCount > 0 ? stat.totalPoints / stat.predictionsCount : 0,
      currentStreak: stat.currentStreak,
      bestStreak: stat.bestStreak,
    }
  })

  const top10Stats = seasonStats.slice(0, 10)

  const { docs: completedRaces } = await payload.find({
    collection: 'races',
    where: {
      and: [
        {
          season: {
            equals: currentYear,
          },
        },
        {
          status: {
            equals: 'completed',
          },
        },
      ],
    },
    sort: 'round',
    limit: 100,
  })

  // Данные для графика
  const usersProgress = top10Stats.map((stat) => {
    const user = typeof stat.user === 'object' ? stat.user : null

    const cumulativePoints = stat.raceHistory?.map((history) => history.cumulativePoints) || []

    return {
      userId: user?.id || '',
      nickname: user?.nickname || user?.email || 'Unknown',
      chartColor: user?.chartColor || '#FFDF2C',
      pointsByRace: {},
      cumulativePoints,
    }
  })

  return (
    <div className="container py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 relative">
          <div className="inline-block relative">
            <h1 className="text-5xl font-bold mb-2 tracking-tight text-accent uppercase">
              RACE LEADERBOARD
            </h1>
            <div className="h-1 w-full bg-linear-to-r from-accent to-transparent" />
          </div>
          <p className="text-muted-foreground mt-4 text-lg">
            Сезон {currentYear} • {leaderboardData.length}{' '}
            {leaderboardData.length === 1
              ? 'участник'
              : leaderboardData.length < 5
                ? 'участника'
                : 'участников'}
          </p>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-lg mb-2 font-bold">ПОКА НЕТ ДАННЫХ</p>
            <p className="text-sm text-muted-foreground">
              Сделайте свой первый прогноз, чтобы попасть в таблицу лидеров
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* График эволюции очков */}
            {completedRaces.length > 0 && usersProgress.length > 0 && (
              <Card variant="default" corners="cut-corner" className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-accent uppercase tracking-tight">
                  Эволюция очков • Топ-10
                </h2>
                <PointsEvolutionChart races={completedRaces} usersProgress={usersProgress} />
              </Card>
            )}

            {/* Таблица лидеров */}
            <LeaderboardTable data={leaderboardData} />
          </div>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Таблица лидеров',
  description: 'Таблица лидеров чемпионата по прогнозам Формулы 1',
}
