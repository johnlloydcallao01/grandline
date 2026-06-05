import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {}
    if (search.trim()) {
      (where as Record<string, unknown>).or = [
        { awardType: { like: search } } as never,
        { status: { like: search } } as never,
      ]
    }

    const statuses = searchParams.getAll('status')
    if (statuses.length > 0) {
      (where as Record<string, unknown>).status = { in: statuses } as never
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
      where: where as never,
      page,
      limit,
      sort: '-createdAt',
      depth: 2,
      overrideAccess: true,
    })

    const rows = result.docs.map((doc) => {
      const sponsor = (doc.scholarshipSponsor as never) as Record<string, unknown> | undefined
      const sponsorName = sponsor?.name || sponsor?.sponsorCode || `Sponsor #${doc.scholarshipSponsor}`
      const trainee = (doc.trainee as never) as Record<string, unknown> | undefined
      const traineeUser = (trainee?.user as never) as Record<string, unknown> | undefined
      const traineeName = traineeUser?.email || traineeUser?.name || `Trainee #${doc.trainee}`
      return {
        id: doc.id,
        awardType: doc.awardType || null,
        sponsorName,
        traineeName,
        awardAmount: doc.awardAmount ?? 0,
        awardPercent: doc.awardPercent ?? null,
        traineeShareAmount: doc.traineeShareAmount ?? 0,
        effectiveDate: doc.effectiveDate || null,
        status: doc.status || null,
        statusLabel: doc.status ? String(doc.status).charAt(0).toUpperCase() + String(doc.status).slice(1) : null,
        createdAt: doc.createdAt || null,
        updatedAt: doc.updatedAt || null,
        cells: [
          doc.awardType || '-',
          sponsorName,
          traineeName,
          `PHP ${(doc.awardAmount ?? 0).toLocaleString()}`,
          doc.status || '-',
        ],
      }
    })

    const totalDocs = result.totalDocs
    const activeAwards = result.docs.filter((d) => d.status === 'active').length

    return NextResponse.json({
      section: {
        id: 'scholarship-awards',
        label: 'Scholarship Awards',
        description: 'Scholarship awards applied to enrollment billing links.',
        searchPlaceholder: 'Search award type, sponsor, or status',
        filters: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Archived', value: 'archived' },
        ],
        metrics: [
          { label: 'Active Awards', value: String(activeAwards), change: 'Awards currently active', trend: 'up' as const },
          { label: 'Total Awards', value: String(totalDocs), change: 'All scholarship award records', trend: 'neutral' as const },
        ],
        table: {
          title: 'Scholarship Award Register',
          description: 'Scholarship awards linked to enrollment billing links with sponsor, trainee, amount, and status.',
          columns: ['Award Type', 'Sponsor', 'Trainee', 'Amount', 'Status'],
          rows,
        },
      },
      pagination: {
        page: result.page,
        limit: result.limit,
        totalDocs,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
      },
      totals: {
        totalAwards: totalDocs,
        filteredAwards: totalDocs,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      },
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
