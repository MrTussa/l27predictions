import type { Race } from '@/payload-types'

export type RaceStatus = 'upcoming' | 'open' | 'closed' | 'completed'

type RaceDates = Pick<Race, 'results' | 'predictionOpenDate' | 'predictionCloseDate'>

export function getRaceStatus(race: RaceDates): RaceStatus {
  const now = new Date()

  if (race.results && race.results.length > 0) return 'completed'
  // Races.beforeValidate гарантирует predictionCloseDate < raceDate
  if (now >= new Date(race.predictionCloseDate)) return 'closed'
  if (now >= new Date(race.predictionOpenDate)) return 'open'

  return 'upcoming'
}

export function canMakePrediction(race: RaceDates): boolean {
  return getRaceStatus(race) === 'open'
}

export function isRaceCompleted(race: RaceDates): boolean {
  return getRaceStatus(race) === 'completed'
}
