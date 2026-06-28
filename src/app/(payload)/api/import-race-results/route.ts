import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getServerSideUser } from '@/utilities/getServerSideUser'
import {
  getRaceRecap,
  getSessionResult,
  getStartingGrid,
  resolveSessions,
  type RaceRecap,
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

    const sessions = await resolveSessions(race.season, race.raceDate)
    if (!sessions) {
      return Response.json(
        { error: 'Не удалось найти сессию OpenF1 для этой гонки' },
        { status: 404 },
      )
    }
    const { raceSessionKey, qualifyingSessionKey } = sessions

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

    const resultRows = raceSessionKey ? await getSessionResult(raceSessionKey) : []
    const results: { position: number; driver: string }[] = []
    for (const row of resultRows.slice(0, 3)) {
      const driver = mapDriver(row.driver_number, `Результат P${row.position}`)
      if (driver) results.push({ position: row.position as number, driver })
    }

    const gridRows = qualifyingSessionKey ? await getStartingGrid(qualifyingSessionKey) : []
    const startingGrid = gridRows
      .map((row) => {
        const driver = mapDriver(row.driver_number, `Решётка P${row.position}`)
        return driver ? { position: row.position as number, driver } : null
      })
      .filter((r): r is { position: number; driver: string } => r !== null)

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

    const hasResults = results.length === 3
    const hasGrid = startingGrid.length > 0
    const hasRecap = recap != null

    if (!hasResults && !hasGrid && !hasRecap) {
      return Response.json(
        {
          error: 'Нет данных для импорта: сессия ещё не дала результатов, решётки или статистики',
          warnings,
        },
        { status: 422 },
      )
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

    return Response.json({
      ok: true,
      raceSessionKey,
      qualifyingSessionKey,
      imported: { results: hasResults, startingGrid: startingGrid.length, recap: hasRecap },
      warnings,
    })
  } catch (error: unknown) {
    console.error('Error importing race results:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
