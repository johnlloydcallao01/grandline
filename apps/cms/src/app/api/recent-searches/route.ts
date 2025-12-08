import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const authHeader = request.headers.get('authorization') || ''
    const apiKeyHeader = request.headers.get('PAYLOAD_API_KEY') || ''
    const match = authHeader.match(/^users API-Key (.+)$/)
    const apiKey = match ? match[1] : apiKeyHeader
    if (!apiKey) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: corsHeaders })
    const users = await payload.find({ collection: 'users', where: { apiKey: { equals: apiKey }, role: { in: ['service', 'admin'] } }, limit: 1, depth: 0 })
    if (users.docs.length !== 1) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: corsHeaders })

    const body = await request.json()
    const keyword = String(body?.keyword || '').trim()
    const userId = Number(body?.userId || 0)
    const deviceId = body?.deviceId ? String(body.deviceId) : null
    if (!keyword || !userId) return NextResponse.json({ error: 'invalid' }, { status: 400, headers: corsHeaders })

    const traineeCheck = await payload.find({ collection: 'users', where: { id: { equals: userId }, role: { equals: 'trainee' } }, limit: 1, depth: 0 })
    if (traineeCheck.docs.length !== 1) return NextResponse.json({ error: 'forbidden' }, { status: 403, headers: corsHeaders })

    const normalized = keyword.toLowerCase().replace(/\s+/g, ' ')
    const scope = 'courses'
    const composite = `${userId}:${normalized}:${scope}`

    const existing = await payload.find({ collection: 'recent-searches', where: { compositeKey: { equals: composite } }, limit: 1, depth: 0 })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'recent-searches',
        data: {
          user: userId,
          query: keyword,
          normalizedQuery: normalized,
          scope,
          compositeKey: composite,
          frequency: 1,
          source: 'unknown',
          deviceId,
        },
      })
    } else {
      const doc = existing.docs[0] as any
      await payload.update({
        collection: 'recent-searches',
        id: doc.id,
        data: {
          query: keyword,
          frequency: (doc.frequency || 1) + 1,
          deviceId: deviceId ?? doc.deviceId ?? null,
        },
      })
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders })
  } catch (error) {
    return NextResponse.json({ error: 'server_error', details: error instanceof Error ? error.message : String(error) }, { status: 500, headers: corsHeaders })
  }
}
