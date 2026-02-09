import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET() {
  const payload = await getPayload({ config })

  let queryCount = 0
  const queries: string[] = []

  const mongoose = payload.db.connection

  const logQuery = function (this: any) {
    queryCount++
    queries.push(`${this.op} ${this.model?.modelName || 'unknown'}`)
  }

  mongoose.set('debug', logQuery)

  queryCount = 0
  queries.length = 0
  const start1 = Date.now()
  await payload.find({ collection: 'users', limit: 1 })
  const normalQueries = {
    count: queryCount,
    list: [...queries],
    time: Date.now() - start1,
  }

  queryCount = 0
  queries.length = 0
  const start2 = Date.now()
  await payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const optimizedQueries = {
    count: queryCount,
    list: [...queries],
    time: Date.now() - start2,
  }

  mongoose.set('debug', false)

  return NextResponse.json({
    normal: normalQueries,
    optimized: optimizedQueries,
    overhead: {
      extraQueries: normalQueries.count - optimizedQueries.count,
      extraTime: normalQueries.time - optimizedQueries.time,
      avgPerQuery:
        Math.round(
          (normalQueries.time - optimizedQueries.time) /
            (normalQueries.count - optimizedQueries.count),
        ) || 0,
    },
  })
}
