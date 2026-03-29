import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET() {
  const eventos = await redis.get('eventos') ?? []
  return NextResponse.json(eventos)
}

export async function POST(req: NextRequest) {
  const eventos = await req.json()
  await redis.set('eventos', eventos)
  return NextResponse.json({ ok: true })
}
