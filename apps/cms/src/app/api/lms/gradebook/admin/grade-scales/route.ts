import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../../_utils/service-api-key'
import { normalizeGrade, scaleTitle } from '../../_utils/grade-scale'

function normalizeScale(scale: any): any {
  return {
    id: Number(scale.id),
    title: scaleTitle(scale),
    description: scale.description || null,
    grades: (scale.grades || []).map(normalizeGrade),
    updatedAt: scale.updatedAt,
    createdAt: scale.createdAt,
  }
}

// GET /api/lms/gradebook/admin/grade-scales
//   ?id= -> single grade scale
//   otherwise -> list of grade scales (limit 100, sorted by title)
// POST creates a scale. PATCH updates { id, data }. DELETE ?id= removes it.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const id = (searchParams.get('id') || '').trim()
    if (id) {
      const scale = await payload.findByID({
        collection: 'grade-scales',
        id,
        depth: 2,
        overrideAccess: true,
      })
      if (!scale) {
        return NextResponse.json({ error: 'Grade scale not found' }, { status: 404 })
      }
      return NextResponse.json({ scale: normalizeScale(scale) })
    }

    const scales = await payload.find({
      collection: 'grade-scales',
      where: {},
      limit: 100,
      sort: 'title',
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (scales.docs || []).map(normalizeScale),
      totalDocs: scales.totalDocs,
    })
  } catch (error) {
    console.error('[Gradebook] Error fetching grade scales:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    if (!body?.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const scale = await payload.create({
      collection: 'grade-scales',
      data: {
        title: body.title,
        description: body.description || null,
        grades: body.grades || [],
      },
      overrideAccess: true,
    })

    return NextResponse.json(normalizeScale(scale), { status: 201 })
  } catch (error: any) {
    console.error('[Gradebook] Error creating grade scale:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { id } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const data = body.data || {}
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }

    const scale = await payload.update({
      collection: 'grade-scales',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeScale(scale))
  } catch (error: any) {
    console.error('[Gradebook] Error updating grade scale:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    await payload.delete({ collection: 'grade-scales', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Gradebook] Error deleting grade scale:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}
