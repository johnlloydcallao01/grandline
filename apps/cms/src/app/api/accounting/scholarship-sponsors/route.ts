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
    const contactFilter = searchParams.get('contactFilter') || ''
    const quickFilters = parseListParam(searchParams, 'quickFilter')

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
      limit: 10000,
      sort: '-createdAt',
      overrideAccess: true,
      depth: 0,
    })

    const allRows = result.docs.map((doc) => ({
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

    const normalizedSearch = search.trim().toLowerCase()
    let filteredRows = allRows.filter((row) => {
      if (normalizedSearch) {
        const matchesSearch = [
          row.sponsorCode,
          row.name,
          row.contactName,
          row.email,
          row.statusLabel,
          row.status,
        ].some((value) => normalizeSearch(value).includes(normalizedSearch))

        if (!matchesSearch) return false
      }

      if (statuses.length > 0 && (!row.status || !statuses.includes(row.status))) {
        return false
      }

      if (contactFilter === 'hasContact' && !(row.contactName || row.email || row.phone)) {
        return false
      }

      return true
    })

    if (quickFilters.length > 0) {
      filteredRows = filteredRows.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue === 'hasContact') {
            return Boolean(row.contactName || row.email || row.phone)
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

    const activeSponsors = allRows.filter((row) => row.status === 'active').length
    const inactiveSponsors = allRows.filter((row) => row.status === 'inactive').length
    const withContactInfo = allRows.filter((row) => row.contactName || row.email || row.phone).length

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
      appliedFilters: {
        search,
        statuses,
        contactFilter,
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
        totalSponsors: allRows.length,
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
