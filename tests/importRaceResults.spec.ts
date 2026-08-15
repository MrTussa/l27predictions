import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'

import type { Race } from '@/payload-types'
import { IMPORT_DELAY_MS, IMPORT_WINDOW_MS, needsImport } from '@/jobs/importFinishedRaces'
import { importRaceResults } from '@/utilities/importRaceResults'
import { getSessionResult, resolveSessions } from '@/utilities/openf1'

const NOW = Date.parse('2026-08-15T12:00:00.000Z')

const podium = (...drivers: string[]) => drivers.map((driver, i) => ({ position: i + 1, driver }))

const race = (agoMs: number, results: Race['results'] = []) =>
  ({
    raceDate: new Date(NOW - agoMs).toISOString(),
    results,
  }) as Race

describe('needsImport', () => {
  it('не берёт гонку, пока не прошёл запас после старта', () => {
    expect(needsImport(race(IMPORT_DELAY_MS - 60_000), NOW)).toBe(false)
    expect(needsImport(race(IMPORT_DELAY_MS + 60_000), NOW)).toBe(true)
  })

  it('не берёт гонку, которая уже вышла из окна опроса', () => {
    expect(needsImport(race(IMPORT_WINDOW_MS - 60_000), NOW)).toBe(true)
    expect(needsImport(race(IMPORT_WINDOW_MS + 60_000), NOW)).toBe(false)
  })

  it('берёт гонку с пустым или неполным подиумом', () => {
    expect(needsImport(race(IMPORT_DELAY_MS + 1, []), NOW)).toBe(true)
    expect(needsImport(race(IMPORT_DELAY_MS + 1, podium('a')), NOW)).toBe(true)
    expect(needsImport(race(IMPORT_DELAY_MS + 1, podium('a', 'b')), NOW)).toBe(true)
  })

  it('не берёт гонку с полным подиумом', () => {
    expect(needsImport(race(IMPORT_DELAY_MS + 1, podium('a', 'b', 'c')), NOW)).toBe(false)
  })

  it('не падает на некорректной дате', () => {
    expect(needsImport({ raceDate: 'не дата', results: [] } as unknown as Race, NOW)).toBe(false)
  })
})

/** Мок fetch: отдаёт тело по первому совпадению пути OpenF1. */
const stubOpenF1 = (routes: Record<string, unknown>) => {
  const fetchMock = vi.fn(async (url: string | URL | Request, _init?: RequestInit) => {
    const href = String(url)
    const match = Object.keys(routes).find((key) => href.includes(key))
    return new Response(JSON.stringify(match ? routes[match] : []), { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('openf1 client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('не кеширует результаты сессии: иначе пустой ответ залипнет на сутки', async () => {
    const fetchMock = stubOpenF1({})
    await getSessionResult(1234)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ cache: 'no-store' })
  })

  it('кеширует календарь на сутки', async () => {
    const fetchMock = stubOpenF1({
      '/meetings': [{ meeting_key: 1, date_start: '2026-08-14T10:00:00.000Z' }],
    })
    await resolveSessions(2026, '2026-08-16T13:00:00.000Z')

    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ next: { revalidate: 86400 } })
  })

  it('не берёт митинг, который стоит слишком далеко от даты гонки', async () => {
    stubOpenF1({
      '/meetings': [{ meeting_key: 1, date_start: '2026-03-06T10:00:00.000Z' }],
      '/sessions': [{ session_key: 1, session_name: 'Race' }],
    })

    expect(await resolveSessions(2026, '2026-08-16T13:00:00.000Z')).toBeNull()
  })

  it('отбрасывает сходы и дисквалификации, сохраняя порядок позиций', async () => {
    stubOpenF1({
      '/session_result': [
        { position: 3, driver_number: 3 },
        { position: 1, driver_number: 1 },
        { position: 2, driver_number: 2, dnf: true },
        { position: 4, driver_number: 4, dsq: true },
        { position: null, driver_number: 5 },
      ],
    })

    const rows = await getSessionResult(1234)
    expect(rows.map((r) => r.driver_number)).toEqual([1, 3])
  })
})

type FakePayload = Payload & { update: ReturnType<typeof vi.fn> }

const fakePayload = (drivers: { id: string; number: number }[]): FakePayload =>
  ({
    findByID: vi.fn(async () => ({
      id: 'race-1',
      season: 2026,
      raceDate: '2026-08-15T13:00:00.000Z',
      openf1SessionKey: 9999,
    })),
    find: vi.fn(async () => ({ docs: drivers })),
    update: vi.fn(async () => ({})),
  }) as unknown as FakePayload

describe('importRaceResults', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const allDrivers = [
    { id: 'd1', number: 1 },
    { id: 'd3', number: 3 },
    { id: 'd4', number: 4 },
    { id: 'd5', number: 5 },
  ]

  it('нумерует подиум 1-2-3, даже если сырые позиции OpenF1 непоследовательны', async () => {
    // P2 сошёл и отфильтрован — сырые позиции остальных: 1, 3, 4.
    stubOpenF1({
      '/session_result': [
        { position: 1, driver_number: 1 },
        { position: 2, driver_number: 2, dnf: true },
        { position: 3, driver_number: 3 },
        { position: 4, driver_number: 4 },
      ],
    })

    const payload = fakePayload(allDrivers)
    const outcome = await importRaceResults(payload, 'race-1', { requireResults: true })

    expect(outcome.status).toBe('imported')
    expect(payload.update.mock.calls[0]![0].data.results).toEqual([
      { position: 1, driver: 'd1' },
      { position: 2, driver: 'd3' },
      { position: 3, driver: 'd4' },
    ])
  })

  it('не пишет подиум, если пилота нет в базе, но импортирует решётку', async () => {
    stubOpenF1({
      '/session_result': [
        { position: 1, driver_number: 1 },
        { position: 2, driver_number: 77 }, // нет в базе
        { position: 3, driver_number: 3 },
      ],
      '/sessions': [
        { session_key: 9999, session_name: 'Race' },
        { session_key: 8888, session_name: 'Qualifying' },
      ],
      '/meetings': [{ meeting_key: 1, date_start: '2026-08-15T13:00:00.000Z' }],
      '/starting_grid': [
        { position: 1, driver_number: 3, lap_duration: 80.1 },
        { position: 2, driver_number: 1, lap_duration: 80.3 },
      ],
    })

    const payload = fakePayload(allDrivers)
    const outcome = await importRaceResults(payload, 'race-1', { requireResults: true })

    const data = payload.update.mock.calls[0]![0].data
    expect(data.results).toBeUndefined()
    expect(data.startingGrid).toEqual([
      { position: 1, driver: 'd3' },
      { position: 2, driver: 'd1' },
    ])
    expect(outcome.imported.results).toBe(false)
    expect(outcome.warnings.join()).toContain('#77')
  })

  it('на опросе выходит до тяжёлых эндпоинтов, пока классификации нет', async () => {
    const fetchMock = stubOpenF1({})

    const payload = fakePayload(allDrivers)
    const outcome = await importRaceResults(payload, 'race-1', { requireResults: true })

    expect(outcome.status).toBe('no-data')
    expect(payload.update).not.toHaveBeenCalled()

    // Один запрос за классификацией — и всё: /laps отдаёт мегабайты, а опрос идёт неделю.
    const requested = fetchMock.mock.calls.map((call) => String(call[0]))
    expect(requested).toHaveLength(1)
    expect(requested[0]).toContain('/session_result')
  })

  it('на ручном импорте тянет решётку и статистику даже без результатов', async () => {
    const fetchMock = stubOpenF1({
      '/meetings': [{ meeting_key: 1, date_start: '2026-08-14T10:00:00.000Z' }],
      '/sessions': [
        { session_key: 9999, session_name: 'Race' },
        { session_key: 8888, session_name: 'Qualifying' },
      ],
      '/starting_grid': [{ position: 1, driver_number: 1, lap_duration: 80.1 }],
    })

    const payload = fakePayload(allDrivers)
    const outcome = await importRaceResults(payload, 'race-1')

    expect(outcome.status).toBe('imported')
    expect(payload.update.mock.calls[0]![0].data.startingGrid).toEqual([
      { position: 1, driver: 'd1' },
    ])
    expect(fetchMock.mock.calls.map((call) => String(call[0])).join()).toContain('/laps')
  })
})
