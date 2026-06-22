import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, BANK_RECONCILIATION_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertReconciliationMutationPayload,
  buildReconciliationDetailResponse,
  buildReconciliationMetrics,
  buildReconciliationPersistenceData,
  buildReconciliationReferenceData,
  buildReconciliationRow,
  matchesReconciliationFilters,
  normalizeReconciliationMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  refreshReconciliationComputedFields,
  type ReconciliationDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const bankAccountIds = parseListParam(searchParams, 'bankAccountId')
    const differenceStates = parseListParam(searchParams, 'difference')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [reconciliations, referenceData] = await Promise.all([
      findAllDocs<ReconciliationDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
        depth: 2,
        sort: '-statementEndDate',
      }),
      buildReconciliationReferenceData(payload),
    ])

    const rows = reconciliations.map((reconciliation) => buildReconciliationRow(reconciliation))
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesReconciliationFilters(row, {
        statuses,
        bankAccountIds,
        differenceStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildReconciliationMetrics(filteredRows),
      filterOptions: {
        statuses: BANK_RECONCILIATION_STATUS_OPTIONS.map((option) => ({
          label: option.label,
          value: String(option.value),
        })),
        bankAccounts: referenceData.bankAccounts.map((bankAccount) => ({
          label: `${bankAccount.accountName || bankAccount.bankName || `Bank ${bankAccount.id}`}${bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''}`,
          value: String(bankAccount.id),
        })),
        differenceStates: [
          { label: 'Zero Difference', value: 'zero_difference' },
          { label: 'With Variance', value: 'variance' },
        ],
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'In Progress', value: 'status:in_progress' },
          { label: 'Completed', value: 'status:completed' },
          { label: 'Locked', value: 'status:locked' },
          { label: 'With Variance', value: 'difference:variance' },
          { label: 'Zero Difference', value: 'difference:zero' },
          { label: 'Active Sessions', value: 'workflow:active' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        bankAccountIds,
        differenceStates,
        quickFilters,
      },
      meta: {
        id: 'reconciliations',
        label: 'Reconciliations',
        description:
          'Track reconciliation progress from draft through completion using live bank-account, statement-period, and variance data.',
        searchPlaceholder: 'Search statement period, bank account, preparer, status, or reconciliation session',
        tableTitle: 'Reconciliation Sessions',
        tableDescription:
          'Operational view of reconciliation sessions, statement periods, preparers, and current variance by bank account.',
        columns: ['Session', 'Bank Account', 'Statement Period', 'Prepared By', { label: 'Variance', align: 'right' }, 'Status'],
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
        mutableReconciliationIds: filteredRows
          .filter((row) => !row.isCompleted && !row.isLocked)
          .map((row) => row.id),
        completableReconciliationIds: filteredRows
          .filter((row) => !row.isCompleted && !row.isLocked && row.zeroDifference)
          .map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeReconciliationMutationBody((await request.json()) as Record<string, unknown>)
    await assertReconciliationMutationPayload(payload, body)

    const createdRecord = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildReconciliationPersistenceData(body),
        status: body.status || 'draft',
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })) as ReconciliationDoc

    const refreshedRecord = await refreshReconciliationComputedFields(payload, createdRecord.id)
    return NextResponse.json(await buildReconciliationDetailResponse(payload, refreshedRecord), {
      status: 201,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
