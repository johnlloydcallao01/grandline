import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  buildCashFlowMetrics,
  buildCashFlowReferenceData,
  buildCashFlowRegister,
  matchesCashFlowFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const accountTypes = parseListParam(searchParams, 'accountType')
    const liquidityStates = parseListParam(searchParams, 'liquidityState')
    const reconciliationStates = parseListParam(searchParams, 'reconciliationState')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [{ rows }, referenceData] = await Promise.all([
      buildCashFlowRegister(payload),
      buildCashFlowReferenceData(payload),
    ])

    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesCashFlowFilters(row, {
        accountTypes,
        liquidityStates,
        reconciliationStates,
        quickFilters,
      })
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    return NextResponse.json({
      rows: paginatedRows,
      metrics: buildCashFlowMetrics(filteredRows),
      filterOptions: {
        accountTypes: [
          { label: 'Bank', value: 'bank' },
          { label: 'Cash On Hand', value: 'cash_on_hand' },
        ],
        liquidityStates: [
          { label: 'Healthy', value: 'healthy' },
          { label: 'Watch', value: 'watch' },
          { label: 'Critical', value: 'critical' },
          { label: 'Reserve', value: 'reserve' },
        ],
        reconciliationStates: [
          { label: 'Draft', value: 'draft' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
          { label: 'Locked', value: 'locked' },
          { label: 'With Variance', value: 'with_variance' },
          { label: 'No Session', value: 'no_session' },
          { label: 'Not Applicable', value: 'not_applicable' },
        ],
        quickFilters: [
          { label: 'At Risk', value: 'liquidity:at_risk' },
          { label: 'Healthy', value: 'liquidity:healthy' },
          { label: 'Negative Projection', value: 'projection:negative' },
          { label: 'Positive Net Movement', value: 'projection:positive_net' },
          { label: 'With Reconciliation Variance', value: 'reconciliation:variance' },
          { label: 'Cash On Hand', value: 'accountType:cash_on_hand' },
        ],
      },
      appliedFilters: {
        search,
        accountTypes,
        liquidityStates,
        reconciliationStates,
        quickFilters,
      },
      meta: {
        id: 'cash-flow',
        label: 'Cash Flow',
        description:
          'Monitor current balances, rolling 30-day movement, 7-day projected close, and latest reconciliation posture by liquidity account.',
        searchPlaceholder: 'Search account, bank, account type, liquidity state, or reconciliation posture',
        tableTitle: 'Cash Position By Account',
        tableDescription:
          'Live liquidity view derived from current book balances and rolling posted cash activity across bank and cash accounts.',
        columns: [
          'Account',
          { label: 'Current Balance', align: 'right' },
          { label: '30-Day Inflows', align: 'right' },
          { label: '30-Day Outflows', align: 'right' },
          { label: '7-Day Projected Close', align: 'right' },
          'Risk',
        ],
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
        detailEnabledIds: filteredRows.map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
