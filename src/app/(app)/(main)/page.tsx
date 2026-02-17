import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getTimezone } from '@/utilities/getTimezone'
import type { Metadata } from 'next'
import { CurrentRaceCard } from './_components/CurrentRaceCard'
import { PreviousRaceCard } from './_components/PreviousRaceCard'
import { UserInfoCard } from './_components/UserInfoCard'
import { getHomePageData } from './_lib/getHomePageData'

export default async function HomePage() {
  const [{ user: currentUser }, timeZone] = await Promise.all([getServerSideUser(), getTimezone()])

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
    <div className="px-4 md:px-16 py-6 min-h-[calc(100vh-100px)]">
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
            <CurrentRaceCard race={openRace} votedCount={votedCount} timeZone={timeZone} />
          </section>
        )}

        {/* Прошлая гонка */}

        {previousRace && previousRaceData && (
          <section className="lg:col-span-1">
            <PreviousRaceCard race={previousRace} {...previousRaceData} timeZone={timeZone} />
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

export const dynamic = 'force-dynamic'
