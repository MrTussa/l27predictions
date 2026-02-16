import type { Race, SeasonStat } from '@/payload-types'
import type { Payload, Where } from 'payload'
import { calculatePoints } from './calculatePoints'
import { normalizeID } from './normalizeID'

/**
 * Пересчитывает статистику пользователя за сезон
 * Обновляет только нужных пользователей, использует bulk операции
 *
 * @param payload - Payload instance
 * @param userIds - ID пользователей для пересчета (если не указаны - пересчитываются все)
 * @param season - Год сезона (по умолчанию - текущий год)
 * @param updatedRace - Актуальная гонка из хука (избегает кеша payload)
 */
export async function recalculateSeasonStats(
  payload: Payload,
  userIds?: string[],
  season?: number,
  updatedRace?: Race,
): Promise<void> {
  const targetSeason = season || new Date().getFullYear()

  const { docs: seasonRaces } = await payload.find({
    collection: 'races',
    where: {
      season: {
        equals: targetSeason,
      },
    },
    sort: 'round',
    limit: 100,
    depth: 0,
  })

  let racesToUse = seasonRaces
  if (updatedRace) {
    racesToUse = seasonRaces.map((race) => (race.id === updatedRace.id ? updatedRace : race))
  }

  if (racesToUse.length === 0) {
    console.log(`No races found for season ${targetSeason}`)
    return
  }

  const raceIds = racesToUse.map((race) => race.id)

  const whereCondition: Where = {
    race: {
      in: raceIds,
    },
  }

  if (userIds && userIds.length > 0) {
    whereCondition.user = {
      in: userIds,
    }
  }

  const { docs: predictions } = await payload.find({
    collection: 'predictions',
    where: whereCondition,
    limit: 10000,
  })

  const predictionsByUser = predictions.reduce(
    (acc, pred) => {
      const userId = typeof pred.user === 'object' ? pred.user.id : pred.user
      if (!acc[userId]) {
        acc[userId] = []
      }
      acc[userId].push(pred)
      return acc
    },
    {} as Record<string, typeof predictions>,
  )

  const sortedRaces = [...racesToUse].sort((a, b) => a.round - b.round)

  const updates: Array<{
    userId: string
    data: {
      user: string
      season: number
      totalPoints: number
      predictionsCount: number
      perfectPredictions: number
      currentStreak: number
      bestStreak: number
      raceHistory: Array<{ race: string; points: number; cumulativePoints: number }>
      lastCalculated: string
    }
    totalPoints: number
  }> = []

  for (const [userId, userPredictions] of Object.entries(predictionsByUser)) {
    let totalPoints = 0
    let perfectPredictions = 0
    const raceHistory: Array<{
      race: string
      points: number
      cumulativePoints: number
    }> = []

    for (const race of sortedRaces) {
      const prediction = userPredictions.find((p) => {
        const predRaceId = typeof p.race === 'object' ? p.race.id : p.race
        return predRaceId === race.id
      })

      if (prediction) {
        let points = 0
        if (race.results && race.results.length > 0) {
          points = calculatePoints(prediction.predictions, race.results)

          if (points === 15) {
            perfectPredictions++
          }
        }

        totalPoints += points

        raceHistory.push({
          race: race.id,
          points,
          cumulativePoints: totalPoints,
        })
      }
    }

    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0

    for (let i = sortedRaces.length - 1; i >= 0; i--) {
      const race = sortedRaces[i]
      const hasPrediction = userPredictions.some((p) => {
        const predRaceId = typeof p.race === 'object' ? p.race.id : p.race
        return predRaceId === race.id
      })

      if (hasPrediction) {
        tempStreak++
        if (i === sortedRaces.length - 1 - currentStreak) {
          currentStreak = tempStreak
        }
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak
        }
      } else {
        tempStreak = 0
      }
    }

    updates.push({
      userId,
      data: {
        user: userId,
        season: targetSeason,
        totalPoints,
        predictionsCount: userPredictions.length,
        perfectPredictions,
        currentStreak,
        bestStreak,
        raceHistory,
        lastCalculated: new Date().toISOString(),
      },
      totalPoints,
    })
  }

  // batch-запрос
  const userIdsToUpdate = updates.map((u) => u.userId)
  const { docs: existingStats } = await payload.find({
    collection: 'season-stats',
    where: {
      and: [{ user: { in: userIdsToUpdate } }, { season: { equals: targetSeason } }],
    },
    limit: 1000,
  })

  const existingStatsMap = new Map<string, SeasonStat>(
    existingStats.map((stat) => [normalizeID(stat.user), stat]),
  )

  for (const update of updates) {
    const existing = existingStatsMap.get(update.userId)

    const seasonPredictionPoints = existing?.seasonPredictionPoints || 0

    const totalPointsWithSeasonPrediction = update.totalPoints + seasonPredictionPoints

    const dataToSave = {
      ...update.data,
      totalPointsWithSeasonPrediction,
    }

    if (existing) {
      await payload.update({
        collection: 'season-stats',
        id: existing.id,
        data: {
          ...dataToSave,
          seasonPredictionPoints,
        },
      })
    } else {
      await payload.create({
        collection: 'season-stats',
        data: {
          ...dataToSave,
          seasonPredictionPoints: 0,
        },
      })
    }
  }
}
