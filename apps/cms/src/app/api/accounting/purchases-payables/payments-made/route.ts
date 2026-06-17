import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, PAYMENT_METHOD_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  assertPaymentMadeMutationPayload,
  buildPaymentMadeDetailContext,
  buildPaymentMadeRow,
  buildPaymentsMadeMetrics,
  buildPaymentsMadeReferenceData,
  matchesSelectedPaymentsMadeFilters,
  normalizePaymentMadeMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type PaymentMadeDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const paymentMethods = parseListParam(searchParams, 'paymentMethod')
    const vendorIds = parseListParam(searchParams, 'vendorId')
    const applicationStates = parseListParam(searchParams, 'applicationState')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [paymentDocs, referenceData] = await Promise.all([
      findAllDocs<PaymentMadeDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
        depth: 2,
        sort: '-paymentDate',
      }),
      buildPaymentsMadeReferenceData(payload),
    ])

    const rows = paymentDocs.map(buildPaymentMadeRow)
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) {
        return false
      }

      return matchesSelectedPaymentsMadeFilters(row, {
        statuses,
        paymentMethods,
        vendorIds,
        applicationStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)
    const mutablePaymentIds = new Set(
      rows.filter((row) => ['draft'].includes(row.status)).map((row) => row.id),
    )

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildPaymentsMadeMetrics(filteredRows),
      filterOptions: {
        statuses: [
          { label: 'Draft', value: 'draft' },
          { label: 'Posted', value: 'posted' },
          { label: 'Voided', value: 'voided' },
        ],
        paymentMethods: PAYMENT_METHOD_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
        })),
        vendors: referenceData.vendors.map((vendor) => ({
          label: `${vendor.vendorCode ? `${vendor.vendorCode} - ` : ''}${vendor.displayName || `Vendor ${vendor.id}`}`,
          value: String(vendor.id),
        })),
        applicationStates: [
          { label: 'With Applications', value: 'with_applications' },
          { label: 'Unapplied Amount', value: 'unapplied' },
        ],
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'Voided', value: 'status:voided' },
          { label: 'With Applications', value: 'application:with_applications' },
          { label: 'Unapplied Amount', value: 'application:unapplied' },
          { label: 'Bank Transfer', value: 'paymentMethod:bank_transfer' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        paymentMethods,
        vendorIds,
        applicationStates,
        quickFilters,
      },
      meta: {
        id: 'payments-made',
        label: 'Payments Made',
        description:
          'Manage outgoing vendor payments with posting status, payment method, bank account, and bill applications.',
        searchPlaceholder: 'Search payment no., vendor, bank account, reference no., or payment method',
        tableTitle: 'Vendor Payment Register',
        tableDescription:
          'Payment-made records with bank account routing, application coverage, and posting status.',
        columns: ['Payment No.', 'Payment Date', 'Vendor', 'Method', { label: 'Amount', align: 'right' }, 'Status'],
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
        totalRows: rows.length,
        filteredRows: totalDocs,
      },
      referenceData,
      flags: {
        mutablePaymentIds: Array.from(mutablePaymentIds),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizePaymentMadeMutationBody((await request.json()) as Record<string, unknown>)
    await assertPaymentMadeMutationPayload(payload, body)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      overrideAccess: true,
      data: {
        ...body,
        status: 'draft',
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
      depth: 2,
    })

    return NextResponse.json(await buildPaymentMadeDetailContext(payload, record.id), { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
