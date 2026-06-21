import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertStatementImportMutationPayload,
  buildStatementImportDetailResponse,
  buildStatementImportMetrics,
  buildStatementImportPersistenceData,
  buildStatementImportReferenceData,
  buildStatementImportRow,
  matchesStatementImportFilters,
  normalizeSearch,
  normalizeStatementImportMutationBody,
  parseIntegerParam,
  parseListParam,
  type StatementImportDoc,
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

    const [statementImports, referenceData] = await Promise.all([
      findAllDocs<StatementImportDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports,
        depth: 2,
        sort: '-createdAt',
      }),
      buildStatementImportReferenceData(payload),
    ])

    const rows = statementImports.map((statementImport) => buildStatementImportRow(statementImport))
    const normalizedSearch = normalizeSearch(search)

    const filteredRows = rows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      return matchesStatementImportFilters(row, {
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
      metrics: buildStatementImportMetrics(filteredRows),
      filterOptions: {
        statuses: referenceData.importStatuses,
        bankAccounts: referenceData.bankAccounts
          .filter((bankAccount) => bankAccount.isActive)
          .map((bankAccount) => ({
            label: `${bankAccount.accountName || bankAccount.bankName || 'Unnamed bank account'}${bankAccount.accountNumberMasked ? ` (${bankAccount.accountNumberMasked})` : ''}`,
            value: String(bankAccount.id),
          })),
        coverageStates: [
          { label: 'With Errors', value: 'with_errors' },
          { label: 'With Imported Transactions', value: 'with_imported_transactions' },
          { label: 'Needs Follow-up', value: 'requires_follow_up' },
        ],
        quickFilters: [
          { label: 'Queued', value: 'status:queued' },
          { label: 'Imported', value: 'status:imported' },
          { label: 'Parse Errors', value: 'status:parse_error' },
          { label: 'Requires Re-upload', value: 'status:reupload_required' },
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
        id: 'statement-imports',
        label: 'Statement Imports',
        description:
          'Manage uploaded bank statement batches, import outcomes, line counts, and follow-up actions.',
        searchPlaceholder: 'Search by filename, bank account, uploader, batch number, or notes',
        tableTitle: 'Statement Import Batches',
        tableDescription:
          'Track each uploaded bank statement file, the recorded import result, and finance follow-up status.',
        columns: ['Uploaded', 'Filename', 'Bank Account', 'Lines', 'Uploaded By', 'Import Status'],
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
        retryableImportIds: filteredRows.filter((row) => ['parse_error', 'reupload_required'].includes(row.importStatus)).map((row) => row.id),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeStatementImportMutationBody((await request.json()) as Record<string, unknown>)
    await assertStatementImportMutationPayload(payload, body)

    const createdRecord = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildStatementImportPersistenceData(body),
        importStatus: body.importStatus || 'queued',
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
    })) as StatementImportDoc

    return NextResponse.json(await buildStatementImportDetailResponse(payload, createdRecord), {
      status: 201,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
