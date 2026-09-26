import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { recapModel, requestRecapTexts, sanitizeRecapTexts } from './aiTexts'
import type { CommunityRecap } from './buildCommunityRecap'
import {
  buildCommunityFallback,
  requestCommunityTexts,
  sanitizeCommunityTexts,
  type CommunityTexts,
} from './communityTexts'
import { buildFallbackTexts } from './fallbackTexts'
import type { RecapTexts, SeasonRecap } from './types'

// Одна генерация на ключ и состояние статистики; неудачи не повторяем 10 минут
const inflight = new Map<string, Promise<unknown>>()
const failedAt = new Map<string, number>()
const RETRY_AFTER_MS = 10 * 60_000

type Stored = { id: string; fingerprint: string; texts: unknown } | null

/** Сохранённые тексты, если статистика не менялась; иначе — генерация с сохранением */
async function cachedTexts<T>(options: {
  key: string
  fingerprint: string
  stored: Stored
  fallback: T
  read: (texts: unknown) => T
  generate: () => Promise<T>
  save: (texts: T, storedId: string | null) => Promise<unknown>
}): Promise<T> {
  const { stored, fallback } = options
  let saved: T | null = null
  try {
    saved = stored ? options.read(stored.texts) : null
  } catch {
    saved = null
  }

  if (saved && stored?.fingerprint === options.fingerprint) return saved
  if (!process.env.OPENROUTER_API_KEY) return saved ?? fallback

  const key = `${options.key}:${options.fingerprint}`
  if (Date.now() - (failedAt.get(key) ?? 0) < RETRY_AFTER_MS) return saved ?? fallback

  let job = inflight.get(key) as Promise<T> | undefined
  if (!job) {
    job = (async () => {
      const texts = await options.generate()
      try {
        await options.save(texts, stored?.id ?? null)
      } catch (error) {
        // Параллельный запрос мог успеть создать запись — тексты всё равно показываем
        console.error('Season recap: не удалось сохранить тексты', error)
      }
      return texts
    })().finally(() => inflight.delete(key))
    inflight.set(key, job)
  }

  try {
    return await job
  } catch (error) {
    failedAt.set(key, Date.now())
    console.error(`Season recap: нейросеть не ответила для ${key}`, error)
    return saved ?? fallback
  }
}

async function findPersonal(recap: SeasonRecap): Promise<Stored> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'season-recaps',
    where: {
      and: [{ user: { equals: recap.user.id } }, { season: { equals: recap.season } }],
    },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

/** Сохранённые или шаблонные тексты без вызова нейросети — для картинки-превью */
export async function getSavedRecapTexts(recap: SeasonRecap): Promise<RecapTexts> {
  const fallback = buildFallbackTexts(recap)
  const stored = await findPersonal(recap)
  if (!stored) return fallback
  try {
    return sanitizeRecapTexts(stored.texts, recap, fallback)
  } catch {
    return fallback
  }
}

/** Тексты личных итогов: из базы, а если статистика изменилась — генерирует заново */
export async function getRecapTexts(recap: SeasonRecap): Promise<RecapTexts> {
  const fallback = buildFallbackTexts(recap)
  return cachedTexts({
    key: `${recap.user.id}:${recap.season}`,
    fingerprint: recap.fingerprint,
    stored: await findPersonal(recap),
    fallback,
    read: (texts) => sanitizeRecapTexts(texts, recap, fallback),
    generate: () => requestRecapTexts(recap, fallback),
    save: async (texts, storedId) => {
      const payload = await getPayload({ config: configPromise })
      const data = {
        user: recap.user.id,
        season: recap.season,
        fingerprint: recap.fingerprint,
        model: recapModel(),
        texts,
      }
      return storedId
        ? payload.update({ collection: 'season-recaps', id: storedId, data })
        : payload.create({ collection: 'season-recaps', data })
    },
  })
}

/** Тексты итогов сезона для всех игроков */
export async function getCommunityTexts(recap: CommunityRecap): Promise<CommunityTexts> {
  const fallback = buildCommunityFallback(recap)
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'community-recaps',
    where: { season: { equals: recap.season } },
    limit: 1,
    depth: 0,
  })

  return cachedTexts({
    key: `community:${recap.season}`,
    fingerprint: recap.fingerprint,
    stored: docs[0] ?? null,
    fallback,
    read: (texts) => sanitizeCommunityTexts(texts, recap, fallback),
    generate: () => requestCommunityTexts(recap, fallback),
    save: (texts, storedId) => {
      const data = {
        season: recap.season,
        fingerprint: recap.fingerprint,
        model: recapModel(),
        texts,
      }
      return storedId
        ? payload.update({ collection: 'community-recaps', id: storedId, data })
        : payload.create({ collection: 'community-recaps', data })
    },
  })
}
