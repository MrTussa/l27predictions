import type { Prediction, SeasonStat, User } from '@/payload-types'
import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'
import { getServerSideUser } from './getServerSideUser'
import { normalizeID } from './normalizeID'

const payload = await getPayload({ config: configPromise })

const currentYear = new Date().getFullYear()

const publicUserPopulate = {
  nickname: true,
  chartColor: true,
  equippedNicknameEffect: true,
} as const

// RACES

export async function getRaces(options?: { year?: number | null; depth?: number }) {
  'use cache'
  cacheTag('races')
  cacheLife('hours')
  const { year = null, depth = 1 } = options || {}
  const races = await payload.find({
    collection: 'races',
    where: {
      season: {
        equals: year ?? currentYear,
      },
    },
    sort: 'round',
    depth,
    pagination: false,
  })

  return races.docs || []
}

// Лёгкий список для карусели и выбора гонки по умолчанию
export async function getRaceList(year?: number) {
  'use cache'
  cacheTag('races')
  cacheLife('hours')
  const { docs } = await payload.find({
    collection: 'races',
    where: { season: { equals: year ?? currentYear } },
    sort: 'round',
    depth: 0,
    pagination: false,
    select: {
      name: true,
      round: true,
      season: true,
      trackSVGPath: true,
      raceDate: true,
      predictionOpenDate: true,
      predictionCloseDate: true,
      results: true,
      rating: true,
    },
  })
  return docs
}

export async function getRaceById(raceId: string) {
  'use cache'
  cacheTag('races')
  cacheLife('hours')
  return payload.findByID({
    collection: 'races',
    id: raceId,
    depth: 2,
  })
}

export async function getUserRacesRating(userId: string) {
  const result = await payload.find({
    collection: 'race-ratings',
    where: {
      user: { equals: userId },
    },
    pagination: false,
  })
  return result.docs || []
}

// PREDICTIONS

export async function getUserPredictions(
  userId: string,
  options?: { depth?: number; limit?: number },
) {
  const { depth = 2, limit = 100 } = options || {}

  const { docs } = await payload.find({
    collection: 'predictions',
    where: {
      user: { equals: userId },
    },
    depth,
    select: { user: false },
    limit,
  })

  return docs
}

export async function getPredictionsForRace(
  raceId: string,
  options?: { limit?: number; sort?: string; depth?: number },
) {
  'use cache'
  cacheTag('predictions')
  cacheLife('hours')
  const { limit = 100, sort = '-createdAt', depth = 1 } = options || {}

  const { docs } = await payload.find({
    collection: 'predictions',
    where: {
      race: { equals: raceId },
    },
    sort,
    limit,
    depth,
    select: { user: true },
    populate: { users: publicUserPopulate },
  })

  return docs
}

export async function countPredictionsForRace(raceId: string) {
  'use cache'
  cacheTag('predictions')
  cacheLife('hours')
  const { totalDocs } = await payload.count({
    collection: 'predictions',
    where: { race: { equals: raceId } },
  })
  return totalDocs
}

export async function getTopPredictionsForRace(raceId: string, limit: number) {
  'use cache'
  cacheTag('predictions')
  cacheLife('hours')
  const { docs } = await payload.find({
    collection: 'predictions',
    where: { race: { equals: raceId } },
    sort: '-points',
    limit,
    depth: 1,
    select: { user: true, points: true },
    populate: { users: publicUserPopulate },
  })
  return docs
}

export async function getUserPredictionForRace(userId: string, raceId: string, depth = 0) {
  const { docs } = await payload.find({
    collection: 'predictions',
    where: {
      and: [{ user: { equals: userId } }, { race: { equals: raceId } }],
    },
    limit: 1,
    depth,
  })

  return docs[0] || null
}

export async function getRacePicks(raceId: string) {
  'use cache'
  cacheTag('predictions')
  cacheLife('hours')
  const { docs } = await payload.find({
    collection: 'predictions',
    where: { race: { equals: raceId } },
    depth: 0,
    pagination: false,
    select: { predictions: true },
  })
  return docs
}

// Все прогнозы на гонки сезона в компактном виде — для итогов сезона
export async function getSeasonPicks(raceIds: string[]) {
  'use cache'
  cacheTag('predictions')
  cacheLife('hours')
  if (raceIds.length === 0) return []
  const { docs } = await payload.find({
    collection: 'predictions',
    where: { race: { in: raceIds } },
    depth: 0,
    pagination: false,
    select: { user: true, race: true, predictions: true },
  })
  return docs.map((doc) => ({
    user: normalizeID(doc.user),
    race: normalizeID(doc.race),
    picks: doc.predictions.map((pick) => ({
      position: pick.position,
      driver: normalizeID(pick.driver),
    })),
  }))
}

// SEASON STATS

const seasonStatsPopulate = {
  races: { name: true, round: true },
  users: publicUserPopulate,
} as const

export async function getUserSeasonStats(userId: string, year?: number, depth?: number) {
  'use cache'
  cacheTag('season-stats')
  cacheLife('hours')
  const { docs } = await payload.find({
    collection: 'season-stats',
    where: {
      and: [{ user: { equals: userId } }, { season: { equals: year ?? currentYear } }],
    },
    limit: 1,
    depth: depth ?? 1,
    populate: seasonStatsPopulate,
  })

  return docs[0] || null
}

export async function getAllSeasonStats(options?: {
  year?: number
  sort?: string
  limit?: number
  depth?: number
}) {
  'use cache'
  cacheTag('season-stats')
  cacheLife('hours')
  const { year, sort = '-totalPoints', limit = 1000, depth = 1 } = options || {}

  const { docs } = await payload.find({
    collection: 'season-stats',
    where: {
      season: { equals: year ?? currentYear },
    },
    sort,
    limit,
    depth,
    populate: seasonStatsPopulate,
  })

  return docs
}

export async function countSeasonStats(year?: number) {
  'use cache'
  cacheTag('season-stats')
  cacheLife('hours')
  const { totalDocs } = await payload.count({
    collection: 'season-stats',
    where: { season: { equals: year ?? currentYear } },
  })
  return totalDocs
}

export async function getUserRank(
  userId: string,
  year?: number,
): Promise<{ rank: number | null; total: number }> {
  const season = year ?? currentYear
  const [stats, total] = await Promise.all([
    getUserSeasonStats(userId, year),
    countSeasonStats(season),
  ])
  if (!stats) return { rank: null, total }

  const { totalDocs: ahead } = await payload.count({
    collection: 'season-stats',
    where: {
      and: [
        { season: { equals: season } },
        { totalPoints: { greater_than: stats.totalPoints ?? 0 } },
      ],
    },
  })

  return { rank: ahead + 1, total }
}

// DRIVERS & TEAMS

export async function getDrivers(options?: {
  season?: number
  activeOnly?: boolean
  depth?: number
  sort?: string
}) {
  'use cache'
  cacheTag('drivers')
  cacheLife('hours')
  const { season, activeOnly = true, depth = 1, sort = 'team' } = options || {}

  type WhereCondition = { season?: { equals: number } } | { isActive?: { equals: boolean } }
  const conditions: WhereCondition[] = []
  if (season) {
    conditions.push({ season: { equals: season } })
  }
  if (activeOnly) {
    conditions.push({ isActive: { equals: true } })
  }

  const { docs } = await payload.find({
    collection: 'drivers',
    where: conditions.length > 0 ? { and: conditions } : undefined,
    sort,
    depth,
    limit: 100,
  })

  return docs
}

export async function getDriversByIds(ids: string[]) {
  'use cache'
  cacheTag('drivers', 'teams')
  cacheLife('hours')
  if (ids.length === 0) return []
  const { docs } = await payload.find({
    collection: 'drivers',
    where: { id: { in: ids } },
    depth: 1,
    pagination: false,
  })
  return docs
}

export async function getTeams(options?: { activeOnly?: boolean; depth?: number }) {
  'use cache'
  cacheTag('teams')
  cacheLife('hours')
  const { activeOnly = true, depth = 0 } = options || {}

  const { docs } = await payload.find({
    collection: 'teams',
    where: activeOnly ? { isActive: { equals: true } } : undefined,
    sort: 'name',
    depth: depth,
    limit: 100,
  })

  return docs
}

// EVENTS

export async function getEvents(status?: string[]) {
  'use cache'
  cacheTag('events')
  cacheLife('hours')
  const { docs } = await payload.find({
    collection: 'events',
    where: status ? { status: { in: status } } : undefined,
    sort: '-openedAt',
    limit: 50,
  })

  return docs
}

export async function getEventById(eventId: string) {
  'use cache'
  cacheTag('events')
  cacheLife('hours')
  return payload.findByID({
    collection: 'events',
    id: eventId,
    overrideAccess: false,
  })
}

export async function getUserEventResponses(userId: string) {
  const { docs } = await payload.find({
    collection: 'event-responses',
    where: {
      user: { equals: userId },
    },
    limit: 100,
    pagination: false,
  })

  return docs
}

export async function getUserEventResponse(userId: string, eventId: string) {
  const { docs } = await payload.find({
    collection: 'event-responses',
    where: {
      and: [{ user: { equals: userId } }, { event: { equals: eventId } }],
    },
    limit: 1,
    pagination: false,
  })

  return docs[0] || null
}

// USERS

export type ProfileData = {
  userStats: SeasonStat | null
  userRank: number | null
  userPredictions: Omit<Prediction, 'user'>[]
}

export async function getProfileData(userId: string): Promise<ProfileData> {
  const currentYear = new Date().getFullYear()

  const [userStats, rankData, userPredictions] = await Promise.all([
    getUserSeasonStats(userId, currentYear, 1),
    getUserRank(userId, currentYear),
    getUserPredictions(userId, { depth: 1 }),
  ])

  return {
    userStats,
    userRank: rankData.rank,
    userPredictions,
  }
}

export type PublicUser = Pick<
  User,
  | 'id'
  | 'nickname'
  | 'chartColor'
  | 'telegramUsername'
  | 'name'
  | 'pitCoins'
  | 'equippedNicknameEffect'
>

export const getUserPublicProfile = cache(async (userId: string): Promise<PublicUser | null> => {
  try {
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
      select: {
        nickname: true,
        chartColor: true,
        telegramUsername: true,
        name: true,
        pitCoins: true,
        equippedNicknameEffect: true,
      },
    })

    if (!user) return null

    return {
      id: user.id,
      nickname: user.nickname,
      chartColor: user.chartColor,
      telegramUsername: user.telegramUsername ?? null,
      name: user.name ?? null,
      pitCoins: user.pitCoins ?? 0,
      equippedNicknameEffect: user.equippedNicknameEffect ?? null,
    }
  } catch {
    return null
  }
})

// HEADER

export async function getBroadcastSettings() {
  'use cache'
  cacheTag('broadcast')
  cacheLife('hours')
  return payload.findGlobal({ slug: 'broadcast-settings' })
}

async function getOpenEventIds() {
  'use cache'
  cacheTag('events')
  cacheLife('hours')
  const { docs } = await payload.find({
    collection: 'events',
    where: { status: { equals: 'open' } },
    select: { status: true },
    limit: 50,
    depth: 0,
  })
  return docs.map((e) => e.id)
}

export const getHeaderData = cache(
  async (): Promise<{
    isLive: boolean
    unvotedEventsCount: number
  }> => {
    const [broadcastSettings, openIds, { user }] = await Promise.all([
      getBroadcastSettings(),
      getOpenEventIds(),
      getServerSideUser(),
    ])
    const isLive = broadcastSettings.isLive ?? false

    if (!user || openIds.length === 0) return { isLive, unvotedEventsCount: 0 }

    const { totalDocs: answered } = await payload.count({
      collection: 'event-responses',
      where: { and: [{ user: { equals: user.id } }, { event: { in: openIds } }] },
    })

    return { isLive, unvotedEventsCount: openIds.length - answered }
  },
)
