import { LeaderboardTable } from '@/components/LeaderboardTable'
import { PointsEvolutionChart } from '@/components/PointsEvolutionChart'
import { Card } from '@/components/ui/card'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { RaceConsensus } from './_components/RaceConsensus'
import { RaceRatingsSection } from './_components/RaceRatingsSection'
import { SeasonPodium } from './_components/SeasonPodium'
import { getLeaderboardData } from './_lib/getLeaderboardData'

export default async function LeaderboardPage() {
  const { usersProgress, completedRaces, ratedRaces, seasonPodium, consensus } =
    await getLeaderboardData()

  return (
    <div className="px-4 md:px-16 py-6 space-y-6 max-w-450 mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <SeasonPodium entries={seasonPodium} />
          {consensus && <RaceConsensus consensus={consensus} />}
        </div>

        {completedRaces.length > 0 && usersProgress.length > 0 && (
          <Card variant="default" corners="cut-corner" className="h-full">
            <PointsEvolutionChart races={completedRaces} usersProgress={usersProgress} />
          </Card>
        )}
      </div>

      <RaceRatingsSection races={ratedRaces} />

      <div className="w-full flex justify-center">
        <LeaderboardTable />
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
