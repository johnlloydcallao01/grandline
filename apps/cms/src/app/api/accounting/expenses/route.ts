import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, EXPENSE_PAYMENT_METHOD_OPTIONS, SIMPLE_POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import {
  assertExpenseMutationPayload,
  buildExpenseDetailResponse,
  buildExpenseMetrics,
  buildExpensePostingFlags,
  buildExpensePersistenceData,
  buildExpenseReferenceData,
  buildExpenseRow,
  buildExpenseTotals,
  matchesSelectedExpenseFilters,
  normalizeExpenseMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type ExpenseDoc,
} from './_shared'
import { AccountingExpenseService } from '@/accounting/services/expenses/AccountingExpenseService'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const paymentMethods = parseListParam(searchParams, 'paymentMethod')
    const taxStates = parseListParam(searchParams, 'taxState')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [records, referenceData, settings] = await Promise.all([
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
        depth: 2,
        sort: '-expenseDate',
        limit: 500,
        overrideAccess: true,
      }),
      buildExpenseReferenceData(payload),
      AccountingCommercialService.getSettings(payload),
    ])

    const rows = records.docs.map((record) => buildExpenseRow(record as unknown as ExpenseDoc))
    const hasDefaultInputTaxAccount = Boolean(getRelationshipId(settings?.defaultInputTaxAccount))
    const flags = buildExpensePostingFlags({
      rows,
      taxCodes: referenceData.taxCodes,
      hasDefaultInputTaxAccount,
    })
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedExpenseFilters(row, {
        statuses,
        paymentMethods,
        taxStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildExpenseMetrics(filteredRows),
      filterOptions: {
        statuses: SIMPLE_POSTING_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
        paymentMethods: EXPENSE_PAYMENT_METHOD_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
        })),
        taxStates: [
          { label: 'With Tax Code', value: 'with_tax_code' },
          { label: 'Without Tax Code', value: 'without_tax_code' },
        ],
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'Cash', value: 'payment:cash' },
          { label: 'With Tax Code', value: 'tax:with_code' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        paymentMethods,
        taxStates,
        quickFilters,
      },
      meta: {
        id: 'expenses',
        label: 'Expenses',
        description:
          'Manage direct expense records from initial entry through posting with clear register visibility and document follow-up.',
        searchPlaceholder: 'Search expense no., vendor, memo, category, or payment method',
        tableTitle: 'Expense Register',
        tableDescription:
          'Live operating list of direct expense records prioritized for review, posting, and documentation follow-up.',
        columns: ['Expense No.', 'Date', 'Vendor', 'Category', { label: 'Amount', align: 'right' }, 'Status'],
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
      flags,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeExpenseMutationBody((await request.json()) as Record<string, unknown>)
    await assertExpenseMutationPayload(payload, body)
    const totals = await buildExpenseTotals(payload, body)
    const persistenceData = buildExpensePersistenceData(body)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      depth: 2,
      overrideAccess: true,
      data: {
        ...persistenceData,
        status: 'draft',
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })

    const result = body.autoPost
      ? await AccountingExpenseService.postExpense({
        payload,
        expenseId: record.id,
        userId: user.id,
      })
      : record

    return NextResponse.json(await buildExpenseDetailResponse(payload, result as unknown as ExpenseDoc), {
      status: 201,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
