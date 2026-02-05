import { CurrentRaceCard } from '@/components/HomePage/CurrentRaceCard'
import { PreviousRaceCard } from '@/components/HomePage/PreviousRaceCard'
import { UserInfoCard } from '@/components/HomePage/UserInfoCard'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import type { Metadata } from 'next'
import { getHomePageData } from './_lib/getHomePageData'

export default async function HomePage() {
  const { user: currentUser } = await getServerSideUser()

  const {
    openRace,
    previousRace,
    previousRaceData,
    votedCount,
    userSeasonStats,
    userRank,
    totalUsersInLeaderboard,
  } = await getHomePageData(currentUser?.id)

  return (
    <div className="p-16 min-h-[calc(100vh-100px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Пользователь */}
        <section className="lg:-span-1">
          <UserInfoCard
            user={currentUser}
            seasonStats={userSeasonStats}
            userRank={userRank}
            totalUsers={totalUsersInLeaderboard}
          />
        </section>

        {/* Грядущая гонка */}
        {openRace && (
          <section className="glow-border lg:col-span-2">
            <CurrentRaceCard race={openRace} votedCount={votedCount} />
          </section>
        )}

        {/* Прошлая гонка */}

        {previousRace && previousRaceData && (
          <section className="lg:col-span-1">
            <PreviousRaceCard race={previousRace} {...previousRaceData} />
          </section>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'L27 F1 Predictions',
  description: 'Чемпионат по прогнозам Формулы 1 — делайте прогнозы и соревнуйтесь с друзьями',
}
