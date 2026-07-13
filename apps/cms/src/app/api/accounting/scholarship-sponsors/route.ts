import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, LMS_SPONSOR_STATUS_OPTIONS } from '@/accounting/constants/accounting'
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

function getStatusTone(status: string): 'green' | 'amber' | 'gray' {
  if (status === 'active') return 'green'
  if (status === 'inactive') return 'amber'
  return 'gray'
}

type SponsorRow = {
  id: string
  sponsorCode: string
  name: string
  defaultCustomerId: string
  defaultCustomerLabel: string
  contactName: string
  email: string
  phone: string
  billingAddress: string
  status: string
  notes: string
  createdAt: string | null
  updatedAt: string | null
  searchableText: string
  cells: unknown[]
}

function mapSponsorRow(doc: Record<string, unknown>, customerLabel: string, customerId: string): SponsorRow {
  const status = String(doc.status || 'active')
  const name = String(doc.name || '')
  const sponsorCode = String(doc.sponsorCode || '')
  const contactName = String(doc.contactName || '')
  const email = String(doc.email || '')
  return {
    id: String(doc.id),
    sponsorCode,
    name,
    defaultCustomerId: customerId,
    defaultCustomerLabel: customerLabel,
    contactName,
    email,
    phone: String(doc.phone || ''),
    billingAddress: String(doc.billingAddress || ''),
    status,
    notes: String(doc.notes || ''),
    createdAt: doc.createdAt ? String(doc.createdAt) : null,
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : null,
    searchableText: [sponsorCode, name, customerLabel, contactName, email, status].map((v) => normalizeSearch(v)).filter(Boolean).join(' '),
    cells: [
      { text: sponsorCode, emphasis: true },
      name,
      customerLabel,
      contactName || '-',
      email || '-',
      { text: status.charAt(0).toUpperCase() + status.slice(1), tone: getStatusTone(status) },
    ],
  }
}

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
      return mapSponsorRow(d, customerLabel, customerId)
    })

    const normalizedSearch = normalizeSearch(search)
    let filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      if (statuses.length > 0 && !statuses.includes(row.status)) return false
      if (contactFilter === 'hasContact' && !(row.contactName || row.email || row.phone)) return false
      return true
    })

    if (quickFilters.length > 0) {
      filteredRows = filteredRows.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue === 'hasContact') return Boolean(row.contactName || row.email || row.phone)
          return row.status === filterValue
        }),
      )
    }

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(Math.max(page, 1), totalPages)
    const startIndex = (currentPage - 1) * limit
    const paginatedRows = filteredRows.slice(startIndex, startIndex + limit)

    const activeSponsors = allRows.filter((row) => row.status === 'active').length
    const inactiveSponsors = allRows.filter((row) => row.status === 'inactive').length
    const withContactInfo = allRows.filter((row) => row.contactName || row.email || row.phone).length

    return NextResponse.json({
      section: {
        id: 'scholarship-sponsors',
        label: 'Scholarship Sponsors',
        description: 'Scholarship, grant, and sponsorship master records mapped to accounting customers.',
        searchPlaceholder: 'Search sponsor code, name, default customer, contact, or status',
        filters: {
          statuses: LMS_SPONSOR_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          contactFilters: [{ label: 'With Contact Info', value: 'hasContact' }],
          quickFilters: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Archived', value: 'archived' },
            { label: 'With Contact Info', value: 'hasContact' },
          ],
        },
        metrics: [
          { id: 'active-sponsors', label: 'Active Sponsors', value: activeSponsors, change: 'Sponsors usable for scholarship billing', trend: activeSponsors > 0 ? 'up' as const : 'neutral' as const },
          { id: 'total-sponsors', label: 'Total Sponsors', value: allRows.length, change: 'All sponsor master records', trend: allRows.length > 0 ? 'up' as const : 'neutral' as const },
          { id: 'inactive-sponsors', label: 'Inactive Sponsors', value: inactiveSponsors, change: 'Retained for prior awards and billing links', trend: inactiveSponsors > 0 ? 'down' as const : 'neutral' as const },
          { id: 'with-contact', label: 'With Contact Info', value: withContactInfo, change: 'Sponsors with operational contact details', trend: withContactInfo > 0 ? 'neutral' as const : 'down' as const },
        ],
        table: {
          title: 'Scholarship Sponsor Register',
          description: 'Sponsor records using sponsor code, name, default customer relationship, and status.',
          columns: ['Sponsor Code', 'Name', 'Default Customer', 'Contact', 'Email', 'Status'],
          rows: paginatedRows,
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
