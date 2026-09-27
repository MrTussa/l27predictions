import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { sanitizeRecapTexts } from './aiTexts'
import type { CommunityRecap } from './buildCommunityRecap'
import {
  buildCommunityFallback,
  sanitizeCommunityTexts,
  type CommunityTexts,
} from './communityTexts'
import { buildFallbackTexts } from './fallbackTexts'
import type { RecapTexts, SeasonRecap } from './types'

// Сайт нейросеть не вызывает: тексты заранее пишет скрипт scripts/generate-recaps.ts.
// Если статистика с тех пор изменилась, показываем сохранённые тексты как есть.

export type StoredTexts = { id: string; fingerprint: string; texts: unknown }

export async function findPersonalTexts(
  userId: string,
  season: number,
): Promise<StoredTexts | null> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'season-recaps',
    where: { and: [{ user: { equals: userId } }, { season: { equals: season } }] },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

export async function findCommunityTexts(season: number): Promise<StoredTexts | null> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'community-recaps',
    where: { season: { equals: season } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

/** Сохранённые тексты личных итогов; null — скрипт их ещё не сгенерировал */
export async function getSavedRecapTexts(recap: SeasonRecap): Promise<RecapTexts | null> {
  const stored = await findPersonalTexts(recap.user.id, recap.season)
  if (!stored) return null
  try {
    return sanitizeRecapTexts(stored.texts, recap, buildFallbackTexts(recap))
  } catch {
    return null
  }
}

/** Сохранённые тексты итогов сезона для всех; null — ещё не сгенерированы */
export async function getSavedCommunityTexts(
  recap: CommunityRecap,
): Promise<CommunityTexts | null> {
  const stored = await findCommunityTexts(recap.season)
  if (!stored) return null
  try {
    return sanitizeCommunityTexts(stored.texts, recap, buildCommunityFallback(recap))
  } catch {
    return null
  }
}

export async function saveRecapTexts(
  recap: SeasonRecap,
  texts: RecapTexts,
  model: string,
  storedId: string | null,
) {
  const payload = await getPayload({ config: configPromise })
  const data = {
    user: recap.user.id,
    season: recap.season,
    fingerprint: recap.fingerprint,
    model,
    texts,
  }
  return storedId
    ? payload.update({ collection: 'season-recaps', id: storedId, data })
    : payload.create({ collection: 'season-recaps', data })
}

export async function saveCommunityTexts(
  recap: CommunityRecap,
  texts: CommunityTexts,
  model: string,
  storedId: string | null,
) {
  const payload = await getPayload({ config: configPromise })
  const data = { season: recap.season, fingerprint: recap.fingerprint, model, texts }
  return storedId
    ? payload.update({ collection: 'community-recaps', id: storedId, data })
    : payload.create({ collection: 'community-recaps', data })
}
