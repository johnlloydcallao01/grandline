import { NextRequest, NextResponse } from 'next/server'
import { APIError } from 'payload'
import {
  computeTemplateStats,
  getPayloadClient,
  normalizeTemplate,
  requireServiceAuth,
} from '../_shared'

const CATEGORIES = ['learning', 'account', 'system-update', 'other']
const CHANNELS = ['in-app', 'email', 'push']

function getSearchParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  return {
    id: searchParams.get('id'),
    search: searchParams.get('search') || undefined,
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || 15),
    sort: searchParams.get('sort') || 'name',
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const payload = await getPayloadClient()

    if (request.nextUrl.searchParams.get('templateOptions') === '1') {
      const templates = await payload.find({
        collection: 'notification-templates',
        limit: 200,
        sort: 'name',
        depth: 0,
        overrideAccess: true,
      })
      const options = (templates.docs || []).map((t: any) => ({
        id: Number(t.id),
        name: t.name || `Template #${t.id}`,
        code: t.code || '',
      }))
      return NextResponse.json({ templates: options })
    }

    if (params.id) {
      const doc = await payload.findByID({
        collection: 'notification-templates',
        id: params.id,
        depth: 0,
        overrideAccess: true,
      })
      return NextResponse.json(normalizeTemplate(doc))
    }

    const search = params.search?.trim()
    const where: any = search
      ? {
          or: [
            { name: { like: search } },
            { code: { like: search } },
          ],
        }
      : {}

    const statsResult = await payload.find({
      collection: 'notification-templates',
      where,
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })

    const list = await payload.find({
      collection: 'notification-templates',
      where,
      page: params.page,
      limit: params.limit,
      sort: params.sort,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (list.docs || []).map(normalizeTemplate),
      totalDocs: list.totalDocs,
      totalPages: list.totalPages,
      page: list.page,
      limit: list.limit,
      stats: computeTemplateStats(statsResult.docs || []),
    })
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const body = await request.json().catch(() => ({}))
    const payload = await getPayloadClient()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    const titleTemplate = typeof body.titleTemplate === 'string' ? body.titleTemplate.trim() : ''

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }
    if (!titleTemplate) {
      return NextResponse.json({ error: 'Title template is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {
      name,
      code,
      category: CATEGORIES.includes(body.category) ? body.category : 'learning',
      titleTemplate,
    }

    if (typeof body.bodyTemplate === 'string' && body.bodyTemplate.trim()) {
      data.bodyTemplate = body.bodyTemplate.trim()
    }
    if (typeof body.defaultLink === 'string' && body.defaultLink.trim()) {
      data.defaultLink = body.defaultLink.trim()
    }
    if (Array.isArray(body.channels) && body.channels.length > 0) {
      data.channels = body.channels.filter((c: string) => CHANNELS.includes(c))
    }
    if (typeof body.automatic === 'boolean') data.automatic = body.automatic
    data.manual = typeof body.manual === 'boolean' ? body.manual : true
    if (body.metadataSchema != null) data.metadataSchema = body.metadataSchema

    const doc = await payload.create({
      collection: 'notification-templates',
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeTemplate(doc), { status: 201 })
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const body = await request.json().catch(() => ({}))
    const payload = await getPayloadClient()

    if (!params.id) {
      return NextResponse.json({ error: 'Template id is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}

    if (typeof body.name === 'string') data.name = body.name.trim()
    if (typeof body.code === 'string') data.code = body.code.trim()
    if (CATEGORIES.includes(body.category)) data.category = body.category
    if (typeof body.titleTemplate === 'string') data.titleTemplate = body.titleTemplate.trim()

    if (body.bodyTemplate !== undefined) {
      data.bodyTemplate =
        typeof body.bodyTemplate === 'string' && body.bodyTemplate.trim()
          ? body.bodyTemplate.trim()
          : null
    }
    if (body.defaultLink !== undefined) {
      data.defaultLink =
        typeof body.defaultLink === 'string' && body.defaultLink.trim()
          ? body.defaultLink.trim()
          : null
    }
    if (body.channels !== undefined) {
      data.channels =
        Array.isArray(body.channels) && body.channels.length > 0
          ? body.channels.filter((c: string) => CHANNELS.includes(c))
          : null
    }
    if (typeof body.automatic === 'boolean') data.automatic = body.automatic
    if (typeof body.manual === 'boolean') data.manual = body.manual
    if (body.metadataSchema !== undefined) data.metadataSchema = body.metadataSchema

    const doc = await payload.update({
      collection: 'notification-templates',
      id: params.id,
      data,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeTemplate(doc))
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const payload = await getPayloadClient()

    if (!params.id) {
      return NextResponse.json({ error: 'Template id is required' }, { status: 400 })
    }

    await payload.delete({
      collection: 'notification-templates',
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}