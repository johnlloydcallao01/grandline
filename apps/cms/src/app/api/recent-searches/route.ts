import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

async function getServiceUser(request: NextRequest) {
    const authHeader = request.headers.get('authorization') || ''
    const match = authHeader.match(/^users API-Key (.+)$/)
    if (!match) return null

    const payload = await getPayload({ config: configPromise })
    const users = await payload.find({
        collection: 'users',
        where: {
            apiKey: { equals: match[1] },
            role: { in: ['service', 'admin'] },
            isActive: { equals: true },
        },
        limit: 1,
        depth: 0,
    })

    return users.docs[0] || null
}

export async function GET(request: NextRequest) {
    try {
        const payload = await getPayload({ config: configPromise })
        const { searchParams } = new URL(request.url)

        const where: Where = {}
        const limit = parseInt(searchParams.get('limit') || '10')
        const page = parseInt(searchParams.get('page') || '1')

        const userEq = searchParams.get('where[user][equals]')
        if (userEq) {
            const num = Number(userEq)
            where.user = { equals: Number.isNaN(num) ? userEq : num }
        }

        const compositeEq = searchParams.get('where[compositeKey][equals]')
        if (compositeEq) {
            where.compositeKey = { equals: compositeEq }
        }

        const results = await payload.find({
            collection: 'recent-searches',
            where,
            limit,
            page,
            depth: 2,
            sort: '-updatedAt',
        })

        return NextResponse.json(results)
    } catch (_error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200 })
}

export async function POST(request: NextRequest) {
    try {
        const serviceUser = await getServiceUser(request)
        const serverKey = request.headers.get('PAYLOAD_API_KEY')
        const hasServerAccess = !!serverKey

        const payload = await getPayload({ config: configPromise })
        const body = await request.json()
        const q = String(body.query || '').trim()
        const normalized = q.toLowerCase().replace(/\s+/g, ' ')

        if (!serviceUser && !hasServerAccess) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const created = await payload.create({
            collection: 'recent-searches',
            data: {
                user: body.user,
                query: q,
                normalizedQuery: normalized,
                frequency: body.frequency ?? 1,
                scope: body.scope || 'courses',
                source: body.source || 'unknown',
                deviceId: body.deviceId || null,
            },
            ...(serviceUser ? { user: serviceUser } : { overrideAccess: true }),
        })

        return NextResponse.json(
            { doc: created, message: 'Recent Search successfully created.' },
            { status: 201 },
        )
    } catch (_error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

