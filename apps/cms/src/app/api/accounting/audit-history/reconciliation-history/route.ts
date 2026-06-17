import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_RECONCILIATION_STATUS_OPTIONS,
} from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { buildUserDisplayName } from '@/accounting/utils/lms'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

type HistoryCell =
  | string
  | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type ReconciliationDoc = {
  id: number | string
  bankAccount?: {
    id?: number | string
    accountName?: string | null
    bankName?: string | null
  } | number | string | null
  statementStartDate?: string | null
  statementEndDate?: string | null
  statementClosingBalance?: number | null
  bookClosingBalance?: number | null
  differenceAmount?: number | null
  status?: string | null
  completedAt?: string | null
  completedBy?: Record<string, unknown> | number | string | null
  notes?: string | null
}

type ReconciliationHistoryRow = {
  id: string
  sourceId: string
  sessionLabel: string
  bankAccountId: string
  bankAccountLabel: string
  statementStartDate: string | null
  statementStartLabel: string
  statementEndDate: string | null
  statementEndLabel: string
  statementClosingBalance: number
  bookClosingBalance: number
  differenceAmount: number
  differenceLabel: string
  status: string
  statusLabel: string
  statusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  completedAt: string | null
  completedAtLabel: string
  completedBy: string
  notes: string
  cells: HistoryCell[]
  searchableText: string
}

const statusLabels = new Map<string, string>(BANK_RECONCILIATION_STATUS_OPTIONS.map((option) => [option.value, option.label]))

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )

const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

const buildSearchableText = (parts: Array<unknown>) =>
  parts
    .map((part) => normalizeSearch(part))
    .filter(Boolean)
    .join(' ')

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const getRelationshipLabel = (user: Record<string, unknown> | number | string | null | undefined) => {
  if (!user) return '-'
  if (typeof user === 'number' || typeof user === 'string') return String(user)
  return buildUserDisplayName(user)
}

const getStatusTone = (status: string | null | undefined): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  switch (String(status || '')) {
    case 'completed':
    case 'locked':
      return 'green'
    case 'in_progress':
      return 'blue'
    default:
      return 'amber'
  }
}

const parseQuickFilterGroups = (quickFilters: string[]) => {
  const groups = {
    status: new Set<string>(),
    difference: new Set<string>(),
  }

  for (const quickFilter of quickFilters) {
    const [group, value] = quickFilter.split(':')
    if (group === 'status' && value) groups.status.add(value)
    if (group === 'difference' && value) groups.difference.add(value)
  }

  return groups
}

const getBankAccountLabel = (bankAccount: ReconciliationDoc['bankAccount']) => {
  if (!bankAccount) return 'Unassigned Bank Account'
  if (typeof bankAccount === 'number' || typeof bankAccount === 'string') return String(bankAccount)
  return String(bankAccount.accountName || bankAccount.bankName || `Bank Account ${bankAccount.id || ''}`).trim()
}

const getBankAccountId = (bankAccount: ReconciliationDoc['bankAccount']) => {
  if (!bankAccount) return 'unassigned'
  if (typeof bankAccount === 'number' || typeof bankAccount === 'string') return String(bankAccount)
  return String(bankAccount.id || 'unassigned')
}

const mapRow = (doc: ReconciliationDoc): ReconciliationHistoryRow => {
  const sessionLabel = `RECON-${doc.id}`
  const bankAccountLabel = getBankAccountLabel(doc.bankAccount)
  const bankAccountId = getBankAccountId(doc.bankAccount)
  const status = String(doc.status || '')
  const statusLabel = statusLabels.get(status) || 'Unknown'
  const completedBy = getRelationshipLabel(doc.completedBy)
  const differenceAmount = Number(doc.differenceAmount || 0)

  return {
    id: `reconciliation-${doc.id}`,
    sourceId: String(doc.id),
    sessionLabel,
    bankAccountId,
    bankAccountLabel,
    statementStartDate: doc.statementStartDate || null,
    statementStartLabel: formatDate(doc.statementStartDate),
    statementEndDate: doc.statementEndDate || null,
    statementEndLabel: formatDate(doc.statementEndDate),
    statementClosingBalance: Number(doc.statementClosingBalance || 0),
    bookClosingBalance: Number(doc.bookClosingBalance || 0),
    differenceAmount,
    differenceLabel: formatCurrency(differenceAmount),
    status,
    statusLabel,
    statusTone: getStatusTone(status),
    completedAt: doc.completedAt || null,
    completedAtLabel: formatDateTime(doc.completedAt),
    completedBy,
    notes: String(doc.notes || ''),
    cells: [
      { text: sessionLabel, emphasis: true },
      bankAccountLabel,
      formatDate(doc.statementEndDate),
      { text: formatCurrency(differenceAmount), emphasis: true, align: 'right' },
      { text: statusLabel, tone: getStatusTone(status) },
      completedBy,
    ],
    searchableText: buildSearchableText([
      sessionLabel,
      bankAccountLabel,
      formatDate(doc.statementStartDate),
      formatDate(doc.statementEndDate),
      statusLabel,
      completedBy,
      formatCurrency(differenceAmount),
      doc.notes,
    ]),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const bankAccountIds = parseListParam(searchParams, 'bankAccountId')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const reconciliations = await findAllDocs<ReconciliationDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      depth: 1,
      sort: '-statementEndDate',
    })

    const allRows = reconciliations.map(mapRow)
    const normalizedSearch = normalizeSearch(search)
    const quickFilterGroups = parseQuickFilterGroups(quickFilters)

    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      if (statuses.length > 0 && !statuses.includes(row.status)) return false
      if (bankAccountIds.length > 0 && !bankAccountIds.includes(row.bankAccountId)) return false
      if (quickFilterGroups.status.size > 0 && !quickFilterGroups.status.has(row.status)) return false
      if (quickFilterGroups.difference.size > 0) {
        const differenceState = row.differenceAmount === 0 ? 'zero' : 'non_zero'
        if (!quickFilterGroups.difference.has(differenceState)) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const completedSessions = filteredRows.filter((row) => row.status === 'completed').length
    const lockedSessions = filteredRows.filter((row) => row.status === 'locked').length
    const openSessions = filteredRows.filter((row) => ['draft', 'in_progress'].includes(row.status)).length
    const differenceTotal = filteredRows.reduce((sum, row) => sum + Math.abs(row.differenceAmount), 0)

    const bankAccountOptions = Array.from(
      new Map(
        allRows
          .map((row) => [row.bankAccountId, { label: row.bankAccountLabel, value: row.bankAccountId }] as const)
          .sort((left, right) => left[1].label.localeCompare(right[1].label)),
      ).values(),
    )

    return NextResponse.json({
      section: {
        id: 'reconciliation-history',
        label: 'Reconciliation History',
        description:
          'Track bank reconciliation sessions with statement balances, book balances, differences, status, and completion fields.',
        searchPlaceholder: 'Search bank account, statement end date, status, completed by, or difference',
        filters: {
          statuses: BANK_RECONCILIATION_STATUS_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
          })),
          bankAccounts: bankAccountOptions,
          quickFilters: [
            { label: 'Completed', value: 'status:completed' },
            { label: 'Locked', value: 'status:locked' },
            { label: 'In Progress', value: 'status:in_progress' },
            { label: 'Variance Items', value: 'difference:non_zero' },
          ],
        },
        metrics: [
          {
            id: 'completed-sessions',
            label: 'Completed Sessions',
            value: completedSessions,
            change: 'Reconciliations marked complete in the filtered view',
            trend: 'up',
          },
          {
            id: 'locked-sessions',
            label: 'Locked Sessions',
            value: lockedSessions,
            change: 'Protected reconciliation history',
            trend: 'up',
          },
          {
            id: 'open-sessions',
            label: 'Open Sessions',
            value: openSessions,
            change: 'Still in draft or in-progress state',
            trend: 'neutral',
          },
          {
            id: 'difference-items',
            label: 'Difference Items',
            value: formatCurrency(differenceTotal),
            change: 'Outstanding absolute variance across filtered sessions',
            trend: differenceTotal > 0 ? 'down' : 'neutral',
          },
        ],
        table: {
          title: 'Bank Reconciliation History',
          description:
            'Reconciliation history using statement dates, closing balances, difference amounts, and completion records.',
          columns: ['Session', 'Bank Account', 'Statement End', 'Difference', 'Status', 'Completed By'],
          rows: paginatedRows.map(({ searchableText: _searchableText, ...row }) => row),
        },
      },
      appliedFilters: {
        search,
        statuses,
        bankAccountIds,
        quickFilters,
      },
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
      totals: {
        totalRows: allRows.length,
        filteredRows: totalDocs,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
