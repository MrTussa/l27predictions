import type { Race, SeasonStat, User } from '@/payload-types'
import {
  getAllPredictions,
  getAllSeasonStats,
  getRaces,
  getUserRank,
  getUserSeasonStats,
} from '@/utilities/queries'
import { canMakePrediction, isRaceCompleted } from '@/utilities/raceStatus'

export type HomePageData = {
  openRace: Race | null
  previousRace: Race | null
  previousRaceData: {
    topDrivers: { position: number; name: string }[]
    topPredictors: { position: number; user: User; points: number }[]
  } | null
  votedCount: number
  userSeasonStats: SeasonStat | null
  userRank: number | null
  totalUsersInLeaderboard: number
}

export async function getHomePageData(userId?: string): Promise<HomePageData> {
  const [races, allPredictions] = await Promise.all([getRaces(), getAllPredictions()])

  const openRace = races.find((race) => canMakePrediction(race)) || null
  const completedRaces = races.filter((race) => isRaceCompleted(race))
  const previousRace = completedRaces[completedRaces.length - 1] || null

  let votedCount = 0
  if (openRace) {
    votedCount = allPredictions.filter((pred) => {
      const race = typeof pred.race === 'object' ? pred.race : null
      return race && race.id === openRace.id
    }).length
  }

  let previousRaceData: HomePageData['previousRaceData'] = null
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

  let userSeasonStats: SeasonStat | null = null
  let userRank: number | null = null
  let totalUsersInLeaderboard = 0

  if (userId) {
    userSeasonStats = await getUserSeasonStats(userId)
    const rankData = await getUserRank(userId)
    userRank = rankData.rank
    totalUsersInLeaderboard = rankData.total
  } else {
    const allStats = await getAllSeasonStats()
    totalUsersInLeaderboard = allStats.length
  }

  return {
    openRace,
    previousRace,
    previousRaceData,
    votedCount,
    userSeasonStats,
    userRank,
    totalUsersInLeaderboard,
  }
}
