import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../_utils/service-api-key'

type MediaVisibility = 'shared' | 'private'

// Shared normalization previously duplicated in the frontend actions. Keeps the
// response shape identical for the admin and instructor scopes, and for the
// certifications builder consumer (id/filename/cloudinaryURL/thumbnailURL/url/
// alt/mimeType are all preserved).
function normalizeMediaDoc(raw: any) {
  const uploadedBy = raw?.uploadedBy
  return {
    id: Number(raw.id),
    url: raw.url ?? null,
    cloudinaryURL: raw.cloudinaryURL ?? null,
    thumbnailURL: raw.thumbnailURL ?? null,
    filename: raw.filename ?? null,
    alt: raw.alt ?? null,
    mimeType: raw.mimeType ?? null,
    filesize: raw.filesize ?? null,
    visibility: (raw.visibility === 'private' ? 'private' : 'shared') as MediaVisibility,
    uploadedBy:
      uploadedBy && typeof uploadedBy === 'object'
        ? Number(uploadedBy.id)
        : uploadedBy
          ? Number(uploadedBy)
          : null,
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
  }
}

// Instructor scope (userId present) restricts to media the user uploaded plus
// media explicitly shared with the library. Admin scope (no userId) sees all.
function buildScopedWhere(userId: string | null, scope: string | null, search: string): Where {
  const conditions: any[] = []

  if (userId) {
    const scopeFilter = scope || 'all'
    if (scopeFilter === 'mine') {
      conditions.push({ uploadedBy: { equals: userId } })
    } else if (scopeFilter === 'shared') {
      conditions.push({ visibility: { equals: 'shared' } })
    } else {
      conditions.push({
        or: [{ uploadedBy: { equals: userId } }, { visibility: { equals: 'shared' } }],
      })
    }
  }

  if (search) {
    conditions.push({ or: [{ filename: { like: search } }, { alt: { like: search } }] })
  }

  if (conditions.length === 0) return {}
  if (conditions.length === 1) return conditions[0] as Where
  return { and: conditions } as Where
}

function computeStats(docs: any[]) {
  const images = docs.filter((d: any) => !d?.mimeType || String(d.mimeType).startsWith('image/')).length
  const videos = docs.filter((d: any) => d?.mimeType && String(d.mimeType).startsWith('video/')).length
  const documents = docs.filter(
    (d: any) => d?.mimeType && !String(d.mimeType).startsWith('image/') && !String(d.mimeType).startsWith('video/'),
  ).length
  return { totalFiles: docs.length, images, videos, documents }
}

// GET /api/lms/media
//   ?search=&scope=&page=&limit=&sort=&userId=   -> paginated list with stats
//   ?id=<id>&userId=                             -> single item
// POST   /api/lms/media?userId=       -> multipart upload (file, alt, visibility)
// PATCH  /api/lms/media?id=<id>&userId= -> update alt/filename/visibility
// DELETE /api/lms/media?id=<id>       -> delete (admin scope only)
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const id = (searchParams.get('id') || '').trim()
    const userId = searchParams.get('userId') || null

    if (id) {
      const item = await payload.findByID({
        collection: 'media',
        id,
        depth: 0,
        overrideAccess: true,
      })
      if (!item) {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 })
      }
      return NextResponse.json(normalizeMediaDoc(item))
    }

    const search = (searchParams.get('search') || '').trim()
    const scope = (searchParams.get('scope') || '').trim() || null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '60')
    const sort = searchParams.get('sort') || '-updatedAt'

    const where = buildScopedWhere(userId, scope, search)

    const all = await payload.find({
      collection: 'media',
      where,
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })
    const allDocs = all.docs || []
    const stats = computeStats(allDocs)

    const result = await payload.find({
      collection: 'media',
      where,
      sort,
      page,
      limit,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (result.docs || []).map((doc: any) => normalizeMediaDoc(doc)),
      totalDocs: allDocs.length,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      stats,
      currentUserId: userId ? Number(userId) : null,
    })
  } catch (error) {
    console.error('[Media] Error fetching media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/media
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || null

    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const altValue = formData.get('alt')
    const alt = typeof altValue === 'string' && altValue.trim() ? altValue.trim() : null

    const visibilityValue = formData.get('visibility')
    const visibility: MediaVisibility =
      visibilityValue === 'private' ? 'private' : 'shared'

    const data: any = { alt, visibility }
    if (userId) {
      data.uploadedBy = Number(userId)
    }

    const payloadFile = {
      data: Buffer.from(await file.arrayBuffer()),
      mimetype: file.type || 'application/octet-stream',
      name: file.name,
      size: file.size,
    }

    const created = await payload.create({
      collection: 'media',
      data,
      file: payloadFile,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeMediaDoc(created), { status: 201 })
  } catch (error: any) {
    console.error('[Media] Error uploading media:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/media?id=<id>
export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId') || null

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    const existing = await payload.findByID({
      collection: 'media',
      id: String(id),
      depth: 0,
      overrideAccess: true,
    })
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    if (userId) {
      const rawUploader = existing.uploadedBy
      const uploaderId =
        rawUploader && typeof rawUploader === 'object'
          ? Number((rawUploader as any).id)
          : rawUploader
            ? Number(rawUploader)
            : null
      if (uploaderId !== Number(userId)) {
        return NextResponse.json(
          { error: 'You can only update media you uploaded' },
          { status: 403 },
        )
      }
    }

    const body = await request.json().catch(() => null)
    const data: any = {}
    if (body?.alt !== undefined) {
      data.alt = typeof body.alt === 'string' ? body.alt : null
    }
    if (body?.filename !== undefined) {
      data.filename = typeof body.filename === 'string' ? body.filename : null
    }
    if (body?.visibility !== undefined) {
      if (body.visibility !== 'shared' && body.visibility !== 'private') {
        return NextResponse.json(
          { error: 'visibility must be "shared" or "private"' },
          { status: 400 },
        )
      }
      data.visibility = body.visibility
    }

    const updated = await payload.update({
      collection: 'media',
      id: String(id),
      data,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeMediaDoc(updated))
  } catch (error: any) {
    console.error('[Media] Error updating media:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/media?id=<id>
export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId') || null

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    if (userId) {
      return NextResponse.json(
        { error: 'Instructors cannot delete media files' },
        { status: 403 },
      )
    }

    const existing = await payload.findByID({
      collection: 'media',
      id: String(id),
      depth: 0,
      overrideAccess: true,
    })
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    await payload.delete({
      collection: 'media',
      id: String(id),
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Media] Error deleting media:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}