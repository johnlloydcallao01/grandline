import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, JOURNAL_SOURCE_TYPE_OPTIONS, JOURNAL_STATUS_OPTIONS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type UserRef = { id: number | string } | number | string | null

type SourceTypeDoc = {
  id: number | string
  entryNumber?: string | null
  entryDate?: string | null
  postingDate?: string | null
  sourceType?: string | null
  sourceReference?: string | null
  memo?: string | null
  referenceNumber?: string | null
  status?: string | null
  totalDebit?: number | null
  totalCredit?: number | null
  createdBy?: UserRef
  updatedBy?: UserRef
  createdAt?: string | null
  updatedAt?: string | null
}

export type SourceTypesRegisterQuery = {
  search?: string
  sourceTypes?: string[]
  statuses?: string[]
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type SourceTypesRegisterRow = {
  id: number | string
  entryNumber: string | null
  entryDate: string | null
  postingDate: string | null
  sourceType: string | null
  sourceTypeLabel: string | null
  sourceReference: string | null
  memo: string | null
  referenceNumber: string | null
  status: string | null
  statusLabel: string | null
  totalDebit: number | null
  totalCredit: number | null
  createdBy: string | null
  updatedBy: string | null
  createdAt: string | null
  updatedAt: string | null
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

type RegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type RegisterFilterOptions = {
  sourceTypes: Array<{ label: string; value: string }>
  statuses: Array<{ label: string; value: string }>
  quickFilters: Array<{ label: string; value: string }>
}

type RegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type SourceTypesRegisterResult = {
  rows: SourceTypesRegisterRow[]
  metrics: RegisterMetric[]
  filterOptions: RegisterFilterOptions
  appliedFilters: { search: string; sourceTypes: string[]; statuses: string[]; quickFilters: string[] }
  pagination: RegisterPagination
  totals: { totalEntries: number; filteredEntries: number; manualCount: number; openingBalanceCount: number; adjustmentCount: number; reversalCount: number; systemCount: number; draftCount: number; postedCount: number }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const statusLabelMap = new Map<string, string>(
  JOURNAL_STATUS_OPTIONS.map((o) => [o.value, o.label]),
)
const sourceTypeLabelMap = new Map<string, string>(
  JOURNAL_SOURCE_TYPE_OPTIONS.map((o) => [o.value, o.label]),
)

const normalizeText = (value?: string | null) => String(value || '').trim()
const normalizeSearch = (value?: string | null) => normalizeText(value).toLowerCase()

const sanitizePage = (page?: number) => {
  if (!Number.isFinite(page)) return 1
  return Math.max(1, Math.trunc(page || 1))
}

const sanitizeLimit = (limit?: number) => {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT
  return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit || DEFAULT_LIMIT)))
}

const resolveUser = (user: UserRef | undefined): string | null => {
  if (typeof user === 'object' && user !== null) {
    const u = user as Record<string, unknown>
    const firstName = typeof u.firstName === 'string' ? u.firstName.trim() : ''
    const lastName = typeof u.lastName === 'string' ? u.lastName.trim() : ''
    const middleName = typeof u.middleName === 'string' ? u.middleName.trim() : ''
    const parts = [firstName, middleName, lastName].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : String(u.id)
  }
  return user ? String(user) : null
}

const mapSourceTypeRow = (doc: SourceTypeDoc): SourceTypesRegisterRow => {
  const status = doc.status || null
  const statusLabel = status ? statusLabelMap.get(status) || status : null
  const sourceType = doc.sourceType || null
  const sourceTypeLabel = sourceType ? sourceTypeLabelMap.get(sourceType) || sourceType : null
  return {
    id: doc.id,
    entryNumber: doc.entryNumber || null,
    entryDate: doc.entryDate || null,
    postingDate: doc.postingDate || null,
    sourceType,
    sourceTypeLabel,
    sourceReference: doc.sourceReference || null,
    memo: doc.memo || null,
    referenceNumber: doc.referenceNumber || null,
    status,
    statusLabel,
    totalDebit: doc.totalDebit ?? null,
    totalCredit: doc.totalCredit ?? null,
    createdBy: resolveUser(doc.createdBy),
    updatedBy: resolveUser(doc.updatedBy),
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
    cells: [
      { text: doc.entryNumber || '-', emphasis: true },
      sourceTypeLabel || '-',
      doc.sourceReference || '-',
      doc.postingDate ? new Date(doc.postingDate).toLocaleDateString() : '-',
      resolveUser(doc.createdBy) || '-',
      {
        text: statusLabel || '-',
        tone: status === 'draft' ? 'amber' as const : status === 'posted' ? 'green' as const : 'gray' as const,
      },
    ],
  }
}

const matchesSearch = (row: SourceTypesRegisterRow, search: string) => {
  if (!search) return true
  return [row.entryNumber, row.sourceTypeLabel, row.sourceReference, row.memo, row.statusLabel, row.createdBy]
    .some((v) => normalizeSearch(v).includes(search))
}

const matchesSourceTypes = (row: SourceTypesRegisterRow, sourceTypes: string[]) => {
  if (!sourceTypes.length) return true
  return Boolean(row.sourceType && sourceTypes.includes(row.sourceType))
}

const matchesStatuses = (row: SourceTypesRegisterRow, statuses: string[]) => {
  if (!statuses.length) return true
  return Boolean(row.status && statuses.includes(row.status))
}

const sortEntries = (docs: SourceTypeDoc[]) =>
  [...docs].sort((a, b) => {
    const stA = a.sourceType || ''
    const stB = b.sourceType || ''
    const stCmp = stA.localeCompare(stB)
    if (stCmp !== 0) return stCmp
    return String(b.entryDate || '').localeCompare(String(a.entryDate || ''))
  })

const buildMetrics = (rows: SourceTypesRegisterRow[]): RegisterMetric[] => {
  const manual = rows.filter((r) => r.sourceType === 'manual').length
  const ob = rows.filter((r) => r.sourceType === 'opening_balance').length
  const adj = rows.filter((r) => r.sourceType === 'adjustment').length
  const sys = rows.filter((r) => r.sourceType === 'system').length
  return [
    { id: 'manual-entries', label: 'Manual Entries', value: manual, change: 'User-created journal headers', trend: manual > 0 ? 'up' as const : 'neutral' as const },
    { id: 'opening-balance-entries', label: 'Opening Balance Entries', value: ob, change: 'Entries flagged as opening balance source type', trend: ob > 0 ? 'up' as const : 'neutral' as const },
    { id: 'adjustment-entries', label: 'Adjustment Entries', value: adj, change: 'Adjustment journals currently stored', trend: adj > 0 ? 'up' as const : 'neutral' as const },
    { id: 'system-entries', label: 'System Entries', value: sys, change: 'Generated by supported posting workflows', trend: sys > 0 ? 'up' as const : 'neutral' as const },
  ]
}

const buildFilterOptions = (): RegisterFilterOptions => ({
  sourceTypes: JOURNAL_SOURCE_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
  statuses: JOURNAL_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
  quickFilters: [
    { label: 'Manual', value: 'sourceType:manual' },
    { label: 'Opening Balance', value: 'sourceType:opening_balance' },
    { label: 'Adjustment', value: 'sourceType:adjustment' },
    { label: 'Reversal', value: 'sourceType:reversal' },
    { label: 'System', value: 'sourceType:system' },
    { label: 'Draft', value: 'status:draft' },
    { label: 'Posted', value: 'status:posted' },
  ],
})

export class AccountingJournalSourceTypesRegisterService {
  static async getSourceTypesRegister(
    payload: Payload,
    query: SourceTypesRegisterQuery = {},
  ): Promise<SourceTypesRegisterResult> {
    const search = normalizeSearch(query.search)
    const sourceTypes = Array.isArray(query.sourceTypes) ? query.sourceTypes : []
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const quickFilters = Array.isArray(query.quickFilters) ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean) : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const docs = await findAllDocs<SourceTypeDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      depth: 1,
      sort: '-entryDate',
    })

    const sorted = sortEntries(docs)
    const allRows = sorted.map(mapSourceTypeRow)

    let filtered = allRows.filter(
      (row) => matchesSearch(row, search) && matchesSourceTypes(row, sourceTypes) && matchesStatuses(row, statuses),
    )

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue.startsWith('sourceType:')) {
            return Boolean(row.sourceType && normalizeText(row.sourceType) === normalizeText(filterValue.replace('sourceType:', '')))
          }

          if (filterValue.startsWith('status:')) {
            return Boolean(row.status && normalizeText(row.status) === normalizeText(filterValue.replace('status:', '')))
          }

          return false
        }),
      )
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filtered.slice(startIndex, startIndex + limit)

    return {
      rows,
      metrics: buildMetrics(allRows),
      filterOptions: buildFilterOptions(),
      appliedFilters: { search: normalizeText(query.search), sourceTypes, statuses, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: {
        totalEntries: allRows.length,
        filteredEntries: totalDocs,
        manualCount: allRows.filter((r) => r.sourceType === 'manual').length,
        openingBalanceCount: allRows.filter((r) => r.sourceType === 'opening_balance').length,
        adjustmentCount: allRows.filter((r) => r.sourceType === 'adjustment').length,
        reversalCount: allRows.filter((r) => r.sourceType === 'reversal').length,
        systemCount: allRows.filter((r) => r.sourceType === 'system').length,
        draftCount: allRows.filter((r) => r.status === 'draft').length,
        postedCount: allRows.filter((r) => r.status === 'posted').length,
      },
    }
  }
}
