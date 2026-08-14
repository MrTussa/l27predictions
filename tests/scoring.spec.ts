import { describe, expect, it } from 'vitest'

import { calculatePoints } from '@/utilities/calculatePoints'
import { canMakePrediction, getRaceStatus } from '@/utilities/raceStatus'
import type { Race } from '@/payload-types'

const podium = (...drivers: string[]) =>
  drivers.map((driver, i) => ({ position: i + 1, driver }))

describe('calculatePoints', () => {
  it('3 очка за точное попадание в позицию', () => {
    expect(calculatePoints(podium('a', 'x', 'y'), podium('a', 'b', 'c'))).toBe(3)
  })

  it('1 очко за пилота в топ-3 не на своей позиции', () => {
    expect(calculatePoints(podium('b', 'x', 'y'), podium('a', 'b', 'c'))).toBe(1)
  })

  it('15 очков за идеальный подиум (перекрывает 3+3+3)', () => {
    expect(calculatePoints(podium('a', 'b', 'c'), podium('a', 'b', 'c'))).toBe(15)
  })

  it('0 очков без совпадений и без результатов', () => {
    expect(calculatePoints(podium('x', 'y', 'z'), podium('a', 'b', 'c'))).toBe(0)
    expect(calculatePoints(podium('a', 'b', 'c'), [])).toBe(0)
  })
})

describe('getRaceStatus', () => {
  const hours = (n: number) => new Date(Date.now() + n * 3600_000).toISOString()

  const race = (open: string, close: string, results: Race['results'] = []) =>
    ({
      predictionOpenDate: open,
      predictionCloseDate: close,
      raceDate: hours(72),
      results,
    }) as Race

  it('окно прогнозов открыто только между открытием и закрытием', () => {
    expect(getRaceStatus(race(hours(-1), hours(1)))).toBe('open')
    expect(canMakePrediction(race(hours(-1), hours(1)))).toBe(true)

    expect(getRaceStatus(race(hours(1), hours(2)))).toBe('upcoming')
    expect(getRaceStatus(race(hours(-2), hours(-1)))).toBe('closed')
    expect(canMakePrediction(race(hours(-2), hours(-1)))).toBe(false)
  })

  it('результаты переводят гонку в completed, даже если окно ещё открыто', () => {
    expect(getRaceStatus(race(hours(-1), hours(1), podium('a', 'b', 'c')))).toBe('completed')
  })
})
