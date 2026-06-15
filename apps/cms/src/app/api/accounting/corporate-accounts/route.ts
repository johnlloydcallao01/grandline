import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] => {
  return Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )
}

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const normalizeSearch = (value: unknown) => normalizeText(value).toLowerCase()

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseIntegerParam(searchParams.get('page'), 1)
    const limit = parseIntegerParam(searchParams.get('limit'), 10)

    const statuses = parseListParam(searchParams, 'status')
    const creditFilter = searchParams.get('creditFilter') || ''
    const quickFilters = parseListParam(searchParams, 'quickFilter')

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      limit: 10000,
      sort: '-createdAt',
      overrideAccess: true,
      depth: 0,
    })

    const allRows = result.docs.map((doc) => ({
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

    const normalizedSearch = search.trim().toLowerCase()
    let filteredRows = allRows.filter((row) => {
      if (normalizedSearch) {
        const matchesSearch = [
          row.accountCode,
          row.name,
          row.billingContact,
          row.email,
          row.statusLabel,
          row.status,
        ].some((value) => normalizeSearch(value).includes(normalizedSearch))

        if (!matchesSearch) return false
      }

      if (statuses.length > 0 && (!row.status || !statuses.includes(row.status))) {
        return false
      }

      if (creditFilter === 'hasCredit' && !row.creditTerms) {
        return false
      }

      return true
    })

    if (quickFilters.length > 0) {
      filteredRows = filteredRows.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue === 'hasCredit') {
            return Boolean(row.creditTerms)
          }

          return Boolean(row.status && row.status === filterValue)
        }),
      )
    }

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(Math.max(page, 1), totalPages)
    const startIndex = (currentPage - 1) * limit
    const rows = filteredRows.slice(startIndex, startIndex + limit)

    const activeAccounts = allRows.filter((row) => row.status === 'active').length
    const inactiveAccounts = allRows.filter((row) => row.status === 'inactive').length
    const withCreditTerms = allRows.filter((row) => row.creditTerms).length

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
      appliedFilters: {
        search,
        statuses,
        creditFilter,
        quickFilters,
      },
      pagination: {
        page: currentPage,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
      totals: {
        totalAccounts: allRows.length,
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
