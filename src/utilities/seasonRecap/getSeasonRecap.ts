import type { Driver } from '@/payload-types'
import { normalizeID } from '@/utilities/normalizeID'
import {
  getDriversByIds,
  getRaceList,
  getRaces,
  getSeasonPicks,
  getUserPublicProfile,
  getUserSeasonStats,
} from '@/utilities/queries'
import { isRaceCompleted } from '@/utilities/raceStatus'
import { buildSeasonRecap } from './buildSeasonRecap'
import type { RecapDriver, SeasonRecap } from './types'

const toRecapDriver = (driver: Driver): RecapDriver => {
  const team = typeof driver.team === 'object' ? driver.team : null
  const photo = typeof driver.photo === 'object' ? driver.photo : null
  return {
    id: driver.id,
    name: driver.name,
    shortName: driver.shortName,
    teamName: team?.name ?? null,
    teamColor: team?.teamColor || '#FFDF2C',
    photoUrl: photo?.url ?? null,
  }
}

export async function getSeasonRecap(userId: string, season: number): Promise<SeasonRecap | null> {
  const user = await getUserPublicProfile(userId)
  if (!user) return null

  const [races, stats] = await Promise.all([
    getRaces({ year: season, depth: 0 }),
    getUserSeasonStats(userId, season, 0),
  ])

  const raceInputs = races.map((race) => ({
    id: race.id,
    name: race.name,
    round: race.round,
    trackSVGPath: race.trackSVGPath ?? null,
    results: (race.results ?? []).map((result) => ({
      position: result.position,
      driver: normalizeID(result.driver),
    })),
  }))

  const predictions = await getSeasonPicks(raceInputs.map((race) => race.id))
  const driverIds = new Set([
    ...predictions.flatMap((prediction) => prediction.picks.map((pick) => pick.driver)),
    ...raceInputs.flatMap((race) => race.results.map((result) => result.driver)),
  ])
  const drivers = await getDriversByIds([...driverIds].sort())

  return buildSeasonRecap({
    season,
    user: {
      id: user.id,
      nickname: user.nickname,
      chartColor: user.chartColor || '#FFDF2C',
      equippedNicknameEffect: user.equippedNicknameEffect ?? null,
    },
    seasonPredictionPoints: stats?.seasonPredictionPoints ?? 0,
    races: raceInputs,
    predictions,
    drivers: Object.fromEntries(drivers.map((driver) => [driver.id, toRecapDriver(driver)])),
  })
}

export type SeasonProgress = {
  season: number
  total: number
  completed: number
  isComplete: boolean
}

export async function getSeasonProgress(season: number): Promise<SeasonProgress> {
  const races = await getRaceList(season)
  const completed = races.filter((race) => isRaceCompleted(race)).length
  return {
    season,
    total: races.length,
    completed,
    isComplete: races.length > 0 && completed === races.length,
  }
}

/** Сезон для итогов: текущий, а пока в нём нет ни одной завершённой гонки — прошлый */
export async function getRecapSeasonProgress(): Promise<SeasonProgress> {
  const currentYear = new Date().getFullYear()
  const current = await getSeasonProgress(currentYear)
  return current.completed > 0 ? current : getSeasonProgress(currentYear - 1)
}

export function parseSeason(value: string): number | null {
  if (!/^\d{4}$/.test(value)) return null
  const season = Number(value)
  return season >= 2020 && season <= new Date().getFullYear() + 1 ? season : null
}
