import type { Payload } from 'payload'
import { calculatePoints } from './calculatePoints'

/**
 * Пересчитывает статистику пользователя за сезон
 * Обновляет только нужных пользователей, использует bulk операции
 *
 * @param payload - Payload instanc
 * @param userIds - ID пользователей для пересчета (если не указаны - пересчитываются все)
 * @param season - Год сезона (по умолчанию - текущий год)
 */
export async function recalculateSeasonStats(
  payload: Payload,
  userIds?: string[],
  season?: number,
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
  })

  if (seasonRaces.length === 0) {
    console.log(`No races found for season ${targetSeason}`)
    return
  }

  const raceIds = seasonRaces.map((race) => race.id)

  const whereCondition: any = {
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

  // Группируем прогнозы по пользователям
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

  const updates: Array<{
    userId: string
    data: any
  }> = []

  for (const [userId, userPredictions] of Object.entries(predictionsByUser)) {
    const sortedRaces = [...seasonRaces].sort((a, b) => a.round - b.round)

    let totalPoints = 0
    let perfectPredictions = 0
    const raceHistory: Array<{
      race: string
      points: number
      cumulativePoints: number
    }> = []

    // Проходим по каждой гонке и считаем очки
    for (const race of sortedRaces) {
      const prediction = userPredictions.find((p) => {
        const predRaceId = typeof p.race === 'object' ? p.race.id : p.race
        return predRaceId === race.id
      })

      // Если у гонки есть результаты
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

    // Гонки с конца (самые свежие)
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
    })
  }

  for (const update of updates) {
    const { docs: existing } = await payload.find({
      collection: 'season-stats',
      where: {
        and: [
          {
            user: {
              equals: update.userId,
            },
          },
          {
            season: {
              equals: targetSeason,
            },
          },
        ],
      },
      limit: 1,
    })

    // Обновляем существующую
    if (existing.length > 0) {
      await payload.update({
        collection: 'season-stats',
        id: existing[0].id,
        data: update.data,
      })
    } else {
      // Создаем новую
      await payload.create({
        collection: 'season-stats',
        data: update.data,
      })
    }
  }

  console.log(`Recalculated season stats for ${updates.length} users in season ${targetSeason}`)
}
