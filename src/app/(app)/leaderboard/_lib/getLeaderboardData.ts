import type { Race } from '@/payload-types'
import { getAllSeasonStats, getRaces } from '@/utilities/queries'
import { isRaceCompleted } from '@/utilities/raceStatus'

export type LeaderboardEntry = {
  id: string
  nickname: string
  chartColor: string
  totalPoints: number
  totalPredictions: number
  perfectPredictions: number
  averagePoints: number
  currentStreak: number
  bestStreak: number
}

export type UserProgress = {
  userId: string
  nickname: string
  chartColor: string
  pointsByRace: number[]
  cumulativePoints: number[]
}

export type LeaderboardData = {
  leaderboardData: LeaderboardEntry[]
  usersProgress: UserProgress[]
  completedRaces: Race[]
}

export async function getLeaderboardData(year?: number): Promise<LeaderboardData> {
  const currentYear = year ?? new Date().getFullYear()

  const [seasonStats, allRaces] = await Promise.all([
    getAllSeasonStats({ year: currentYear, sort: '-totalPoints', depth: 1 }),
    getRaces({ year: currentYear }),
  ])

  const leaderboardData: LeaderboardEntry[] = seasonStats.map((stat) => {
    const user = typeof stat.user === 'object' ? stat.user : null

    return {
      id: user?.id || '',
      nickname: user?.nickname || user?.email || 'Unknown',
      chartColor: user?.chartColor || '#FFDF2C',
      totalPoints: stat.totalPoints,
      totalPredictions: stat.predictionsCount,
      perfectPredictions: stat.perfectPredictions,
      averagePoints: stat.predictionsCount > 0 ? stat.totalPoints / stat.predictionsCount : 0,
      currentStreak: stat.currentStreak,
      bestStreak: stat.bestStreak,
    }
  })

  const completedRaces = allRaces.filter((race) => isRaceCompleted(race))

  const top10Stats = seasonStats.slice(0, 10)

  const usersProgress: UserProgress[] = top10Stats.map((stat) => {
    const user = typeof stat.user === 'object' ? stat.user : null

    const historyMap = new Map(
      stat.raceHistory?.map((history) => {
        const raceId = typeof history.race === 'object' ? history.race.id : history.race
        return [raceId, history]
      }) || [],
    )

    const pointsByRace = completedRaces.map((race) => {
      const history = historyMap.get(race.id)
      return history?.points || 0
    })

    let lastCumulative = 0
    const cumulativePoints = completedRaces.map((race) => {
      const history = historyMap.get(race.id)
      if (history) {
        lastCumulative = history.cumulativePoints
      }
      return lastCumulative
    })

    return {
      userId: user?.id || '',
      nickname: user?.nickname || user?.email || 'Unknown',
      chartColor: user?.chartColor || '#FFDF2C',
      pointsByRace,
      cumulativePoints,
    }
  })

  return {
    leaderboardData,
    usersProgress,
    completedRaces,
  }
}
