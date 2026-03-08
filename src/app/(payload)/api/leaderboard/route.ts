import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '15', 10)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10)

    const payload = await getPayload({ config: configPromise })

    const { docs, totalDocs, totalPages, hasNextPage, hasPrevPage } = await payload.find({
      collection: 'season-stats',
      where: { season: { equals: year } },
      sort: '-totalPoints',
      limit,
      depth: 1,
      page,
    })

    const leaderboard = docs.map((stat) => {
      const user = typeof stat.user === 'object' ? stat.user : null
      return {
        id: user?.id || '',
        nickname: user?.nickname || user?.email || 'Unknown',
        chartColor: user?.chartColor || '#FFDF2C',
        totalPoints: stat.totalPoints,
        totalPredictions: stat.predictionsCount,
        perfectPredictions: stat.perfectPredictions,
        averagePoints: stat.predictionsCount > 0 ? stat.totalPoints / stat.predictionsCount : 0,
        currentStreak: stat.currentStreak,
        bestStreak: stat.bestStreak,
      }
    })

    return Response.json({ docs: leaderboard, totalDocs, totalPages, hasNextPage, hasPrevPage })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
