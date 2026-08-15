import type { TaskConfig } from 'payload'

import type { Race } from '@/payload-types'
import { importRaceResults } from '@/utilities/importRaceResults'

/** Сколько ждём после старта гонки, прежде чем идти за результатами: ~2ч гонки + запас. */
export const IMPORT_DELAY_MS = 3 * 60 * 60 * 1000

/** Окно, после которого перестаём опрашивать гонку (отменённый этап и т.п. не долбим вечно). */
export const IMPORT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

/** Сколько гонок обрабатываем за один проход — обычно нужна ровно одна. */
export const MAX_RACES_PER_RUN = 2

/**
 * Гонка ждёт импорта, если она уже прошла (с запасом), ещё в окне опроса
 * и её подиум не заполнен целиком.
 *
 * Длину массива нельзя выразить в `where` Payload/Mongo, поэтому отбор двухступенчатый:
 * узкая выборка по датам в БД + этот фильтр в памяти.
 */
export function needsImport(race: Pick<Race, 'raceDate' | 'results'>, now: number): boolean {
  const raceTime = new Date(race.raceDate).getTime()
  if (Number.isNaN(raceTime)) return false
  if (now - raceTime < IMPORT_DELAY_MS) return false
  if (now - raceTime > IMPORT_WINDOW_MS) return false

  return (race.results?.length ?? 0) < 3
}

/**
 * Фоновая задача: подтягивает результаты завершившихся гонок из OpenF1 без участия админа.
 *
 * Запись `results` триггерит хук `updateSeasonStatsOnResults`, который пересчитывает очки
 * прогнозов и статистику сезона. Задача идемпотентна и самовосстанавливается: как только
 * подиум заполнен, гонка выпадает из выборки; пропущенный тик или перезапуск процесса
 * ничего не теряют — следующий проход возьмёт ту же гонку.
 */
export const importFinishedRaces: TaskConfig<'importFinishedRaces'> = {
  slug: 'importFinishedRaces',
  label: 'Импорт результатов гонок из OpenF1',
  schedule: [
    {
      cron: '*/10 * * * *',
      queue: 'openf1',
    },
  ],
  inputSchema: [],
  handler: async ({ req }) => {
    const { payload } = req
    const now = Date.now()

    const { docs } = await payload.find({
      collection: 'races',
      // Фильтра по сезону намеренно нет: окно дат и так изолирует нужные гонки, а поле
      // season проставляется дефолтом «текущий год» и на стыке сезонов врёт.
      where: {
        and: [
          { raceDate: { less_than: new Date(now - IMPORT_DELAY_MS).toISOString() } },
          { raceDate: { greater_than: new Date(now - IMPORT_WINDOW_MS).toISOString() } },
        ],
      },
      sort: '-raceDate',
      limit: 10,
      depth: 0,
    })

    const pending = docs.filter((race) => needsImport(race, now)).slice(0, MAX_RACES_PER_RUN)

    const processed: {
      race: string
      status: string
      results: boolean
      warnings: string[]
    }[] = []

    // Последовательно, чтобы не упереться в лимит запросов OpenF1.
    for (const race of pending) {
      try {
        const outcome = await importRaceResults(payload, race.id, { requireResults: true })
        processed.push({
          race: race.name,
          status: outcome.status,
          results: outcome.imported.results,
          warnings: outcome.warnings,
        })
        if (outcome.imported.results) {
          payload.logger.info(`OpenF1: импортированы результаты гонки «${race.name}»`)
        }
        if (outcome.warnings.length > 0) {
          payload.logger.warn(`OpenF1 «${race.name}»: ${outcome.warnings.join('; ')}`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        payload.logger.error(`OpenF1: ошибка импорта гонки «${race.name}»: ${message}`)
        processed.push({ race: race.name, status: 'error', results: false, warnings: [message] })
      }
    }

    return {
      output: {
        checked: docs.length,
        processed,
      },
    }
  },
}
