import type { Prediction, SeasonStat } from '@/payload-types'
import { getUserPredictions, getUserRank, getUserSeasonStats } from '@/utilities/queries'

export type AccountStatsData = {
  userStats: SeasonStat | null
  userRank: number | null
  userPredictions: Prediction[]
}

export async function getAccountData(userId: string): Promise<AccountStatsData> {
  const currentYear = new Date().getFullYear()

  const [userStats, rankData, userPredictions] = await Promise.all([
    getUserSeasonStats(userId, currentYear, 2),
    getUserRank(userId, currentYear),
    getUserPredictions(userId, { depth: 2 }),
  ])

  return {
    userStats,
    userRank: rankData.rank,
    userPredictions,
  }
}