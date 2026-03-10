import { normalizeID } from '@/utilities/normalizeID'
import type { CollectionAfterChangeHook } from 'payload'

export const updateRaceRatingCounts: CollectionAfterChangeHook = async ({ doc, req }) => {
  const raceId = normalizeID(doc.race)

  if (!raceId) return doc

  const { docs: ratings } = await req.payload.find({
    collection: 'race-ratings',
    where: {
      race: { equals: raceId },
    },
    limit: 10000,
  })

  await req.payload.update({
    collection: 'races',
    id: raceId,
    data: {
      rating: {
        ratingBad: ratings.filter((r) => r.rating === 'bad').length,
        ratingNormal: ratings.filter((r) => r.rating === 'normal').length,
        ratingGood: ratings.filter((r) => r.rating === 'good').length,
      },
    },
    overrideAccess: true,
  })

  return doc
}
