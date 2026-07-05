import type { Driver, Prediction, Race } from '@/payload-types'
import { getAllSeasonStats, getPredictionsForRace, getRaces } from '@/utilities/queries'
import { isRaceCompleted } from '@/utilities/raceStatus'

export type UserProgress = {
  userId: string
  nickname: string
  chartColor: string
  pointsByRace: number[]
  cumulativePoints: number[]
}

export type PodiumEntry = {
  userId: string
  nickname: string
  chartColor: string
  totalPoints: number
  perfectPredictions: number
}

export type ConsensusSlot = {
  position: number
  driver: Driver | null
  count: number
  pct: number
  hit: boolean
  pickActualPosition: number | null
}

export type RaceConsensus = {
  raceName: string
  round: number
  total: number
  slots: ConsensusSlot[]
}

export type LeaderboardData = {
  usersProgress: UserProgress[]
  completedRaces: Race[]
  ratedRaces: Race[]
  seasonPodium: PodiumEntry[]
  consensus: RaceConsensus | null
}

function buildConsensus(race: Race, predictions: Prediction[]): RaceConsensus | null {
  const total = predictions.length
  if (total === 0) return null

  const actualByDriver = new Map<string, number>()
  race.results?.forEach((r) => {
    const id = typeof r.driver === 'object' ? r.driver.id : r.driver
    if (id) actualByDriver.set(id, r.position)
  })

  const slots: ConsensusSlot[] = [1, 2, 3].map((position) => {
    const tally = new Map<string, { count: number; driver: Driver }>()
    predictions.forEach((p) => {
      const row = p.predictions?.find((x) => x.position === position)
      const driver = row && typeof row.driver === 'object' ? row.driver : null
      if (!driver) return
      const entry = tally.get(driver.id) ?? { count: 0, driver }
      entry.count++
      tally.set(driver.id, entry)
    })

    const top = [...tally.values()].sort((a, b) => b.count - a.count)[0]
    const pickActualPosition = top ? (actualByDriver.get(top.driver.id) ?? null) : null
    return {
      position,
      driver: top?.driver ?? null,
      count: top?.count ?? 0,
      pct: top ? Math.round((top.count / total) * 100) : 0,
      hit: pickActualPosition === position,
      pickActualPosition,
    }
  })

  return { raceName: race.name, round: race.round, total, slots }
}

export async function getLeaderboardData(year?: number): Promise<LeaderboardData> {
  const currentYear = year ?? new Date().getFullYear()

  const [seasonStats, allRaces] = await Promise.all([
    getAllSeasonStats({ year: currentYear, sort: '-totalPoints', depth: 1, limit: 15 }),
    getRaces({ year: currentYear }),
  ])

  const completedRaces = allRaces.filter((race) => isRaceCompleted(race))

  const ratedRaces = allRaces.filter((race) => {
    const total =
      (race.rating?.ratingBad ?? 0) +
      (race.rating?.ratingNormal ?? 0) +
      (race.rating?.ratingGood ?? 0)
    return total > 0
  })

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

  const seasonPodium: PodiumEntry[] = seasonStats.slice(0, 3).map((stat) => {
    const user = typeof stat.user === 'object' ? stat.user : null
    return {
      userId: user?.id || '',
      nickname: user?.nickname || user?.email || 'Unknown',
      chartColor: user?.chartColor || '#FFDF2C',
      totalPoints: stat.totalPoints ?? 0,
      perfectPredictions: stat.perfectPredictions ?? 0,
    }
  })

  const lastRace = completedRaces.at(-1)
  const consensus = lastRace
    ? buildConsensus(lastRace, await getPredictionsForRace(lastRace.id, { limit: 1000, depth: 2 }))
    : null

  return {
    usersProgress,
    completedRaces,
    ratedRaces,
    seasonPodium,
    consensus,
  }
}
