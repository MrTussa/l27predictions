import { CurrentRaceCard } from '@/components/HomePage/CurrentRaceCard'
import { PreviousRaceCard } from '@/components/HomePage/PreviousRaceCard'
import { UserInfoCard } from '@/components/HomePage/UserInfoCard'
import type { SeasonStat, User } from '@/payload-types'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import { canMakePrediction, isRaceCompleted } from '@/utilities/raceStatus'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const currentYear = new Date().getFullYear()

  const { user: currentUser } = await getServerSideUser()

  // Получаем все гонки
  const { docs: races } = await payload.find({
    collection: 'races',
    where: {
      season: {
        equals: currentYear,
      },
    },
    sort: 'round',
  })

  // Открытая гонка (используем унифицированную функцию)
  const openRace = races.find((race) => canMakePrediction(race))

  // Завершенные гонки (используем унифицированную функцию)
  const completedRaces = races.filter((race) => isRaceCompleted(race))
  const previousRace = completedRaces[completedRaces.length - 1]

  const { docs: allPredictions } = await payload.find({
    collection: 'predictions',
    limit: 10000,
    depth: 2,
  })

  let userSeasonStats: SeasonStat | null = null
  let userRank: number | null = null
  let totalUsersInLeaderboard = 0
  if (currentUser) {
    const { docs: stats } = await payload.find({
      collection: 'season-stats',
      where: {
        and: [{ user: { equals: currentUser.id } }, { season: { equals: currentYear } }],
      },
      limit: 1,
    })
    userSeasonStats = stats[0] || null

    const { docs: allStats } = await payload.find({
      collection: 'season-stats',
      where: { season: { equals: currentYear } },
      sort: '-totalPoints',
    })
    totalUsersInLeaderboard = allStats.length

    if (userSeasonStats && userSeasonStats.id) {
      userRank = allStats.findIndex((s) => s.id === userSeasonStats!.id) + 1
    }
  }

  let votedCount = 0
  if (openRace) {
    votedCount = allPredictions.filter((pred) => {
      const race = typeof pred.race === 'object' ? pred.race : null
      return race && race.id === openRace.id
    }).length
  }

  let previousRaceData = null
  if (previousRace) {
    const topDrivers =
      previousRace.results?.slice(0, 3).map((result, index) => ({
        position: index + 1,
        name: typeof result.driver === 'object' ? result.driver.name : 'Unknown',
      })) || []

    const racePredictions = allPredictions.filter((pred) => {
      const race = typeof pred.race === 'object' ? pred.race : null
      return race && race.id === previousRace.id
    })

    const topPredictors = racePredictions
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 3)
      .map((pred, index) => ({
        position: index + 1,
        user: (typeof pred.user === 'object' ? pred.user : {}) as User,
        points: pred.points || 0,
      }))

    previousRaceData = { topDrivers, topPredictors }
  }

  return (
    <div className="p-16 min-h-[calc(100vh-100px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Пользователь */}
        <div className="lg:col-span-1">
          <UserInfoCard
            user={currentUser}
            seasonStats={userSeasonStats}
            userRank={userRank}
            totalUsers={totalUsersInLeaderboard}
          />
        </div>

        {/* Грядущая гонка */}
        {openRace && (
          <div className="lg:col-span-2">
            <CurrentRaceCard race={openRace} votedCount={votedCount} />
          </div>
        )}

        {/* Прошлая гонка */}

        {previousRace && previousRaceData && (
          <div className="lg:col-span-1">
            <PreviousRaceCard race={previousRace} {...previousRaceData} />
          </div>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'L27 F1 Predictions',
  description: 'Чемпионат по прогнозам Формулы 1 — делайте прогнозы и соревнуйтесь с друзьями',
}
