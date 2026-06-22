import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, SIMPLE_POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertDepositMutationPayload,
  buildDepositDetailResponse,
  buildDepositMetrics,
  buildDepositPersistenceData,
  buildDepositReferenceData,
  buildDepositRow,
  matchesDepositFilters,
  normalizeDepositMutationBody,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type DepositDoc,
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

    const [deposits, referenceData] = await Promise.all([
      findAllDocs<DepositDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
        depth: 2,
        sort: '-depositDate',
      }),
      buildDepositReferenceData(payload),
    ])

    const rows = deposits.map((deposit) => buildDepositRow(deposit))
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesDepositFilters(row, {
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
      metrics: buildDepositMetrics(filteredRows),
      filterOptions: {
        statuses: SIMPLE_POSTING_STATUS_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })),
        bankAccounts: referenceData.bankAccounts.map((bankAccount) => ({
          label: `${bankAccount.accountName || bankAccount.bankName || `Bank ${bankAccount.id}`}${bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''}`,
          value: String(bankAccount.id),
        })),
        coverageStates: [
          { label: 'Journal Linked', value: 'with_journal' },
          { label: 'Without Journal', value: 'without_journal' },
          { label: 'With Notes', value: 'with_notes' },
          { label: 'Prepared Today', value: 'today' },
        ],
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'Journal Linked', value: 'coverage:with_journal' },
          { label: 'With Notes', value: 'coverage:with_notes' },
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
        id: 'deposits',
        label: 'Deposits',
        description: 'Track deposit drafts, posted batches, journal linkage, and source-account coverage using live deposit records.',
        searchPlaceholder: 'Search deposit batch, bank account, source account, note, or prepared by',
        tableTitle: 'Deposit Register',
        tableDescription: 'Live register of deposit records, their destination bank account, source clearing account, and posting progress.',
        columns: ['Batch No.', 'Deposit Date', 'Bank Account', 'Source Account', { label: 'Batch Amount', align: 'right' }, 'Status'],
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
        mutableDepositIds: filteredRows.filter((row) => row.isDraft).map((row) => row.id),
        postableDepositIds: filteredRows.filter((row) => row.isDraft && row.amount > 0 && row.bankAccountId && row.sourceAccountId).map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeDepositMutationBody((await request.json()) as Record<string, unknown>)
    await assertDepositMutationPayload(payload, body)

    const createdRecord = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildDepositPersistenceData(body),
        status: 'draft',
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })) as DepositDoc

    return NextResponse.json(await buildDepositDetailResponse(payload, createdRecord), { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
