const BASE = 'https://api.openf1.org/v1'
const REVALIDATE = 86400 // сутки

async function openf1<T>(path: string): Promise<T[]> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: REVALIDATE } })
  if (res.status === 404) return []
  if (!res.ok) {
    throw new Error(`OpenF1 ${path} -> ${res.status}`)
  }
  return (await res.json()) as T[]
}

type Session = { session_key: number; date_start: string; year: number }
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

export async function resolveRaceSession(
  year: number,
  raceDate: string | Date,
): Promise<number | null> {
  const sessions = await openf1<Session>(`/sessions?year=${year}&session_name=Race`)
  if (sessions.length === 0) return null

  const target = new Date(raceDate).getTime()
  const closest = sessions.reduce(
    (best, s) => {
      const diff = Math.abs(new Date(s.date_start).getTime() - target)
      return diff < best.diff ? { key: s.session_key, diff } : best
    },
    { key: sessions[0].session_key, diff: Infinity },
  )

  return closest.key
}

export async function getSessionResult(sessionKey: number): Promise<ResultRow[]> {
  const rows = await openf1<ResultRow>(`/session_result?session_key=${sessionKey}`)
  return rows
    .filter((r) => r.position != null && !r.dnf && !r.dns && !r.dsq)
    .sort((a, b) => (a.position as number) - (b.position as number))
}

export async function getStartingGrid(sessionKey: number): Promise<GridRow[]> {
  const rows = await openf1<GridRow>(`/starting_grid?session_key=${sessionKey}`)
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
    openf1<Lap>(`/laps?session_key=${sessionKey}`),
    openf1<unknown>(`/pit?session_key=${sessionKey}`),
    openf1<Weather>(`/weather?session_key=${sessionKey}`),
    openf1<unknown>(`/overtakes?session_key=${sessionKey}`).catch(() => []), // beta-эндпоинт
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
