import { NextRequest, NextResponse } from 'next/server'
import {
  BOUNCED_PAYMENT_CASE_STATUS_OPTIONS,
  BOUNCED_PAYMENT_REASON_OPTIONS,
  ACCOUNTING_COLLECTION_SLUGS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertBouncedPaymentMutationPayload,
  buildBouncedPaymentDetailResponse,
  buildBouncedPaymentMetrics,
  buildBouncedPaymentPersistenceData,
  buildBouncedPaymentReferenceData,
  buildBouncedPaymentRow,
  matchesBouncedPaymentFilters,
  normalizeBouncedPaymentMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type BouncedPaymentDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const reasons = parseListParam(searchParams, 'reason')
    const customerIds = parseListParam(searchParams, 'customerId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [docs, referenceData] = await Promise.all([
      findAllDocs<BouncedPaymentDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
        depth: 2,
        sort: '-bounceDate',
      }),
      buildBouncedPaymentReferenceData(payload),
    ])

    const rows = docs.map((doc) => buildBouncedPaymentRow(doc))
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesBouncedPaymentFilters(row, {
        statuses,
        reasons,
        customerIds,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildBouncedPaymentMetrics(filteredRows),
      filterOptions: {
        statuses: BOUNCED_PAYMENT_CASE_STATUS_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })),
        reasons: BOUNCED_PAYMENT_REASON_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })),
        customers: referenceData.customers.map((customer) => ({
          label: `${customer.customerCode ? `${customer.customerCode} - ` : ''}${customer.displayName || `Customer ${customer.id}`}`,
          value: String(customer.id),
        })),
        quickFilters: [
          { label: 'Open Cases', value: 'caseStatus:open' },
          { label: 'Awaiting Reversal', value: 'workflow:awaiting_reversal' },
          { label: 'Charges Applied', value: 'charges:applied' },
          { label: 'Resolved', value: 'caseStatus:resolved' },
          { label: 'Customer Follow-up', value: 'workflow:follow_up' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        reasons,
        customerIds,
        quickFilters,
      },
      meta: {
        id: 'bounced-payments',
        label: 'Bounced Payments',
        description: 'Track failed incoming payments, reversal journals, bank charges, and customer recovery follow-up using live accounting data.',
        searchPlaceholder: 'Search case no., customer, receipt no., bounce reason, or journal reference',
        tableTitle: 'Bounced Payment Caseboard',
        tableDescription: 'Every bounced customer payment from bank notice through reversal, charges, and recovery handling.',
        columns: ['Case ID', 'Customer', 'Original Receipt', 'Bounce Reason', { label: 'Exposure', align: 'right' }, 'Case Status'],
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
        mutableCaseIds: filteredRows.map((row) => row.id),
        reversibleCaseIds: filteredRows.filter((row) => row.originalJournalEntryId && !row.hasReversal).map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeBouncedPaymentMutationBody((await request.json()) as Record<string, unknown>)
    await assertBouncedPaymentMutationPayload(payload, body)

    const createdRecord = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildBouncedPaymentPersistenceData(body),
        caseStatus: body.caseStatus || 'awaiting_reversal',
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })) as BouncedPaymentDoc

    return NextResponse.json(await buildBouncedPaymentDetailResponse(payload, createdRecord), { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
