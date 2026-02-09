import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET() {
  const results: Record<string, any> = {}

  // Замер старта payload
  const initStart = Date.now()
  const payload = await getPayload({ config })
  results.payloadInit = Date.now() - initStart

  // запрос через MongoDB драйвер
  const directStart = Date.now()
  if (payload.db.connection.db) {
    const directResult = await payload.db.connection.db.collection('users').findOne({})
  }
  results.directMongo = Date.now() - directStart

  // запрос через Payload
  const payloadStart = Date.now()
  const payloadResult = await payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  results.payloadOptimized = Date.now() - payloadStart

  const normalStart = Date.now()
  await payload.find({
    collection: 'users',
    limit: 1,
  })
  results.payloadNormal = Date.now() - normalStart

  return NextResponse.json({
    results,
    breakdown: {
      mongoLatency: results.directMongo,
      payloadMinimal: results.payloadOptimized - results.directMongo,
      accessControlCost: results.payloadNormal - results.payloadOptimized,
    },
  })
}
