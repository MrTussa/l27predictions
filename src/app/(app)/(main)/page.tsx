import { SeasonRecapBanner } from '@/components/SeasonRecapBanner'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { getTimezone } from '@/utilities/getTimezone'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { Metadata } from 'next'
import { Suspense } from 'react'
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
      <h1 className="sr-only">L27 — чемпионат прогнозов Формулы 1</h1>
      {currentUser && (
        <Suspense fallback={null}>
          <SeasonRecapBanner
            userId={currentUser.id}
            viewer={currentUser}
            previewForAdmins={false}
            className="mb-6"
          />
        </Suspense>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Пользователь */}
        <section className="order-2 xl:order-1">
          <UserInfoCard
            user={currentUser}
            seasonStats={userSeasonStats}
            userRank={userRank}
            totalUsers={totalUsersInLeaderboard}
          />
        </section>

        {/* Грядущая гонка */}
        {openRace && (
          <section className="glow-border glow-border-pulse order-1 md:col-span-2 xl:order-2">
            <CurrentRaceCard race={openRace} votedCount={votedCount} timeZone={timeZone} />
          </section>
        )}

        {/* Прошлая гонка */}

        {previousRace && previousRaceData && (
          <section className="order-3">
            <PreviousRaceCard race={previousRace} {...previousRaceData} timeZone={timeZone} />
          </section>
        )}

        {!openRace && !previousRace && (
          <section className="order-1 md:col-span-2 xl:col-span-3 flex items-center justify-center p-8 text-center text-muted-foreground">
            Сезон ещё не начался — приём прогнозов откроется перед первой гонкой
          </section>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: { absolute: 'L27 F1 Predictions — Чемпионат прогнозов Формулы 1' },
  description: 'Чемпионат по прогнозам Формулы 1 — делайте прогнозы и соревнуйтесь с друзьями',
  openGraph: mergeOpenGraph({ url: '/' }),
}
