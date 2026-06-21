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

  const counts = ratings.reduce(
    (acc, r) => {
      if (r.rating === 'bad') acc.ratingBad++
      else if (r.rating === 'normal') acc.ratingNormal++
      else if (r.rating === 'good') acc.ratingGood++
      return acc
    },
    { ratingBad: 0, ratingNormal: 0, ratingGood: 0 },
  )

  await req.payload.update({
    collection: 'races',
    id: raceId,
    data: { rating: counts },
    overrideAccess: true,
  })

  return doc
}
