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

    const [result, customersResult] = await Promise.all([
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
        limit: 10000,
        sort: '-createdAt',
        overrideAccess: true,
        depth: 2,
      }),
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.customers,
        limit: 500,
        sort: 'displayName',
        overrideAccess: true,
        depth: 0,
      }),
    ])

    const customerMap = new Map<string, string>()
    for (const c of customersResult.docs) {
      const cDoc = c as unknown as Record<string, unknown>
      customerMap.set(String(c.id), String(cDoc.displayName || cDoc.customerCode || `Customer #${c.id}`))
    }

    const allRows = result.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const cust = d.defaultCustomer as unknown as Record<string, unknown> | undefined
      const customerId = cust ? String(cust.id ?? cust) : ''
      const customerLabel = cust
        ? String(cust.displayName || cust.customerCode || customerMap.get(customerId) || `Customer #${customerId}`)
        : '-'
      return {
        id: String(d.id),
        sponsorCode: String(d.sponsorCode || ''),
        name: String(d.name || ''),
        defaultCustomer: customerId,
        defaultCustomerLabel: customerLabel,
        contactName: String(d.contactName || ''),
        email: String(d.email || ''),
        phone: String(d.phone || ''),
        billingAddress: String(d.billingAddress || ''),
        status: String(d.status || 'active'),
        statusLabel: String(d.status ? String(d.status).charAt(0).toUpperCase() + String(d.status).slice(1) : ''),
        notes: String(d.notes || ''),
        createdAt: d.createdAt ? String(d.createdAt) : null,
        updatedAt: d.updatedAt ? String(d.updatedAt) : null,
      }
    })

    const normalizedSearch = search.trim().toLowerCase()
    let filteredRows = allRows.filter((row) => {
      if (normalizedSearch) {
        const matchesSearch = [
          row.sponsorCode,
          row.name,
          row.defaultCustomerLabel,
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
    const flatRows = filteredRows.slice(startIndex, startIndex + limit)

    const activeSponsors = allRows.filter((row) => row.status === 'active').length
    const inactiveSponsors = allRows.filter((row) => row.status === 'inactive').length
    const withContactInfo = allRows.filter((row) => row.contactName || row.email || row.phone).length

    return NextResponse.json({
      rows: flatRows,
      metrics: [
        { id: 'active-sponsors', label: 'Active Sponsors', value: activeSponsors, change: 'Sponsors usable for scholarship billing', trend: activeSponsors > 0 ? 'up' as const : 'neutral' as const },
        { id: 'total-sponsors', label: 'Total Sponsors', value: allRows.length, change: 'All sponsor master records', trend: allRows.length > 0 ? 'up' as const : 'neutral' as const },
        { id: 'inactive-sponsors', label: 'Inactive Sponsors', value: inactiveSponsors, change: 'Retained for prior awards and billing links', trend: inactiveSponsors > 0 ? 'down' as const : 'neutral' as const },
        { id: 'with-contact', label: 'With Contact Info', value: withContactInfo, change: 'Sponsors with operational contact details', trend: withContactInfo > 0 ? 'neutral' as const : 'down' as const },
      ],
      filterOptions: {
        statuses: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Archived', value: 'archived' },
        ],
        contactFilters: [
          { label: 'With Contact Info', value: 'hasContact' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search sponsor code, name, default customer, contact, or status',
        columns: ['Sponsor Code', 'Name', 'Default Customer', 'Contact', 'Email', 'Status'],
        tableTitle: 'Scholarship Sponsor Register',
        tableDescription: 'Sponsor records using sponsor code, name, default customer relationship, and status.',
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
        totalRows: allRows.length,
        filteredRows: totalDocs,
      },
      referenceData: {
        customers: customersResult.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          return { id: String(r.id), displayName: String(r.displayName || r.customerCode || ''), customerCode: String(r.customerCode || '') }
        }),
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

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const data: Record<string, unknown> = {
      sponsorCode: String(body.sponsorCode || '').trim() || undefined,
      name: String(body.name || '').trim(),
      contactName: String(body.contactName || '').trim() || undefined,
      email: String(body.email || '').trim() || undefined,
      phone: String(body.phone || '').trim() || undefined,
      billingAddress: String(body.billingAddress || '').trim() || undefined,
      status: String(body.status || 'active'),
      notes: String(body.notes || '').trim() || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.defaultCustomer) data.defaultCustomer = toId(body.defaultCustomer)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
