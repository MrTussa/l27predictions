import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getServerSideUser } from '@/utilities/getServerSideUser'
import {
  getRaceRecap,
  getSessionResult,
  getStartingGrid,
  resolveRaceSession,
} from '@/utilities/openf1'

export async function POST(req: Request) {
  try {
    const { user } = await getServerSideUser()
    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { raceId } = await req.json()
    if (!raceId) {
      return Response.json({ error: 'raceId is required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    const race = await payload.findByID({ collection: 'races', id: raceId, depth: 0 })

    const sessionKey =
      race.openf1SessionKey ?? (await resolveRaceSession(race.season, race.raceDate))
    if (!sessionKey) {
      return Response.json(
        { error: 'Не удалось найти сессию OpenF1 для этой гонки' },
        { status: 404 },
      )
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

    const resultRows = await getSessionResult(sessionKey)
    const results: { position: number; driver: string }[] = []
    for (const row of resultRows.slice(0, 3)) {
      const driver = mapDriver(row.driver_number, `Результат P${row.position}`)
      if (driver) results.push({ position: row.position as number, driver })
    }

    if (results.length !== 3) {
      return Response.json(
        { error: 'Не удалось собрать полный топ-3 (проверьте номера пилотов)', warnings },
        { status: 422 },
      )
    }

    const gridRows = await getStartingGrid(sessionKey)
    const startingGrid = gridRows
      .map((row) => {
        const driver = mapDriver(row.driver_number, `Решётка P${row.position}`)
        return driver ? { position: row.position as number, driver } : null
      })
      .filter((r): r is { position: number; driver: string } => r !== null)

    const r = await getRaceRecap(sessionKey)
    const fastestLapDriver = r.fastestLapDriverNumber
      ? (mapDriver(r.fastestLapDriverNumber, 'Быстрейший круг') ?? undefined)
      : undefined
    const recap = {
      fastestLapDriver,
      fastestLapTime: r.fastestLapTime ?? undefined,
      pitStops: r.pitStops,
      overtakes: r.overtakes,
      weather: {
        airTemp: r.airTemp ?? undefined,
        trackTemp: r.trackTemp ?? undefined,
        rainfall: r.rainfall,
      },
    }

    await payload.update({
      collection: 'races',
      id: raceId,
      data: { results, startingGrid, recap, openf1SessionKey: sessionKey },
    })

    return Response.json({ ok: true, sessionKey, warnings })
  } catch (error: unknown) {
    console.error('Error importing race results:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
