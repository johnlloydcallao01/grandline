import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS, ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildExpenseApprovalMetrics,
  buildExpenseApprovalReferenceData,
  buildExpenseApprovalRow,
  buildExpenseLookup,
  getExpenseIdsFromApprovalRequests,
  matchesSelectedExpenseApprovalFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type ExpenseApprovalRequestDoc,
  type ExpenseDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const workflowIds = parseListParam(searchParams, 'workflowId')
    const coverageStates = parseListParam(searchParams, 'coverage')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [requestRecords, referenceData] = await Promise.all([
      findAllDocs<ExpenseApprovalRequestDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
        depth: 2,
        where: {
          entityType: {
            equals: 'expense',
          },
        },
        sort: '-requestedAt',
      }),
      buildExpenseApprovalReferenceData(payload),
    ])

    const expenseIds = getExpenseIdsFromApprovalRequests(requestRecords)
    const numericExpenseIds = expenseIds
      .map((expenseId) => Number(expenseId))
      .filter((expenseId) => Number.isFinite(expenseId) && expenseId > 0)

    const linkedExpenses =
      numericExpenseIds.length > 0
        ? await findAllDocs<ExpenseDoc>({
            payload,
            collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
            depth: 2,
            where: {
              id: {
                in: numericExpenseIds,
              },
            },
            sort: '-updatedAt',
          })
        : []

    const expenseLookup = buildExpenseLookup(linkedExpenses)
    const rows = requestRecords.map((requestRecord) =>
      buildExpenseApprovalRow({
        request: requestRecord,
        expense: expenseLookup.get(String(requestRecord.entityId || '')),
      }),
    )
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedExpenseApprovalFilters(row, {
        statuses,
        workflowIds,
        coverageStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildExpenseApprovalMetrics(filteredRows),
      filterOptions: {
        statuses: ACCOUNTING_APPROVAL_REQUEST_STATUS_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
        })),
        workflows: referenceData.workflows.map((workflow) => ({
          label: workflow.label,
          value: workflow.id,
        })),
        coverageStates: [
          { label: 'Assigned', value: 'assigned' },
          { label: 'With Notes', value: 'with_notes' },
          { label: 'With Trail', value: 'with_trail' },
        ],
        quickFilters: [
          { label: 'Pending', value: 'status:pending' },
          { label: 'Approved', value: 'status:approved' },
          { label: 'Rejected', value: 'status:rejected' },
          { label: 'Assigned', value: 'coverage:assigned' },
          { label: 'With Notes', value: 'coverage:with_notes' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        workflowIds,
        coverageStates,
        quickFilters,
      },
      meta: {
        id: 'approval-requests',
        label: 'Approval Requests',
        description:
          'Review approval activity tied to expense records and keep the queue moving with clear ownership and decision history.',
        searchPlaceholder: 'Search request id, expense no., workflow, approver, requester, status, or notes',
        tableTitle: 'Approval Request Queue',
        tableDescription:
          'Expense-scoped approval register showing workflow, current approver, timing, and request status.',
        columns: ['Request', 'Expense', 'Workflow', 'Current Approver', 'Requested At', 'Status'],
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
        pendingRequestIds: rows.filter((row) => row.status === 'pending').map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
