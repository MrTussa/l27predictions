import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getServerSideUser } from '@/utilities/getServerSideUser'
import { importRaceResults } from '@/utilities/importRaceResults'

/**
 * Ручной импорт из админки (кнопка «Импорт из OpenF1»).
 * Та же логика выполняется сама по расписанию — см. `@/jobs/importFinishedRaces`.
 */
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
    const outcome = await importRaceResults(payload, raceId)

    if (outcome.status === 'no-session') {
      return Response.json(
        { error: 'Не удалось найти сессию OpenF1 для этой гонки', warnings: outcome.warnings },
        { status: 404 },
      )
    }

    if (outcome.status === 'no-data') {
      return Response.json(
        {
          error: 'Нет данных для импорта: сессия ещё не дала результатов, решётки или статистики',
          warnings: outcome.warnings,
        },
        { status: 422 },
      )
    }

    return Response.json({
      ok: true,
      raceSessionKey: outcome.raceSessionKey,
      qualifyingSessionKey: outcome.qualifyingSessionKey,
      imported: outcome.imported,
      warnings: outcome.warnings,
    })
  } catch (error: unknown) {
    console.error('Error importing race results:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
