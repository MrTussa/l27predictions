import { normalizeIDs } from '@/utilities/normalizeID'
import type { CollectionAfterChangeHook } from 'payload'

/**
 * Хук для пересчета статистики сезона при обновлении результатов гонки
 * Триггерится только когда обновляется results (вручную)
 */
export const updateSeasonStatsOnResults: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  const resultsChanged =
    operation === 'update' && JSON.stringify(doc.results) !== JSON.stringify(previousDoc?.results)

  if ((operation === 'create' && doc.results?.length > 0) || resultsChanged) {
    try {
      const { docs: predictions } = await req.payload.find({
        collection: 'predictions',
        where: {
          race: {
            equals: doc.id,
          },
        },
        limit: 1000,
      })

      if (predictions.length === 0) {
        return doc
      }

      const predictionUserIds = [...new Set(normalizeIDs(predictions.map((p) => p.user)))]

      const { docs: statsWithStreak } = await req.payload.find({
        collection: 'season-stats',
        where: {
          and: [{ season: { equals: doc.season } }, { currentStreak: { greater_than: 0 } }],
        },
        limit: 1000,
      })

      const streakUserIds = normalizeIDs(statsWithStreak.map((s) => s.user))
      const userIds = [...new Set([...predictionUserIds, ...streakUserIds])]

      const { calculatePoints } = await import('@/utilities/calculatePoints')

      await Promise.all(
        predictions
          .map((prediction) => ({
            prediction,
            points: calculatePoints(prediction.predictions, doc.results),
          }))
          .filter(({ prediction, points }) => points !== prediction.points)
          .map(({ prediction, points }) =>
            req.payload.update({
              collection: 'predictions',
              id: prediction.id,
              data: { points },
            }),
          ),
      )

      const { recalculateSeasonStats } = await import('@/utilities/recalculateSeasonStats')
      await recalculateSeasonStats(req.payload, userIds, doc.season, doc)

      console.log(
        `Updated season stats for ${userIds.length} users after race ${doc.name} results changed`,
      )
    } catch (error) {
      console.error('Error updating season stats on race results change:', error)
    }
  }

  return doc
}
