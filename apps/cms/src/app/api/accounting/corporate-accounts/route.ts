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
        { accountCode: { like: search } } as never,
        { name: { like: search } } as never,
        { billingContact: { like: search } } as never,
        { email: { like: search } } as never,
        { status: { like: search } } as never,
      ]
    }

    const statuses = searchParams.getAll('status')
    if (statuses.length > 0) {
      where.status = { in: statuses } as never
    }

    const creditFilter = searchParams.get('creditFilter')
    if (creditFilter === 'hasCredit') {
      where.creditTerms = { exists: true } as never
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      where: where as never,
      page,
      limit,
      sort: '-createdAt',
      overrideAccess: true,
      depth: 0,
    })

    const rows = result.docs.map((doc) => ({
      id: doc.id,
      accountCode: doc.accountCode || null,
      name: doc.name || null,
      customer: doc.customer || null,
      billingContact: doc.billingContact || null,
      email: doc.email || null,
      phone: doc.phone || null,
      creditTerms: doc.creditTerms || null,
      paymentTerms: doc.paymentTerms || null,
      status: doc.status || null,
      statusLabel: doc.status ? (doc.status as string).charAt(0).toUpperCase() + (doc.status as string).slice(1) : null,
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
      cells: [
        doc.accountCode || '-',
        doc.name || '-',
        doc.customer ? `Customer #${doc.customer}` : '-',
        doc.billingContact || '-',
        doc.creditTerms || '-',
        doc.status || '-',
      ],
    }))

    const [activeCount, allDocs] = await Promise.all([
      payload.count({
        collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
        where: { status: { equals: 'active' } } as never,
        overrideAccess: true,
      }),
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
        limit: 10000,
        depth: 0,
        overrideAccess: true,
      }),
    ])

    const activeAccounts = Number(activeCount.totalDocs || 0)
    const totalDocs = result.totalDocs
    const inactiveAccounts = totalDocs - activeAccounts
    const creditTermsFilter = (d: unknown) => {
      return (d as { creditTerms?: unknown }).creditTerms
    }
    const withCreditTerms = allDocs.docs.filter(creditTermsFilter).length

    return NextResponse.json({
      section: {
        id: 'corporate-accounts',
        label: 'Corporate Accounts',
        description: 'Manage corporate payer accounts linked to customers with contact data, credit terms, payment terms, and status.',
        searchPlaceholder: 'Search account code, company name, customer, billing contact, or status',
        filters: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'With Credit Terms', value: 'hasCredit' },
        ],
        metrics: [
          { label: 'Active Corporate Accounts', value: String(activeAccounts), change: 'Available for company-billed training', trend: 'up' as const },
          { label: 'Total Accounts', value: String(totalDocs), change: 'All corporate account records', trend: 'neutral' as const },
          { label: 'With Credit Terms', value: String(withCreditTerms), change: 'Accounts storing commercial credit terms', trend: 'neutral' as const },
          { label: 'Inactive Accounts', value: String(inactiveAccounts), change: 'Retained for historical billing links', trend: 'down' as const },
        ],
        table: {
          title: 'Corporate Account Register',
          description: 'Corporate account records using account code, linked customer, billing contact, terms, and status.',
          columns: ['Account Code', 'Name', 'Customer', 'Billing Contact', 'Credit Terms', 'Status'],
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
        totalAccounts: totalDocs,
        filteredAccounts: totalDocs,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
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
