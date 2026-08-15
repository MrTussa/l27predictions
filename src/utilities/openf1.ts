const BASE = 'https://api.openf1.org/v1'
const REVALIDATE = 86400 // сутки
const TIMEOUT_MS = 20_000

/**
 * Кеш выбирается по природе эндпоинта, а не по вызывающему коду:
 *
 * - `static` — календарь и ключи сессий, они не меняются после публикации;
 * - `live` — всё, что появляется по ходу уик-энда. Суточный кеш здесь недопустим: пустой
 *   ответ, полученный сразу после финиша, заблокировал бы импорт на сутки — и для фоновой
 *   задачи, и для кнопки в админке.
 */
type CachePolicy = 'static' | 'live'

async function openf1<T>(path: string, policy: CachePolicy, retries = 3): Promise<T[]> {
  const res = await fetch(`${BASE}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...(policy === 'static'
      ? { next: { revalidate: REVALIDATE } }
      : { cache: 'no-store' as const }),
  })
  if (res.status === 404) return []
  if (res.status === 429 && retries > 0) {
    const retryAfter = Number(res.headers.get('retry-after')) || 4 - retries
    await new Promise((r) => setTimeout(r, Math.max(retryAfter, 1) * 1000))
    return openf1<T>(path, policy, retries - 1)
  } // из-за ограничений по вызовам делаем задержку при 429
  if (!res.ok) {
    throw new Error(`OpenF1 ${path} -> ${res.status}`)
  }
  return (await res.json()) as T[]
}

type Meeting = { meeting_key: number; date_start: string }
type SessionInfo = { session_key: number; session_name: string }
type ResultRow = {
  position: number | null
  driver_number: number
  dnf?: boolean
  dns?: boolean
  dsq?: boolean
}
type GridRow = { position: number | null; driver_number: number; lap_duration: number | null }
type Lap = { driver_number: number; lap_duration: number | null }
type Weather = {
  air_temperature: number | null
  track_temperature: number | null
  rainfall: number | null
}

/**
 * Митинг ищется как ближайший по дате к гонке: `date_start` — это пятница уик-энда,
 * то есть штатное расхождение с воскресной гонкой около двух дней. Допуск отсекает
 * заведомо чужой митинг (например, если в гонке проставлен не тот сезон) — без него
 * `reduce` всегда что-нибудь вернёт и подиум приедет от совершенно другого этапа.
 */
const MEETING_TOLERANCE_MS = 5 * 24 * 60 * 60 * 1000

export async function resolveSessions(
  year: number,
  raceDate: string | Date,
): Promise<{ raceSessionKey: number | null; qualifyingSessionKey: number | null } | null> {
  const meetings = await openf1<Meeting>(`/meetings?year=${year}`, 'static')
  if (meetings.length === 0) return null

  const target = new Date(raceDate).getTime()
  const meeting = meetings.reduce((best, m) =>
    Math.abs(new Date(m.date_start).getTime() - target) <
    Math.abs(new Date(best.date_start).getTime() - target)
      ? m
      : best,
  )

  if (Math.abs(new Date(meeting.date_start).getTime() - target) > MEETING_TOLERANCE_MS) return null

  const sessions = await openf1<SessionInfo>(
    `/sessions?meeting_key=${meeting.meeting_key}`,
    'static',
  )
  return {
    raceSessionKey: sessions.find((s) => s.session_name === 'Race')?.session_key ?? null,
    qualifyingSessionKey:
      sessions.find((s) => s.session_name === 'Qualifying')?.session_key ?? null,
  }
}

export async function getSessionResult(sessionKey: number): Promise<ResultRow[]> {
  const rows = await openf1<ResultRow>(`/session_result?session_key=${sessionKey}`, 'live')
  return rows
    .filter((r) => r.position != null && !r.dnf && !r.dns && !r.dsq)
    .sort((a, b) => (a.position as number) - (b.position as number))
}

export async function getStartingGrid(sessionKey: number): Promise<GridRow[]> {
  const rows = await openf1<GridRow>(`/starting_grid?session_key=${sessionKey}`, 'live')
  return rows
    .filter((r) => r.position != null)
    .sort((a, b) => (a.position as number) - (b.position as number))
}

export type RaceRecap = {
  fastestLapDriverNumber: number | null
  fastestLapTime: number | null
  pitStops: number
  overtakes: number
  airTemp: number | null
  trackTemp: number | null
  rainfall: boolean
}

export async function getRaceRecap(sessionKey: number): Promise<RaceRecap> {
  const [laps, pit, weather, overtakes] = await Promise.all([
    openf1<Lap>(`/laps?session_key=${sessionKey}`, 'live'),
    openf1<unknown>(`/pit?session_key=${sessionKey}`, 'live'),
    openf1<Weather>(`/weather?session_key=${sessionKey}`, 'live'),
    openf1<unknown>(`/overtakes?session_key=${sessionKey}`, 'live').catch(() => []),
  ])

  const fastest = laps
    .filter((l) => l.lap_duration != null)
    .reduce<Lap | null>(
      (best, l) => (!best || (l.lap_duration as number) < (best.lap_duration as number) ? l : best),
      null,
    )

  const avg = (vals: (number | null)[]) => {
    const nums = vals.filter((v): v is number => v != null)
    return nums.length
      ? Math.round((nums.reduce((s, v) => s + v, 0) / nums.length) * 10) / 10
      : null
  }

  return {
    fastestLapDriverNumber: fastest?.driver_number ?? null,
    fastestLapTime: fastest?.lap_duration ?? null,
    pitStops: pit.length,
    overtakes: overtakes.length,
    airTemp: avg(weather.map((w) => w.air_temperature)),
    trackTemp: avg(weather.map((w) => w.track_temperature)),
    rainfall: weather.some((w) => (w.rainfall ?? 0) > 0),
  }
}
