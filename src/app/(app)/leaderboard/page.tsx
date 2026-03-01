import { LeaderboardTable } from '@/components/LeaderboardTable'
import { PointsEvolutionChart } from '@/components/PointsEvolutionChart'
import { Card } from '@/components/ui/card'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { getLeaderboardData } from './_lib/getLeaderboardData'

export default async function LeaderboardPage() {
  const { leaderboardData, usersProgress, completedRaces } = await getLeaderboardData()

  return (
    <div className="container px-4 md:px-16 py-6">
      <div className="max-w-7xl mx-auto">
        {leaderboardData.length === 0 ? (
          <div className="text-center py-8 border bg-muted/20">
            <p className="text-muted-foreground text-lg mb-2 font-bold">ПОКА НЕТ ДАННЫХ</p>
            <p className="text-sm text-muted-foreground">
              Сделайте свой первый прогноз, чтобы попасть в таблицу лидеров
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {completedRaces.length > 0 && usersProgress.length > 0 && (
              <Card variant="default" corners="cut-corner">
                <h2 className="text-2xl font-bold mb-6 text-accent uppercase tracking-tight px-6">
                  Топ-10
                </h2>
                <PointsEvolutionChart races={completedRaces} usersProgress={usersProgress} />
              </Card>
            )}

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
  openGraph: mergeOpenGraph({ title: 'Таблица лидеров', url: '/leaderboard' }),
}

// Disable caching for dynamic leaderboard data
export const dynamic = 'force-dynamic'
