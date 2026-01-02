import type { Race } from '@/payload-types'

export type RaceStatus = 'upcoming' | 'open' | 'closed' | 'completed'

export function getRaceStatus(race: Race): RaceStatus {
  const now = new Date()
  const openDate = new Date(race.predictionOpenDate)
  const closeDate = new Date(race.predictionCloseDate)
  const raceDate = new Date(race.raceDate)

  if (race.results && race.results.length > 0) {
    return 'completed'
  }

  if (now >= raceDate) {
    return 'closed'
  }

  if (now >= closeDate) {
    return 'closed'
  }

  if (now >= openDate && now < closeDate) {
    return 'open'
  }

  return 'upcoming'
}

export function canMakePrediction(race: Race): boolean {
  return getRaceStatus(race) === 'open'
}

export function isRaceCompleted(race: Race): boolean {
  return race.results !== null && race.results !== undefined && race.results.length > 0
}
