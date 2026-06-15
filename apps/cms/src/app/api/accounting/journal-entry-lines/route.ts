import { NextRequest, NextResponse } from 'next/server'
import { AccountingJournalEntryLinesRegisterService } from '@/accounting/services/journals/AccountingJournalEntryLinesRegisterService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] => {
  return Array.from(new Set(
    searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean),
  ))
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const result = await AccountingJournalEntryLinesRegisterService.getJournalEntryLinesRegister(payload, {
      search: searchParams.get('search') || '',
      hasTaxCode: searchParams.get('hasTaxCode') === 'true',
      hasReference: searchParams.get('hasReference') === 'true',
      lineTypes: parseListParam(searchParams, 'lineType'),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'journal-entry-detail',
        label: 'Journal Entry Detail',
        description: 'Inspect journal line detail with accounts, descriptions, debit and credit values, tax codes, and reference entities.',
        searchPlaceholder: 'Search entry no., account, line description, tax code, or reference entity',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Journal Line Detail Register',
          description: 'Line-level detail for journal entries showing account coding, amounts, tax links, and source references.',
          columns: ['Entry No.', 'Line', 'Account', 'Description', 'Debit', 'Credit', 'Tax Code', 'Reference'],
          rows: result.rows.map((row) => ({
            id: row.id,
            journalEntryId: row.journalEntryId,
            entryNumber: row.entryNumber,
            entryDate: row.entryDate,
            lineNumber: row.lineNumber,
            accountId: row.accountId,
            accountCode: row.accountCode,
            accountName: row.accountName,
            description: row.description,
            debit: row.debit,
            credit: row.credit,
            taxCodeId: row.taxCodeId,
            taxCode: row.taxCode,
            referenceEntityType: row.referenceEntityType,
            referenceEntityId: row.referenceEntityId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: row.cells,
          })),
        },
      },
      appliedFilters: result.appliedFilters,
      pagination: result.pagination,
      totals: result.totals,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    const record = await payload.create({
      collection: 'accounting-journal-entry-lines',
      overrideAccess: true,
      data: { ...body, createdBy: user.id, updatedBy: user.id },
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
