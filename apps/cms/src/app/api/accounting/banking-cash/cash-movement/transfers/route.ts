import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, SIMPLE_POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertTransferMutationPayload,
  buildTransferDetailResponse,
  buildTransferMetrics,
  buildTransferPersistenceData,
  buildTransferReferenceData,
  buildTransferRow,
  matchesTransferFilters,
  normalizeSearch,
  normalizeTransferMutationBody,
  parseIntegerParam,
  parseListParam,
  type TransferDoc,
} from './_shared'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const bankAccounts = parseListParam(searchParams, 'bankAccount')
    const coverageStates = parseListParam(searchParams, 'coverage')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [transfers, referenceData] = await Promise.all([
      findAllDocs<TransferDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
        depth: 2,
        sort: '-transferDate',
      }),
      buildTransferReferenceData(payload),
    ])

    const rows = transfers.map((transfer) => buildTransferRow(transfer))
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesTransferFilters(row, {
        statuses,
        bankAccounts,
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
      metrics: buildTransferMetrics(filteredRows),
      filterOptions: {
        statuses: SIMPLE_POSTING_STATUS_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })),
        bankAccounts: referenceData.bankAccounts.map((bankAccount) => ({
          label: `${bankAccount.accountName || bankAccount.bankName || `Account ${bankAccount.id}`}${bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''}`,
          value: String(bankAccount.id),
        })),
        coverageStates: [
          { label: 'Undeposited Funds', value: 'undeposited' },
          { label: 'Bank to Bank', value: 'bank_to_bank' },
          { label: 'Journal Linked', value: 'with_journal' },
          { label: 'Without Journal', value: 'without_journal' },
          { label: 'Prepared Today', value: 'today' },
        ],
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'Undeposited Funds', value: 'coverage:undeposited' },
          { label: 'Bank to Bank', value: 'coverage:bank_to_bank' },
          { label: 'Journal Linked', value: 'coverage:with_journal' },
          { label: 'Prepared Today', value: 'timing:today' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        bankAccounts,
        coverageStates,
        quickFilters,
      },
      meta: {
        id: 'transfers-undeposited',
        label: 'Transfers & Undeposited Funds',
        description: 'Review internal transfers and movements that involve undeposited-funds accounts using live transfer records.',
        searchPlaceholder: 'Search transfer no., from account, to account, note, or prepared by',
        tableTitle: 'Transfer Register',
        tableDescription: 'Live register of cash transfers, including moves that clear undeposited funds into destination bank or cash accounts.',
        columns: ['Transfer No.', 'Transfer Date', 'From Account', 'To Account', { label: 'Transfer Amount', align: 'right' }, 'Status'],
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
        mutableTransferIds: filteredRows.filter((row) => row.isDraft).map((row) => row.id),
        postableTransferIds: filteredRows.filter((row) => row.isDraft && row.amount > 0 && row.fromBankAccountId && row.toBankAccountId).map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeTransferMutationBody((await request.json()) as Record<string, unknown>)
    await assertTransferMutationPayload(payload, body)

    const createdRecord = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildTransferPersistenceData(body),
        status: 'draft',
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })) as TransferDoc

    return NextResponse.json(await buildTransferDetailResponse(payload, createdRecord), { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
