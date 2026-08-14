import type { Driver, Prediction, Race } from '@/payload-types'
import { isRaceCompleted } from '@/utilities/raceStatus'

export type ConsensusSlot = {
  position: number
  driver: Driver | null
  count: number
  pct: number
  hit: boolean
  pickActualPosition: number | null
}

export type RaceConsensus = {
  raceName: string
  round: number
  total: number
  slots: ConsensusSlot[]
}

function buildConsensus(race: Race, predictions: Prediction[]): RaceConsensus | null {
  const total = predictions.length
  if (total === 0) return null

  const actualByDriver = new Map<string, number>()
  race.results?.forEach((r) => {
    const id = typeof r.driver === 'object' ? r.driver.id : r.driver
    if (id) actualByDriver.set(id, r.position)
  })

  const slots: ConsensusSlot[] = [1, 2, 3].map((position) => {
    const tally = new Map<string, { count: number; driver: Driver }>()
    predictions.forEach((p) => {
      const row = p.predictions?.find((x) => x.position === position)
      const driver = row && typeof row.driver === 'object' ? row.driver : null
      if (!driver) return
      const entry = tally.get(driver.id) ?? { count: 0, driver }
      entry.count++
      tally.set(driver.id, entry)
    })

    const top = [...tally.values()].sort((a, b) => b.count - a.count)[0]
    const pickActualPosition = top ? (actualByDriver.get(top.driver.id) ?? null) : null
    return {
      position,
      driver: top?.driver ?? null,
      count: top?.count ?? 0,
      pct: top ? Math.round((top.count / total) * 100) : 0,
      hit: pickActualPosition === position,
      pickActualPosition,
    }
  })

  return { raceName: race.name, round: race.round, total, slots }
}

/**
 * Консенсус по всем завершённым гонкам сразу — страница прогнозов переключает гонку
 * локальным состоянием, поэтому данные готовим на сервере одним проходом.
 */
export function buildConsensusMap(
  races: Race[],
  predictions: Prediction[],
): Record<string, RaceConsensus> {
  const byRace = new Map<string, Prediction[]>()
  predictions.forEach((p) => {
    const raceId = typeof p.race === 'object' ? p.race.id : p.race
    if (!raceId) return
    const bucket = byRace.get(raceId)
    if (bucket) bucket.push(p)
    else byRace.set(raceId, [p])
  })

  const map: Record<string, RaceConsensus> = {}
  races.forEach((race) => {
    if (!isRaceCompleted(race)) return
    const consensus = buildConsensus(race, byRace.get(race.id) ?? [])
    if (consensus) map[race.id] = consensus
  })

  return map
}
