import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertBankTransactionMutationPayload,
  buildBankTransactionDetailResponse,
  buildBankTransactionMetrics,
  buildBankTransactionPersistenceData,
  buildBankTransactionReferenceData,
  buildBankTransactionRow,
  matchesBankTransactionFilters,
  normalizeBankTransactionMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type BankTransactionDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const directions = parseListParam(searchParams, 'direction')
    const coverageStates = parseListParam(searchParams, 'coverage')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [transactions, referenceData] = await Promise.all([
      findAllDocs<BankTransactionDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
        depth: 1,
        sort: '-transactionDate',
      }),
      buildBankTransactionReferenceData(payload),
    ])

    const rows = transactions.map((transaction) => buildBankTransactionRow(transaction))
    const normalizedSearch = normalizeSearch(search)

    const filteredRows = rows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      return matchesBankTransactionFilters(row, {
        statuses,
        directions,
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
      metrics: buildBankTransactionMetrics(filteredRows),
      filterOptions: {
        statuses: [
          { label: 'Unmatched', value: 'unmatched' },
          { label: 'Suggested', value: 'suggested' },
          { label: 'Matched', value: 'matched' },
          { label: 'Ignored', value: 'ignored' },
        ],
        directions: [
          { label: 'Incoming', value: 'incoming' },
          { label: 'Outgoing', value: 'outgoing' },
          { label: 'Mixed', value: 'mixed' },
        ],
        coverageStates: [
          { label: 'Entity Linked', value: 'entity_linked' },
          { label: 'With Value Date', value: 'with_value_date' },
          { label: 'With Running Balance', value: 'with_running_balance' },
        ],
        quickFilters: [
          { label: 'Open Items', value: 'status:unmatched' },
          { label: 'Suggested', value: 'status:suggested' },
          { label: 'Matched', value: 'status:matched' },
          { label: 'Outgoing', value: 'direction:outgoing' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        directions,
        coverageStates,
        quickFilters,
      },
      meta: {
        id: 'bank-transactions',
        label: 'Bank Transactions',
        description:
          'Review bank transaction intake and matching status across imported and manually entered records.',
        searchPlaceholder: 'Search by date, reference, description, amount, bank account, or match reference',
        tableTitle: 'Incoming Transaction Queue',
        tableDescription:
          'Operational queue for bank transactions waiting to be matched, reviewed, or maintained.',
        columns: [
          'Date',
          'Bank Account',
          'Reference',
          'Counterparty',
          { label: 'Amount', align: 'right' },
          'Status',
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
        mutableTransactionIds: filteredRows
          .filter((row) => !(row.matchStatus === 'matched' && row.hasMatchLink))
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
    const body = normalizeBankTransactionMutationBody((await request.json()) as Record<string, unknown>)
    await assertBankTransactionMutationPayload(payload, body)

    const createdRecord = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
      overrideAccess: true,
      depth: 1,
      data: {
        ...buildBankTransactionPersistenceData(body),
        matchStatus: body.matchStatus || 'unmatched',
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })) as BankTransactionDoc

    return NextResponse.json(await buildBankTransactionDetailResponse(payload, createdRecord), {
      status: 201,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
