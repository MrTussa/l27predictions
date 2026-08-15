import type { Payload } from 'payload'

import {
  getRaceRecap,
  getSessionResult,
  getStartingGrid,
  resolveSessions,
  type RaceRecap,
} from '@/utilities/openf1'

export type ImportStatus = 'imported' | 'no-data' | 'no-session'

export type ImportOutcome = {
  status: ImportStatus
  raceSessionKey: number | null
  qualifyingSessionKey: number | null
  imported: { results: boolean; startingGrid: number; recap: boolean }
  warnings: string[]
}

type PodiumRow = { position: number; driver: string }

const EMPTY = { results: false, startingGrid: 0, recap: false }

/**
 * Тянет из OpenF1 результаты гонки, стартовую решётку и статистику и записывает их в гонку.
 *
 * Вызывается из двух мест: кнопки «Импорт из OpenF1» в админке и фоновой задачи
 * `importFinishedRaces`.
 *
 * Запись `results` (топ-3) триггерит хук `updateSeasonStatsOnResults`, который пересчитывает
 * очки прогнозов и статистику сезона. Функция идемпотентна: повторный вызов с теми же данными
 * не меняет очки.
 *
 * `requireResults` — режим опроса: если классификация ещё не опубликована, выходим сразу,
 * не трогая тяжёлые эндпоинты (`/laps` отдаёт мегабайты). Админской кнопке он не нужен —
 * ей полезно подтянуть решётку сразу после квалификации.
 */
export async function importRaceResults(
  payload: Payload,
  raceId: string,
  opts?: { requireResults?: boolean },
): Promise<ImportOutcome> {
  const race = await payload.findByID({ collection: 'races', id: raceId, depth: 0 })

  // Ключ гонки кэшируется в документе: пока результатов нет, опрос стоит один запрос
  // вместо трёх, и он не зависит от того, как в следующий раз выберется «ближайший митинг».
  let raceSessionKey = race.openf1SessionKey ?? null
  let qualifyingSessionKey: number | null = null

  if (!raceSessionKey) {
    const sessions = await resolveSessions(race.season, race.raceDate)
    if (!sessions?.raceSessionKey && !sessions?.qualifyingSessionKey) {
      return {
        status: 'no-session',
        raceSessionKey: null,
        qualifyingSessionKey: null,
        imported: EMPTY,
        warnings: [],
      }
    }
    raceSessionKey = sessions.raceSessionKey
    qualifyingSessionKey = sessions.qualifyingSessionKey
  }

  const resultRows = raceSessionKey ? await getSessionResult(raceSessionKey) : []

  if (opts?.requireResults && resultRows.length < 3) {
    return {
      status: 'no-data',
      raceSessionKey,
      qualifyingSessionKey,
      imported: EMPTY,
      warnings: [],
    }
  }

  // Ключ квалификации известен только после resolveSessions. На пути опроса зовём его
  // здесь — то есть один раз, на том проходе, где результаты действительно появились.
  if (qualifyingSessionKey === null) {
    const sessions = await resolveSessions(race.season, race.raceDate)
    qualifyingSessionKey = sessions?.qualifyingSessionKey ?? null
  }

  const { docs: drivers } = await payload.find({
    collection: 'drivers',
    where: { season: { equals: race.season } },
    limit: 100,
    depth: 0,
  })
  const driverByNumber = new Map<number, string>()
  for (const d of drivers) {
    if (d.number != null) driverByNumber.set(d.number, d.id)
  }

  const warnings: string[] = []
  const mapDriver = (num: number, context: string) => {
    const id = driverByNumber.get(num)
    if (!id) warnings.push(`${context}: пилот #${num} не найден в базе сезона ${race.season}`)
    return id
  }

  // Позиции нумеруем по индексу, а не берём position из OpenF1: getSessionResult отбрасывает
  // сходы и дисквалификации, из-за чего сырые позиции могут оказаться непоследовательными
  // (1, 2, 4), а Races.beforeValidate требует ровно 1, 2, 3.
  const results: PodiumRow[] = []
  resultRows.slice(0, 3).forEach((row, index) => {
    const driver = mapDriver(row.driver_number, `Результат P${index + 1}`)
    if (driver) results.push({ position: index + 1, driver })
  })

  const gridRows = qualifyingSessionKey ? await getStartingGrid(qualifyingSessionKey) : []
  const startingGrid = gridRows
    .map((row) => {
      const driver = mapDriver(row.driver_number, `Решётка P${row.position}`)
      return driver ? { position: row.position as number, driver } : null
    })
    .filter((r): r is PodiumRow => r !== null)

  let r: RaceRecap | null = null
  try {
    r = raceSessionKey ? await getRaceRecap(raceSessionKey) : null
  } catch {
    warnings.push('Статистика OpenF1 недоступна (превышен лимит запросов), импортировано без неё')
  }

  const recap =
    r && r.fastestLapTime != null
      ? {
          fastestLapDriver: r.fastestLapDriverNumber
            ? (mapDriver(r.fastestLapDriverNumber, 'Быстрейший круг') ?? undefined)
            : undefined,
          fastestLapTime: r.fastestLapTime,
          pitStops: r.pitStops,
          overtakes: r.overtakes,
          weather: {
            airTemp: r.airTemp ?? undefined,
            trackTemp: r.trackTemp ?? undefined,
            rainfall: r.rainfall,
          },
        }
      : null

  // Подиум пишем только целиком. Если пилота нет в базе, гонка останется «незакрытой»
  // и следующий проход задачи подхватит её снова — уже после того, как админ добавит пилота.
  const hasResults = results.length === 3
  const hasGrid = startingGrid.length > 0
  const hasRecap = recap != null

  if (!hasResults && !hasGrid && !hasRecap) {
    return {
      status: 'no-data',
      raceSessionKey,
      qualifyingSessionKey,
      imported: EMPTY,
      warnings,
    }
  }

  await payload.update({
    collection: 'races',
    id: raceId,
    data: {
      ...(raceSessionKey ? { openf1SessionKey: raceSessionKey } : {}),
      ...(hasResults ? { results } : {}),
      ...(hasGrid ? { startingGrid } : {}),
      ...(hasRecap ? { recap } : {}),
    },
  })

  return {
    status: 'imported',
    raceSessionKey,
    qualifyingSessionKey,
    imported: { results: hasResults, startingGrid: startingGrid.length, recap: hasRecap },
    warnings,
  }
}
