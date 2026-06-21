import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, SIMPLE_POSTING_STATUS_OPTIONS } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'
import {
  buildExpensePostingFlags,
  buildExpenseReferenceData,
  buildExpenseRow,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
  type ExpenseCell,
  type ExpenseDoc,
} from '../_shared'

type DocumentLinkDoc = {
  id: number | string
  entityType?: string | null
  entityId?: string | null
  documentCategory?: string | null
  notes?: string | null
}

type PettyCashRow = {
  id: string
  expenseNumber: string
  vendorLabel: string
  expenseCategory: string
  cashAccountId: string
  cashAccountLabel: string
  total: number
  totalLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  taxCodeId: string
  hasLinkedCashAccount: boolean
  hasDocuments: boolean
  documentCount: number
  postedJournalEntryId: string
  searchableText: string
  cells: ExpenseCell[]
}

const matchesQuickFilter = (row: PettyCashRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status') return row.status === value
  if (group === 'coverage' && value === 'with_documents') return row.hasDocuments
  if (group === 'coverage' && value === 'cash_account_linked') return row.hasLinkedCashAccount
  if (group === 'coverage' && value === 'journal_linked') return Boolean(row.postedJournalEntryId)
  return false
}

const matchesSelectedFilters = (
  row: PettyCashRow,
  filters: {
    statuses: string[]
    taxStates: string[]
    coverageStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.taxStates.map((taxState) =>
      taxState === 'with_tax_code' ? Boolean(row.taxCodeId) : taxState === 'without_tax_code' ? !row.taxCodeId : false,
    ),
    ...filters.coverageStates.map((coverageState) =>
      coverageState === 'with_documents'
        ? row.hasDocuments
        : coverageState === 'cash_account_linked'
          ? row.hasLinkedCashAccount
          : coverageState === 'journal_linked'
            ? Boolean(row.postedJournalEntryId)
            : false,
    ),
    ...filters.quickFilters.map((quickFilter) => matchesQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

const buildMetrics = (rows: PettyCashRow[]) => [
  {
    id: 'petty-cash-drafts',
    label: 'Cash-Paid Drafts',
    value: rows.filter((row) => row.status === 'draft').length,
    change: 'Cash expenses still pending posting',
    trend: 'neutral' as const,
  },
  {
    id: 'petty-cash-posted',
    label: 'Cash-Paid Posted',
    value: rows.filter((row) => row.status === 'posted').length,
    change: 'Already reflected in journals',
    trend: 'up' as const,
  },
  {
    id: 'petty-cash-accounts',
    label: 'Cash Accounts',
    value: new Set(rows.map((row) => row.cashAccountId).filter(Boolean)).size,
    change: 'Funding accounts used by petty cash',
    trend: 'up' as const,
  },
  {
    id: 'petty-cash-documents',
    label: 'With Documents',
    value: rows.filter((row) => row.hasDocuments).length,
    change: 'Linked using accounting document links',
    trend: 'neutral' as const,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const taxStates = parseListParam(searchParams, 'taxState')
    const coverageStates = parseListParam(searchParams, 'coverage')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [expenseDocs, documentLinks, referenceData, settings] = await Promise.all([
      findAllDocs<ExpenseDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
        depth: 2,
        sort: '-expenseDate',
      }),
      findAllDocs<DocumentLinkDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
        depth: 0,
        where: {
          entityType: {
            equals: 'expense',
          },
        },
        sort: '-createdAt',
      }),
      buildExpenseReferenceData(payload),
      AccountingCommercialService.getSettings(payload),
    ])

    const cashExpenseDocs = expenseDocs.filter((expense) => buildExpenseRow(expense).isCash)
    const documentLinksByExpenseId = new Map<string, DocumentLinkDoc[]>()
    for (const documentLink of documentLinks) {
      const expenseId = String(documentLink.entityId || '')
      if (!expenseId) continue
      const existing = documentLinksByExpenseId.get(expenseId) || []
      existing.push(documentLink)
      documentLinksByExpenseId.set(expenseId, existing)
    }

    const baseRows = cashExpenseDocs.map((expense) => buildExpenseRow(expense))
    const rows: PettyCashRow[] = baseRows.map((row) => {
      const relatedDocuments = documentLinksByExpenseId.get(row.id) || []
      const documentSummary = relatedDocuments
        .map((documentLink) => [documentLink.documentCategory, documentLink.notes].filter(Boolean).join(' '))
        .filter(Boolean)
        .join(' ')
      const cashAccountLabel = row.bankAccountLabel || row.paymentAccountLabel || '-'

      return {
        id: row.id,
        expenseNumber: row.expenseNumber,
        vendorLabel: row.vendorLabel,
        expenseCategory: row.expenseCategory || '-',
        cashAccountId: row.bankAccountId || row.paymentAccountId || '',
        cashAccountLabel,
        total: row.total,
        totalLabel: row.totalLabel,
        status: row.status,
        statusLabel: row.statusLabel,
        statusTone: row.statusTone,
        taxCodeId: row.taxCodeId,
        hasLinkedCashAccount: Boolean(row.bankAccountId || row.paymentAccountId),
        hasDocuments: relatedDocuments.length > 0,
        documentCount: relatedDocuments.length,
        postedJournalEntryId: row.postedJournalEntryId,
        searchableText: normalizeSearch(
          [
            row.searchableText,
            cashAccountLabel,
            relatedDocuments.map((documentLink) => documentLink.documentCategory).join(' '),
            documentSummary,
          ].join(' '),
        ),
        cells: [
          { text: row.expenseNumber, emphasis: true },
          row.vendorLabel,
          row.expenseCategory || '-',
          cashAccountLabel,
          { text: row.totalLabel, emphasis: true, align: 'right' },
          { text: row.statusLabel, tone: row.statusTone },
        ],
      }
    })

    const filteredReferenceData = {
      ...referenceData,
      bankAccounts: referenceData.bankAccounts.filter((bankAccount) =>
        ['cash_on_hand', 'undeposited_funds'].includes(String(bankAccount.accountType || '')),
      ),
    }
    const flags = buildExpensePostingFlags({
      rows: baseRows,
      taxCodes: filteredReferenceData.taxCodes,
      hasDefaultInputTaxAccount: Boolean(getRelationshipId(settings?.defaultInputTaxAccount)),
    })
    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedFilters(row, {
        statuses,
        taxStates,
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
      metrics: buildMetrics(filteredRows),
      filterOptions: {
        statuses: SIMPLE_POSTING_STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
        taxStates: [
          { label: 'With Tax Code', value: 'with_tax_code' },
          { label: 'Without Tax Code', value: 'without_tax_code' },
        ],
        coverageStates: [
          { label: 'With Documents', value: 'with_documents' },
          { label: 'Cash Account Linked', value: 'cash_account_linked' },
          { label: 'Journal Linked', value: 'journal_linked' },
        ],
        quickFilters: [
          { label: 'Draft', value: 'status:draft' },
          { label: 'Posted', value: 'status:posted' },
          { label: 'With Documents', value: 'coverage:with_documents' },
          { label: 'Cash Account Linked', value: 'coverage:cash_account_linked' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        taxStates,
        coverageStates,
        quickFilters,
      },
      meta: {
        id: 'cash-expenses',
        label: 'Cash Expenses',
        description:
          'Review cash-paid expense activity with fast visibility into vendors, categories, funding accounts, and current posting status.',
        searchPlaceholder: 'Search expense no., vendor, cash account, memo, category, or document note',
        tableTitle: 'Cash Expense Register',
        tableDescription:
          'Cash-funded expense activity organized for daily monitoring, follow-up, and posting review.',
        columns: ['Expense No.', 'Vendor', 'Category', 'Cash Account', { label: 'Amount', align: 'right' }, 'Status'],
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
      referenceData: filteredReferenceData,
      flags,
      summary: {
        totalDocuments: filteredRows.reduce((sum, row) => sum + row.documentCount, 0),
        linkedCashAccounts: filteredRows.filter((row) => row.hasLinkedCashAccount).length,
        journalLinked: filteredRows.filter((row) => Boolean(row.postedJournalEntryId)).length,
      },
      rowMetadata: paginatedRows.map((row) => ({
        id: row.id,
        documentCount: row.documentCount,
        hasDocuments: row.hasDocuments,
        hasLinkedCashAccount: row.hasLinkedCashAccount,
        cashAccountLabel: row.cashAccountLabel,
        journalLinkLabel: row.postedJournalEntryId ? 'Linked' : 'Not Linked',
        taxStateLabel: row.taxCodeId ? 'With Tax Code' : 'Without Tax Code',
        statusLabel: row.statusLabel,
      })),
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
