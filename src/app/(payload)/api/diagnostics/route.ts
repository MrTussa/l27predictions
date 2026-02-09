import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET() {
  const results: Record<string, number> = {}

  const payloadStart = Date.now()
  const payload = await getPayload({ config })
  results.payloadInit = Date.now() - payloadStart

  const queryStart = Date.now()
  await payload.find({
    collection: 'users',
    limit: 1,
  })
  results.simpleQuery = Date.now() - queryStart

  const depthStart = Date.now()
  await payload.find({
    collection: 'users',
    limit: 1,
    depth: 2,
  })
  results.queryWithDepth = Date.now() - depthStart

  const multiStart = Date.now()
  await Promise.all([
    payload.find({ collection: 'users', limit: 5 }),
    await payload.find({
      collection: 'races',
      depth: 1,
      limit: 100,
    }),
    await payload.find({
      collection: 'drivers',
      depth: 1,
      limit: 30,
    }),
  ])
  results.multipleQueries = Date.now() - multiStart

  const mongoStart = Date.now()
  if (payload.db.connection.db) {
    await payload.db.connection.db.command({ ping: 1 })
  }
  results.mongoPing = Date.now() - mongoStart

  return NextResponse.json({
    results,
    summary: {
      payloadOverhead: results.simpleQuery - results.mongoPing,
      totalTypicalPage: results.payloadInit + results.multipleQueries,
    },
    timestamp: new Date().toISOString(),
  })
}
