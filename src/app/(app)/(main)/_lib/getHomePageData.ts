import type { Race, SeasonStat, Team, User } from '@/payload-types'
import {
  countPredictionsForRace,
  countSeasonStats,
  getRaces,
  getTeams,
  getTopPredictionsForRace,
  getUserRank,
  getUserSeasonStats,
} from '@/utilities/queries'
import { canMakePrediction, isRaceCompleted } from '@/utilities/raceStatus'

export type HomePageData = {
  openRace: Race | null
  previousRace: Race | null
  previousRaceData: {
    topDrivers: { position: number; name: string; team: Team }[]
    topPredictors: { position: number; user: User; points: number }[]
  } | null
  votedCount: number
  userSeasonStats: SeasonStat | null
  userRank: number | null
  totalUsersInLeaderboard: number
}

async function getUserBlock(userId?: string) {
  if (!userId) {
    return { userSeasonStats: null, userRank: null, totalUsersInLeaderboard: await countSeasonStats() }
  }
  const [userSeasonStats, { rank, total }] = await Promise.all([
    getUserSeasonStats(userId),
    getUserRank(userId),
  ])
  return { userSeasonStats, userRank: rank, totalUsersInLeaderboard: total }
}

export async function getHomePageData(userId?: string): Promise<HomePageData> {
  const [races, teams, userBlock] = await Promise.all([
    getRaces(),
    getTeams({ activeOnly: false, depth: 1 }),
    getUserBlock(userId),
  ])

  const openRace = races.find((race) => canMakePrediction(race)) || null
  const completedRaces = races.filter((race) => isRaceCompleted(race))
  const previousRace = completedRaces[completedRaces.length - 1] || null

  const [votedCount, topPredictions] = await Promise.all([
    openRace ? countPredictionsForRace(openRace.id) : 0,
    previousRace ? getTopPredictionsForRace(previousRace.id, 3) : [],
  ])

  let previousRaceData: HomePageData['previousRaceData'] = null
  if (previousRace) {
    const topDrivers =
      previousRace.results?.slice(0, 3).map((result, index) => {
        const driver = typeof result.driver === 'object' ? result.driver : null
        return {
          position: index + 1,
          name: driver?.name || 'Unknown',
          team: (driver ? teams.find((t) => t.id === driver.team) : undefined) as Team,
        }
      }) || []

    const topPredictors = topPredictions.map((pred, index) => ({
      position: index + 1,
      user: (typeof pred.user === 'object' ? pred.user : {}) as User,
      points: pred.points || 0,
    }))

    previousRaceData = { topDrivers, topPredictors }
  }

  return {
    openRace,
    previousRace,
    previousRaceData,
    votedCount,
    ...userBlock,
  }
}
