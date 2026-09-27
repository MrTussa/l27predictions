import type { Driver, SeasonStat } from '@/payload-types'
import { normalizeID } from '@/utilities/normalizeID'
import {
  getAllSeasonStats,
  getDriversByIds,
  getRaceList,
  getRaces,
  getSeasonPicks,
  getUserPublicProfile,
  getUserRacesRating,
  getUserSeasonStats,
} from '@/utilities/queries'
import { isRaceCompleted } from '@/utilities/raceStatus'
import { buildCommunityRecap, type CommunityRecap } from './buildCommunityRecap'
import { buildSeasonRecap } from './buildSeasonRecap'
import type { RecapDriver, RecapRaceInput, RecapUser, SeasonRecap } from './types'

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

type Pickable = { position: number; driver: string | Driver }
const toPicks = (rows: Pickable[] | null | undefined) =>
  (rows ?? []).map((row) => ({ position: row.position, driver: normalizeID(row.driver) }))

/** Гонки, прогнозы всех игроков и пилоты сезона — общая база для личных и общих итогов */
export async function loadSeasonData(season: number) {
  const races = await getRaces({ year: season, depth: 0 })
  const raceInputs: RecapRaceInput[] = races.map((race) => ({
    id: race.id,
    name: race.name,
    round: race.round,
    trackSVGPath: race.trackSVGPath ?? null,
    results: toPicks(race.results),
    grid: toPicks(race.startingGrid),
    rainfall: race.recap?.weather?.rainfall ?? null,
    votes: {
      good: race.rating?.ratingGood ?? 0,
      normal: race.rating?.ratingNormal ?? 0,
      bad: race.rating?.ratingBad ?? 0,
    },
  }))

  const predictions = await getSeasonPicks(raceInputs.map((race) => race.id))
  const driverIds = new Set([
    ...predictions.flatMap((prediction) => prediction.picks.map((pick) => pick.driver)),
    ...raceInputs.flatMap((race) => race.results.map((result) => result.driver)),
  ])
  const drivers = await getDriversByIds([...driverIds].sort())

  return {
    races: raceInputs,
    predictions,
    drivers: Object.fromEntries(drivers.map((driver) => [driver.id, toRecapDriver(driver)])),
  }
}

const bonusPoints = (stats: SeasonStat[]) =>
  Object.fromEntries(
    stats.map((stat) => [normalizeID(stat.user), stat.seasonPredictionPoints ?? 0]),
  )

export type SeasonData = Awaited<ReturnType<typeof loadSeasonData>>

/**
 * Личные итоги игрока. Скрипт генерации передаёт данные сезона и таблицу сам,
 * чтобы не загружать их заново для каждого игрока.
 */
export async function getSeasonRecap(
  userId: string,
  season: number,
  preloaded?: { data: SeasonData; allStats: SeasonStat[] },
): Promise<SeasonRecap | null> {
  const user = await getUserPublicProfile(userId)
  if (!user) return null

  const [data, stats, allStats, ratingDocs] = await Promise.all([
    preloaded?.data ?? loadSeasonData(season),
    getUserSeasonStats(userId, season, 0),
    preloaded?.allStats ?? getAllSeasonStats({ year: season, depth: 0 }),
    getUserRacesRating(userId),
  ])

  const seasonRaceIds = new Set(data.races.map((race) => race.id))
  const ratings = Object.fromEntries(
    ratingDocs
      .map((doc) => [normalizeID(doc.race), doc.rating] as const)
      .filter(([raceId]) => seasonRaceIds.has(raceId)),
  )

  return buildSeasonRecap({
    season,
    user: {
      id: user.id,
      nickname: user.nickname,
      chartColor: user.chartColor || '#FFDF2C',
      equippedNicknameEffect: user.equippedNicknameEffect ?? null,
    },
    seasonPredictionPoints: stats?.seasonPredictionPoints ?? 0,
    bonusPoints: bonusPoints(allStats),
    ratings,
    ...data,
  })
}

export async function getCommunityRecap(season: number): Promise<CommunityRecap> {
  const [data, stats] = await Promise.all([
    loadSeasonData(season),
    getAllSeasonStats({ year: season, depth: 1 }),
  ])

  const players: Record<string, RecapUser> = {}
  for (const stat of stats) {
    if (typeof stat.user !== 'object') continue
    players[stat.user.id] = {
      id: stat.user.id,
      nickname: stat.user.nickname,
      chartColor: stat.user.chartColor || '#FFDF2C',
      equippedNicknameEffect: stat.user.equippedNicknameEffect ?? null,
    }
  }

  return buildCommunityRecap({ season, players, bonusPoints: bonusPoints(stats), ...data })
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
