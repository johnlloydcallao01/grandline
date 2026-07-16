import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '60')
    const page = parseInt(searchParams.get('page') || '1')
    const search = (searchParams.get('search') || '').trim()

    if (id) {
      const item = await payload.findByID({
        collection: 'media',
        id,
        overrideAccess: true,
      })

      if (!item) {
        return NextResponse.json(
          { error: 'Media not found' },
          { status: 404 },
        )
      }

      return NextResponse.json(item)
    }

    const where: Where = {}

    if (search) {
      where.filename = { like: search }
    }

    const media = await payload.find({
      collection: 'media',
      where,
      limit,
      page,
      sort: '-createdAt',
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: media.docs,
      totalDocs: media.totalDocs,
      limit: media.limit,
      totalPages: media.totalPages,
      page: media.page,
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
