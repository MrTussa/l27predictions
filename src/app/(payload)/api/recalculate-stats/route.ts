import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { recalculateSeasonStats } from '@/utilities/recalculateSeasonStats'
import { getServerSideUser } from '@/utilities/getServerSideUser'

export async function POST(req: Request) {
  try {
    const { user } = await getServerSideUser()

    // Только админы могут пересчитывать статистику
    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await req.json()
    const { season, userId } = body

    const targetSeason = season || new Date().getFullYear()
    const userIds = userId ? [userId] : undefined

    console.log(`\n🔄 Manual recalculation triggered by ${user.email}`)
    console.log(`Season: ${targetSeason}`)
    console.log(`User IDs: ${userIds ? userIds.join(', ') : 'ALL'}`)

    await recalculateSeasonStats(payload, userIds, targetSeason)

    return Response.json({
      success: true,
      message: `Stats recalculated for season ${targetSeason}`,
    })
  } catch (error: unknown) {
    console.error('Error recalculating stats:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
