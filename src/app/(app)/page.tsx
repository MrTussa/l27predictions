import { CurrentRaceCard } from '@/components/HomePage/CurrentRaceCard'
import { PreviousRaceCard } from '@/components/HomePage/PreviousRaceCard'
import { UserInfoCard } from '@/components/HomePage/UserInfoCard'
import type { User } from '@/payload-types'
import { getServerSideUser } from '@/utilities/getServerSideUser'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const currentYear = new Date().getFullYear()
  const now = new Date()

  // Получаем текущего пользователя
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

  // Находим открытую гонку
  const openRace = races.find((race) => {
    const openDate = new Date(race.predictionOpenDate)
    const closeDate = new Date(race.predictionCloseDate)
    return openDate <= now && now < closeDate
  })

  // Находим предыдущую завершенную гонку
  const completedRaces = races.filter((race) => {
    const raceDate = new Date(race.raceDate)
    return raceDate < now && race.results && race.results.length > 0
  })
  const previousRace = completedRaces[completedRaces.length - 1]

  // Получаем все прогнозы
  const { docs: allPredictions } = await payload.find({
    collection: 'predictions',
    limit: 10000,
    depth: 2,
  })

  // Получаем всех пользователей
  const { docs: users } = await payload.find({
    collection: 'users',
    limit: 1000,
  })

  // Подсчет количества проголосовавших для открытой гонки
  let votedCount = 0
  if (openRace) {
    votedCount = allPredictions.filter((pred) => {
      const race = typeof pred.race === 'object' ? pred.race : null
      return race && race.id === openRace.id
    }).length
  }

  // Топ 3 гонщика и топ 3 предсказателя для предыдущей гонки
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
    <div className="p-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Карточка 1: Информация о пользователе - 25% (1 колонка из 4) */}
        {currentUser && (
          <div className="lg:col-span-1">
            <UserInfoCard
              user={currentUser}
              allUsers={users}
              allPredictions={allPredictions}
              currentYear={currentYear}
            />
          </div>
        )}

        {/* Карточка 2: Грядущая гонка - 50% (2 колонки из 4) */}
        {openRace && (
          <div className="lg:col-span-2">
            <CurrentRaceCard race={openRace} votedCount={votedCount} />
          </div>
        )}

        {/* Карточка 3: Прошлая гонка - 25% (1 колонка из 4) */}

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
