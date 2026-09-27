import { Heading, Panel } from '@/components/Broadcast'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { PointsEvolutionChart } from '@/components/PointsEvolutionChart'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { cacheLife, cacheTag } from 'next/cache'
import { RaceRatingsSection } from './_components/RaceRatingsSection'
import { SeasonPodium } from './_components/SeasonPodium'
import { getLeaderboardData } from './_lib/getLeaderboardData'

export default async function LeaderboardPage() {
  'use cache'
  cacheTag('season-stats', 'races')
  cacheLife('hours')

  const { usersProgress, completedRaces, ratedRaces, seasonPodium, standings } =
    await getLeaderboardData()

  return (
    <div className="px-4 md:px-16 py-6 space-y-6 max-w-450 mx-auto">
      <h1 className="sr-only">Таблица лидеров</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <SeasonPodium entries={seasonPodium} />
          <RaceRatingsSection races={ratedRaces} />
        </div>

        {completedRaces.length > 0 && usersProgress.length > 0 && (
          <Panel className="h-full">
            <Heading index="03" aside="топ-10 по очкам">
              Гонка за титул
            </Heading>
            <PointsEvolutionChart races={completedRaces} usersProgress={usersProgress} />
          </Panel>
        )}
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <Heading index="04" aside="▲▼ — за последнюю гонку">
          Таблица чемпионата
        </Heading>
        <LeaderboardTable entries={standings} />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Таблица лидеров',
  description: 'Таблица лидеров чемпионата по прогнозам Формулы 1',
  openGraph: mergeOpenGraph({ title: 'Таблица лидеров', url: '/leaderboard' }),
}
