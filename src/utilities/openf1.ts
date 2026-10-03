const BASE = 'https://api.openf1.org/v1'
const REVALIDATE = 86400
const REVALIDATE_LIVE = 600

async function openf1<T>(path: string, retries = 3, revalidate = REVALIDATE): Promise<T[]> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate } })
  if (res.status === 404) return []
  if (res.status === 429 && retries > 0) {
    const retryAfter = Number(res.headers.get('retry-after')) || 4 - retries
    await new Promise((r) => setTimeout(r, Math.max(retryAfter, 1) * 1000))
    return openf1<T>(path, retries - 1, revalidate)
  }
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
  duration?: number | (number | null)[] | null
}
type GridRow = {
  position: number | null
  driver_number: number
  lap_duration: number | null
  provisional?: boolean
}
type Lap = { driver_number: number; lap_duration: number | null }
type Weather = {
  air_temperature: number | null
  track_temperature: number | null
  rainfall: number | null
}

const byPosition = <R extends { position: number | null }>(rows: R[]) =>
  rows
    .filter((r) => r.position != null)
    .sort((a, b) => (a.position as number) - (b.position as number))

export async function resolveSessions(
  year: number,
  raceDate: string | Date,
): Promise<{ raceSessionKey: number | null; qualifyingSessionKey: number | null } | null> {
  const meetings = await openf1<Meeting>(`/meetings?year=${year}`)
  if (meetings.length === 0) return null

  const target = new Date(raceDate).getTime()
  const meeting = meetings.reduce((best, m) =>
    Math.abs(new Date(m.date_start).getTime() - target) <
    Math.abs(new Date(best.date_start).getTime() - target)
      ? m
      : best,
  )

  const sessions = await openf1<SessionInfo>(`/sessions?meeting_key=${meeting.meeting_key}`)
  return {
    raceSessionKey: sessions.find((s) => s.session_name === 'Race')?.session_key ?? null,
    qualifyingSessionKey:
      sessions.find((s) => s.session_name === 'Qualifying')?.session_key ?? null,
  }
}

async function getRawSessionResult(sessionKey: number): Promise<ResultRow[]> {
  return openf1<ResultRow>(`/session_result?session_key=${sessionKey}`, 3, REVALIDATE_LIVE)
}

export async function getSessionResult(sessionKey: number): Promise<ResultRow[]> {
  const rows = await getRawSessionResult(sessionKey)
  return byPosition(rows.filter((r) => !r.dnf && !r.dns && !r.dsq))
}

function qualifyingTime(duration: ResultRow['duration']): number | null {
  if (duration == null) return null
  if (typeof duration === 'number') return duration
  for (let i = duration.length - 1; i >= 0; i--) {
    if (duration[i] != null) return duration[i]
  }
  return null
}

export async function getStartingGrid(
  raceSessionKey: number | null,
  qualifyingSessionKey?: number | null,
): Promise<GridRow[]> {
  if (raceSessionKey != null) {
    const grid = await openf1<GridRow>(
      `/starting_grid?session_key=${raceSessionKey}`,
      3,
      REVALIDATE_LIVE,
    )
    if (grid.length > 0) return byPosition(grid)
  }

  if (qualifyingSessionKey == null) return []

  // Фолбэк если стартовой решетки нет
  const quali = await getRawSessionResult(qualifyingSessionKey)
  return byPosition(quali.filter((r) => !r.dsq)).map((r) => ({
    position: r.position,
    driver_number: r.driver_number,
    lap_duration: qualifyingTime(r.duration),
    provisional: true,
  }))
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
    openf1<Lap>(`/laps?session_key=${sessionKey}`),
    openf1<unknown>(`/pit?session_key=${sessionKey}`),
    openf1<Weather>(`/weather?session_key=${sessionKey}`),
    openf1<unknown>(`/overtakes?session_key=${sessionKey}`).catch(() => []),
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
