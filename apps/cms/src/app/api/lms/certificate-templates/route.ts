import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '100')

    if (id) {
      const template = await payload.findByID({
        collection: 'certificate-templates',
        id,
        depth: 1,
        overrideAccess: true,
      })

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 },
        )
      }

      return NextResponse.json(template)
    }

    const templates = await payload.find({
      collection: 'certificate-templates',
      depth: 1,
      limit,
      sort: '-updatedAt',
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: templates.docs,
      totalDocs: templates.totalDocs,
      limit: templates.limit,
      totalPages: templates.totalPages,
      page: templates.page,
    })
  } catch (error) {
    console.error('Error fetching certificate templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { name, slug, backgroundImage, canvasSchema, status } = body

    if (!name || !slug || !backgroundImage || !canvasSchema) {
      return NextResponse.json(
        { error: 'name, slug, backgroundImage, and canvasSchema are required' },
        { status: 400 },
      )
    }

    const template = await payload.create({
      collection: 'certificate-templates',
      data: {
        name,
        slug,
        backgroundImage: Number(backgroundImage),
        canvasSchema,
        status: status || 'draft',
      },
      overrideAccess: true,
    })

    return NextResponse.json({ doc: template }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating certificate template:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const body = await request.json()

    const id = searchParams.get('id') || body.id

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 },
      )
    }

    const data: Record<string, any> = {}

    if (body.name !== undefined) data.name = body.name
    if (body.slug !== undefined) data.slug = body.slug
    if (body.backgroundImage !== undefined) data.backgroundImage = Number(body.backgroundImage)
    if (body.canvasSchema !== undefined) data.canvasSchema = body.canvasSchema
    if (body.status !== undefined) data.status = body.status

    const template = await payload.update({
      collection: 'certificate-templates',
      id,
      data,
      overrideAccess: true,
    })

    return NextResponse.json({ doc: template })
  } catch (error: any) {
    console.error('Error updating certificate template:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 },
    )
  }
}
