import { normalizeID } from '@/utilities/normalizeID'
import type { CollectionAfterChangeHook } from 'payload'

export const updateRaceRatingCounts: CollectionAfterChangeHook = async ({ doc, req }) => {
  const raceId = normalizeID(doc.race)

  if (!raceId) return doc

  const countRating = async (rating: 'bad' | 'normal' | 'good') =>
    (
      await req.payload.count({
        collection: 'race-ratings',
        where: { and: [{ race: { equals: raceId } }, { rating: { equals: rating } }] },
      })
    ).totalDocs

  const [ratingBad, ratingNormal, ratingGood] = await Promise.all([
    countRating('bad'),
    countRating('normal'),
    countRating('good'),
  ])
  const counts = { ratingBad, ratingNormal, ratingGood }

  await req.payload.update({
    collection: 'races',
    id: raceId,
    data: { rating: counts },
    overrideAccess: true,
  })

  return doc
}
