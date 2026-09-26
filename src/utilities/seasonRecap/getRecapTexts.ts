import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { recapModel, requestRecapTexts, sanitizeRecapTexts } from './aiTexts'
import { buildFallbackTexts } from './fallbackTexts'
import type { RecapTexts, SeasonRecap } from './types'

// Одна генерация на игрока, сезон и состояние статистики; неудачи не повторяем 10 минут
const inflight = new Map<string, Promise<RecapTexts>>()
const failedAt = new Map<string, number>()
const RETRY_AFTER_MS = 10 * 60_000

async function findStored(recap: SeasonRecap) {
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

function readStored(texts: unknown, recap: SeasonRecap, fallback: RecapTexts) {
  try {
    return sanitizeRecapTexts(texts, recap, fallback)
  } catch {
    return null
  }
}

async function generateAndStore(
  recap: SeasonRecap,
  fallback: RecapTexts,
  storedId: string | null,
): Promise<RecapTexts> {
  const texts = await requestRecapTexts(recap, fallback)
  const payload = await getPayload({ config: configPromise })
  const data = {
    user: recap.user.id,
    season: recap.season,
    fingerprint: recap.fingerprint,
    model: recapModel(),
    texts,
  }

  try {
    if (storedId) {
      await payload.update({ collection: 'season-recaps', id: storedId, data })
    } else {
      await payload.create({ collection: 'season-recaps', data })
    }
  } catch (error) {
    // Параллельный запрос мог успеть создать запись — тексты всё равно показываем
    console.error('Season recap: не удалось сохранить тексты', error)
  }

  return texts
}

/** Сохранённые или шаблонные тексты без вызова нейросети — для картинки-превью */
export async function getSavedRecapTexts(recap: SeasonRecap): Promise<RecapTexts> {
  const fallback = buildFallbackTexts(recap)
  const stored = await findStored(recap)
  return (stored && readStored(stored.texts, recap, fallback)) || fallback
}

/** Тексты для страницы итогов: из базы, а если статистика изменилась — генерирует заново */
export async function getRecapTexts(recap: SeasonRecap): Promise<RecapTexts> {
  const fallback = buildFallbackTexts(recap)
  const stored = await findStored(recap)
  const saved = stored ? readStored(stored.texts, recap, fallback) : null

  if (saved && stored?.fingerprint === recap.fingerprint) return saved
  if (!process.env.OPENROUTER_API_KEY) return saved ?? fallback

  const key = `${recap.user.id}:${recap.season}:${recap.fingerprint}`
  if (Date.now() - (failedAt.get(key) ?? 0) < RETRY_AFTER_MS) return saved ?? fallback

  let job = inflight.get(key)
  if (!job) {
    job = generateAndStore(recap, fallback, stored?.id ?? null).finally(() => inflight.delete(key))
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
