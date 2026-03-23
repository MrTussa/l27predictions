'use server'

import type { Prediction, SeasonStat, User } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'
import { getServerSideUser } from './getServerSideUser'

const payload = await getPayload({ config: configPromise })

const currentYear = new Date().getFullYear()

// RACES

export async function getRaces(options?: { year?: number | null; depth?: number }) {
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

export const getRaceById = cache(async (raceId: string) => {
  return payload.findByID({
    collection: 'races',
    id: raceId,
  })
})

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

export async function getAllPredictions(options?: {
  raceId?: string
  limit?: number
  depth?: number
}) {
  const { raceId, limit = 10000, depth = 2 } = options || {}

  const where: { race?: { equals: string } } = {}
  if (raceId) {
    where.race = { equals: raceId }
  }

  const { docs } = await payload.find({
    collection: 'predictions',
    where: Object.keys(where).length > 0 ? where : undefined,
    limit,
    depth,
  })

  return docs
}

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
  const { limit = 100, sort = '-createdAt', depth = 1 } = options || {}

  const { docs } = await payload.find({
    collection: 'predictions',
    where: {
      race: { equals: raceId },
    },
    sort,
    limit,
    depth,
  })

  return docs
}

export async function getUserPredictionForRace(userId: string, raceId: string) {
  const { docs } = await payload.find({
    collection: 'predictions',
    where: {
      and: [{ user: { equals: userId } }, { race: { equals: raceId } }],
    },
    limit: 1,
  })

  return docs[0] || null
}

// SEASON STATS

export async function getUserStats({ user }: { user: User }) {
  const userStats = await payload.find({
    collection: 'season-stats',
    where: {
      and: [{ user: { equals: user.id } }, { season: { equals: currentYear } }],
    },
    limit: 1,
    pagination: false,
  })
  return userStats.docs || []
}

export async function getUserSeasonStats(userId: string, year?: number, depth?: number) {
  const { docs } = await payload.find({
    collection: 'season-stats',
    where: {
      and: [{ user: { equals: userId } }, { season: { equals: year ?? currentYear } }],
    },
    limit: 1,
    depth: depth ?? 1,
  })

  return docs[0] || null
}

export async function getAllSeasonStats(options?: {
  year?: number
  sort?: string
  limit?: number
  depth?: number
}) {
  const { year, sort = '-totalPoints', limit = 1000, depth = 1 } = options || {}

  const { docs } = await payload.find({
    collection: 'season-stats',
    where: {
      season: { equals: year ?? currentYear },
    },
    sort,
    limit,
    depth,
  })

  return docs
}

export async function getUserRank(
  userId: string,
  year?: number,
): Promise<{ rank: number | null; total: number }> {
  const allStats = await getAllSeasonStats({ year, sort: '-totalPoints' })
  const userStatIndex = allStats.findIndex((s) => {
    const statUser = typeof s.user === 'object' ? s.user : null
    return statUser?.id === userId
  })

  return {
    rank: userStatIndex >= 0 ? userStatIndex + 1 : null,
    total: allStats.length,
  }
}

// DRIVERS & TEAMS

export async function getDrivers(options?: {
  season?: number
  activeOnly?: boolean
  depth?: number
  sort?: string
}) {
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

export async function getTeams(options?: { activeOnly?: boolean; depth?: number }) {
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
  const { docs } = await payload.find({
    collection: 'events',
    where: status ? { status: { in: status } } : undefined,
    sort: '-openedAt',
    limit: 50,
  })

  return docs
}

export async function getEventById(eventId: string) {
  return payload.findByID({
    collection: 'events',
    id: eventId,
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

export type PublicUser = Pick<
  User,
  'id' | 'nickname' | 'chartColor' | 'telegramUsername' | 'name' | 'pitCoins'
>

export async function getUserPublicProfile(userId: string): Promise<PublicUser | null> {
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
      },
    })

    if (!user) return null

    return {
      id: user.id,
      nickname: user.nickname,
      chartColor: user.chartColor,
      telegramUsername: user.telegramUsername ?? null,
      name: user.name ?? null,
    }
  } catch {
    return null
  }
}

// HEADER

export async function getHeaderData(): Promise<{ isLive: boolean; unvotedEventsCount: number }> {
  const [broadcastSettings, openEvents, { user }] = await Promise.all([
    payload.findGlobal({ slug: 'broadcast-settings' }),
    getEvents(['open']),
    getServerSideUser(),
  ])

  if (!user) return { isLive: broadcastSettings.isLive ?? false, unvotedEventsCount: 0 }

  const userResponses = await getUserEventResponses(user.id)
  const respondedIds = new Set(
    userResponses.map((r) => (typeof r.event === 'object' ? r.event.id : r.event)),
  )

  return {
    isLive: broadcastSettings.isLive ?? false,
    unvotedEventsCount: openEvents.filter((e) => !respondedIds.has(e.id)).length,
  }
}
