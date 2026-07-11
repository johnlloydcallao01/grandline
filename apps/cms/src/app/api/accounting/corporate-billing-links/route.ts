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
      where.or = [
        { 'corporateAccount.name': { like: search } } as never,
        { 'corporateAccount.accountCode': { like: search } } as never,
        { 'enrollmentBillingLink.sourceReference': { like: search } } as never,
        { 'invoice.invoiceNumber': { like: search } } as never,
        { notes: { like: search } } as never,
      ]
    }

    const statuses = searchParams.getAll('status')
    if (statuses.length > 0) {
      where.status = { in: statuses } as never
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
      where: where as never,
      page,
      limit,
      sort: '-createdAt',
      depth: 2,
      overrideAccess: true,
    })

    const rows = result.docs.map((doc) => {
      const account = (doc.corporateAccount as never) as Record<string, unknown> | undefined
      const accountName = account?.name || account?.accountCode || `Account #${doc.corporateAccount}`
      return {
        id: doc.id,
        coverageType: doc.coverageType || null,
        accountName,
        coveredAmount: doc.coveredAmount ?? 0,
        traineeShareAmount: doc.traineeShareAmount ?? 0,
        status: doc.status || null,
        statusLabel: doc.status ? String(doc.status).charAt(0).toUpperCase() + String(doc.status).slice(1) : null,
        createdAt: doc.createdAt || null,
        updatedAt: doc.updatedAt || null,
        cells: [
          doc.coverageType || '-',
          accountName,
          `PHP ${(doc.coveredAmount ?? 0).toLocaleString()}`,
          `PHP ${(doc.traineeShareAmount ?? 0).toLocaleString()}`,
          doc.status || '-',
        ],
      }
    })

    const totalDocs = result.totalDocs
    const activeLinks = result.docs.filter((d) => d.status === 'active').length
    const corporateCoverage = result.docs
      .filter((d) => d.status === 'active')
      .reduce((sum, d) => sum + (d.coveredAmount ?? 0), 0)
    const sharedCoverageLinks = result.docs
      .filter((d) => (d.traineeShareAmount ?? 0) > 0)
      .length

    return NextResponse.json({
      section: {
        id: 'corporate-billing-links',
        label: 'Corporate Billing Links',
        description: 'Corporate billing links connecting accounts to enrollment billing.',
        searchPlaceholder: 'Search coverage type, corporate account, or status',
        filters: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Archived', value: 'archived' },
        ],
        metrics: [
          { id: 'active-links', label: 'Active Links', value: String(activeLinks), change: 'Corporate coverage records currently in force', trend: 'up' as const },
          { id: 'total-links', label: 'Total Links', value: String(totalDocs), change: 'All corporate billing link records', trend: 'neutral' as const },
          { id: 'corporate-coverage', label: 'Corporate Coverage', value: `PHP ${corporateCoverage.toLocaleString()}`, change: 'Covered amount from company billing records', trend: 'up' as const },
          { id: 'shared-coverage-links', label: 'Shared Coverage Links', value: String(sharedCoverageLinks), change: 'Links where trainee share remains after corporate pay', trend: 'neutral' as const },
        ],
        table: {
          title: 'Corporate Billing Link Register',
          description: 'Corporate billing links with account, coverage type, amounts, and status.',
          columns: ['Coverage Type', 'Account', 'Covered Amount', 'Trainee Share', 'Status'],
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
        totalLinks: totalDocs,
        filteredLinks: totalDocs,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
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
