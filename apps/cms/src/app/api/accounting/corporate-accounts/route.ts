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

function getStatusTone(status: string): 'green' | 'amber' | 'gray' {
  if (status === 'active') return 'green';
  if (status === 'inactive') return 'amber';
  return 'gray';
}

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

    const [result, customersResult] = await Promise.all([
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
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

    type RowData = {
      id: string;
      accountCode: string;
      name: string;
      customer: string;
      customerLabel: string;
      billingContact: string;
      email: string;
      phone: string;
      creditTerms: string;
      paymentTerms: string;
      status: string;
      statusLabel: string;
      notes: string;
      createdAt: string | null;
      updatedAt: string | null;
    };

    const allRows: RowData[] = result.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const cust = d.customer as unknown as Record<string, unknown> | undefined
      const customerId = cust ? String(cust.id ?? cust) : ''
      const customerLabel = cust
        ? String(cust.displayName || cust.customerCode || customerMap.get(customerId) || `Customer #${customerId}`)
        : '-'
      return {
        id: String(d.id),
        accountCode: String(d.accountCode || ''),
        name: String(d.name || ''),
        customer: customerId,
        customerLabel,
        billingContact: String(d.billingContact || ''),
        email: String(d.email || ''),
        phone: String(d.phone || ''),
        creditTerms: String(d.creditTerms || ''),
        paymentTerms: String(d.paymentTerms || ''),
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
          row.accountCode,
          row.name,
          row.customerLabel,
          row.billingContact,
          row.email,
          row.creditTerms,
          row.paymentTerms,
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
    const flatRows = filteredRows.slice(startIndex, startIndex + limit)

    const activeAccounts = allRows.filter((row) => row.status === 'active').length
    const inactiveAccounts = allRows.filter((row) => row.status === 'inactive').length
    const withCreditTerms = allRows.filter((row) => row.creditTerms).length

    return NextResponse.json({
      section: {
        id: 'corporate-accounts',
        label: 'Corporate Accounts',
        description: 'Create, review, and manage B2B training customer / corporate payer master records with credit terms, billing contact, and account status.',
        searchPlaceholder: 'Search account code, company name, customer, billing contact, or status',
        filters: {
          statuses: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Archived', value: 'archived' },
          ],
          creditFilters: [
            { label: 'With Credit Terms', value: 'hasCredit' },
          ],
          quickFilters: [
            { label: 'Active Accounts', value: 'active' },
            { label: 'With Credit Terms', value: 'hasCredit' },
            { label: 'Inactive Accounts', value: 'inactive' },
          ],
        },
        metrics: [
          { id: 'active-accounts', label: 'Active Accounts', value: activeAccounts, change: 'Available for company-billed training', trend: activeAccounts > 0 ? 'up' as const : 'neutral' as const },
          { id: 'total-accounts', label: 'Total Accounts', value: allRows.length, change: 'All corporate account records', trend: allRows.length > 0 ? 'up' as const : 'neutral' as const },
          { id: 'with-credit-terms', label: 'With Credit Terms', value: withCreditTerms, change: 'Accounts storing commercial credit terms', trend: withCreditTerms > 0 ? 'neutral' as const : 'down' as const },
          { id: 'inactive-accounts', label: 'Inactive Accounts', value: inactiveAccounts, change: 'Retained for historical billing links', trend: inactiveAccounts > 0 ? 'down' as const : 'neutral' as const },
        ],
        table: {
          title: 'Corporate Account Register',
          description: 'Corporate account records using account code, linked customer, billing contact, terms, and status.',
          columns: ['Account Code', 'Name', 'Customer', 'Billing Contact', 'Credit Terms', 'Status'],
          rows: flatRows.map((row) => ({
            id: row.id,
            accountCode: row.accountCode,
            name: row.name,
            customerLabel: row.customerLabel,
            billingContact: row.billingContact,
            creditTerms: row.creditTerms,
            paymentTerms: row.paymentTerms,
            creditTermsLabel: row.creditTerms || row.paymentTerms || '-',
            status: row.status,
            statusLabel: row.statusLabel,
            email: row.email,
            phone: row.phone,
            notes: row.notes,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: [
              row.accountCode || '-',
              { text: row.name || '-', emphasis: true },
              row.customerLabel || '-',
              row.billingContact || '-',
              row.creditTerms || row.paymentTerms || '-',
              { text: row.statusLabel, tone: getStatusTone(row.status) },
            ],
          })),
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
      accountCode: String(body.accountCode || '').trim() || undefined,
      name: String(body.name || '').trim(),
      billingContact: String(body.billingContact || '').trim() || undefined,
      email: String(body.email || '').trim() || undefined,
      phone: String(body.phone || '').trim() || undefined,
      creditTerms: String(body.creditTerms || '').trim() || undefined,
      paymentTerms: String(body.paymentTerms || '').trim() || undefined,
      status: String(body.status || 'active'),
      notes: String(body.notes || '').trim() || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    }

    if (body.customer) data.customer = toId(body.customer)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
