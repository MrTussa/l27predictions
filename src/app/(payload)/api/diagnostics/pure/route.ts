import { NextResponse } from 'next/server'

export async function GET() {
  const start = Date.now()

  // ответ без Payload
  return NextResponse.json({
    time: Date.now() - start,
    message: 'pure next.js response',
  })
}
