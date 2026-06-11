import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseIntegerParam(searchParams.get('page'), 1)
    const limit = parseIntegerParam(searchParams.get('limit'), 10)

    const where: Record<string, unknown> = {}

    if (search.trim()) {
      where.or = [
        { sponsorCode: { like: search } } as never,
        { name: { like: search } } as never,
        { contactName: { like: search } } as never,
        { email: { like: search } } as never,
        { status: { like: search } } as never,
      ]
    }

    const statuses = searchParams.getAll('status')
    if (statuses.length > 0) {
      where.status = { in: statuses } as never
    }

    const contactFilter = searchParams.get('contactFilter')
    if (contactFilter === 'hasContact') {
      where.contactName = { exists: true } as never
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
      where: where as never,
      page,
      limit,
      sort: '-createdAt',
      overrideAccess: true,
      depth: 0,
    })

    const rows = result.docs.map((doc) => ({
      id: doc.id,
      sponsorCode: doc.sponsorCode || null,
      name: doc.name || null,
      defaultCustomer: doc.defaultCustomer || null,
      contactName: doc.contactName || null,
      email: doc.email || null,
      phone: doc.phone || null,
      status: doc.status || null,
      statusLabel: doc.status ? (doc.status as string).charAt(0).toUpperCase() + (doc.status as string).slice(1) : null,
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
      cells: [
        doc.sponsorCode || '-',
        doc.name || '-',
        doc.defaultCustomer ? `Customer #${doc.defaultCustomer}` : '-',
        doc.contactName || '-',
        doc.email || '-',
        doc.status || '-',
      ],
    }))

    const [activeCount, allDocs] = await Promise.all([
      payload.count({
        collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
        where: { status: { equals: 'active' } } as never,
        overrideAccess: true,
      }),
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
        limit: 10000,
        depth: 0,
        overrideAccess: true,
      }),
    ])

    const activeSponsors = Number(activeCount.totalDocs || 0)
    const totalDocs = result.totalDocs
    const inactiveSponsors = totalDocs - activeSponsors
    const contactInfoFilter = (d: unknown) => {
      const r = d as { contactName?: unknown; email?: unknown; phone?: unknown }
      return r.contactName || r.email || r.phone
    }
    const withContactInfo = allDocs.docs.filter(contactInfoFilter).length

    return NextResponse.json({
      section: {
        id: 'scholarship-sponsors',
        label: 'Scholarship Sponsors',
        description: 'Maintain sponsor master records mapped to accounting customers with contact and status information.',
        searchPlaceholder: 'Search sponsor code, name, default customer, contact, or status',
        filters: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'With Contact Info', value: 'hasContact' },
        ],
        metrics: [
          { label: 'Active Sponsors', value: String(activeSponsors), change: 'Sponsors usable for scholarship billing', trend: 'up' as const },
          { label: 'Total Sponsors', value: String(totalDocs), change: 'All sponsor master records', trend: 'neutral' as const },
          { label: 'Inactive Sponsors', value: String(inactiveSponsors), change: 'Retained for prior awards and billing links', trend: 'down' as const },
          { label: 'With Contact Info', value: String(withContactInfo), change: 'Sponsors with operational contact details', trend: 'neutral' as const },
        ],
        table: {
          title: 'Scholarship Sponsor Register',
          description: 'Sponsor records using sponsor code, name, default customer relationship, and status.',
          columns: ['Sponsor Code', 'Name', 'Default Customer', 'Contact', 'Email', 'Status'],
          rows,
        },
      },
      pagination: {
        page: result.page,
        limit: result.limit,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
      },
      totals: {
        totalSponsors: totalDocs,
        filteredSponsors: totalDocs,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      },
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
