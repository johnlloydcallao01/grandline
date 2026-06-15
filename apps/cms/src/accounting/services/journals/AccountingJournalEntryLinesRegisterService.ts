import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type AccountRef = { id: number | string; code?: string | null; name?: string | null } | number | string | null
type JournalEntryRef = { id: number | string; entryNumber?: string | null; entryDate?: string | null } | number | string | null
type TaxCodeRef = { id: number | string; code?: string | null; name?: string | null } | number | string | null

type JournalEntryLineDoc = {
  id: number | string
  journalEntry?: JournalEntryRef
  lineNumber?: number | null
  account?: AccountRef
  description?: string | null
  debit?: number | null
  credit?: number | null
  taxCode?: TaxCodeRef
  referenceEntityType?: string | null
  referenceEntityId?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type JournalEntryLinesRegisterQuery = {
  search?: string
  hasTaxCode?: boolean
  hasReference?: boolean
  lineTypes?: string[]
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type JournalEntryLinesRegisterRow = {
  id: number | string
  journalEntryId: number | string | null
  entryNumber: string | null
  entryDate: string | null
  lineNumber: number | null
  accountId: number | string | null
  accountCode: string | null
  accountName: string | null
  description: string | null
  debit: number | null
  credit: number | null
  taxCodeId: number | string | null
  taxCode: string | null
  referenceEntityType: string | null
  referenceEntityId: string | null
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

export type JournalEntryLinesRegisterResult = {
  rows: JournalEntryLinesRegisterRow[]
  metrics: RegisterMetric[]
  filterOptions: RegisterFilterOptions
  appliedFilters: { search: string; hasTaxCode: boolean; hasReference: boolean; lineTypes: string[]; quickFilters: string[] }
  pagination: RegisterPagination
  totals: { totalLines: number; filteredLines: number; taxCodedLines: number; referencedLines: number; debitLines: number }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

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

const resolveRelationship = <T extends { id: number | string }>(ref: T | number | string | null | undefined): T | number | string | null => {
  if (typeof ref === 'object' && ref !== null) return ref
  return ref ?? null
}

const getRelId = (ref: unknown): number | string | null => {
  if (typeof ref === 'object' && ref !== null) return (ref as { id: number | string }).id ?? null
  return (ref as number | string) ?? null
}

const getRelText = (ref: unknown, field: string): string | null => {
  if (typeof ref === 'object' && ref !== null) return String((ref as Record<string, unknown>)[field] ?? '') || null
  return null
}

const mapLineRow = (doc: JournalEntryLineDoc): JournalEntryLinesRegisterRow => {
  const je = resolveRelationship(doc.journalEntry)
  const acct = resolveRelationship(doc.account)
  const tc = resolveRelationship(doc.taxCode)
  const entryNumber = getRelText(je, 'entryNumber')
  const entryDate = getRelText(je, 'entryDate')
  const accountCode = getRelText(acct, 'code')
  const accountName = getRelText(acct, 'name')
  const taxCodeStr = getRelText(tc, 'code') || getRelText(tc, 'name')
  const refStr = doc.referenceEntityType && doc.referenceEntityId ? `${doc.referenceEntityType} / ${doc.referenceEntityId}` : null
  const debit = doc.debit ?? null
  const credit = doc.credit ?? null
  return {
    id: doc.id,
    journalEntryId: getRelId(je),
    entryNumber,
    entryDate,
    lineNumber: doc.lineNumber ?? null,
    accountId: getRelId(acct),
    accountCode,
    accountName,
    description: doc.description || null,
    debit,
    credit,
    taxCodeId: getRelId(tc),
    taxCode: taxCodeStr,
    referenceEntityType: doc.referenceEntityType || null,
    referenceEntityId: doc.referenceEntityId || null,
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
    cells: [
      { text: entryNumber || '-', emphasis: true },
      String(doc.lineNumber ?? '-'),
      accountCode ? `${accountCode} - ${accountName || ''}` : (accountName || '-'),
      doc.description || '-',
      debit != null ? `PHP ${Number(debit).toLocaleString()}` : 'PHP 0',
      credit != null ? `PHP ${Number(credit).toLocaleString()}` : 'PHP 0',
      taxCodeStr || '-',
      refStr || '-',
    ],
  }
}

const matchesSearch = (row: JournalEntryLinesRegisterRow, search: string) => {
  if (!search) return true
  return [row.entryNumber, row.accountCode, row.accountName, row.description, row.taxCode, row.referenceEntityType]
    .some((v) => normalizeSearch(v).includes(search))
}

const matchesFilters = (row: JournalEntryLinesRegisterRow, hasTaxCode: boolean, hasReference: boolean, lineTypes: string[]) => {
  if (hasTaxCode && !row.taxCode) return false
  if (hasReference && !row.referenceEntityType) return false
  if (lineTypes.length > 0) {
    // OR logic: show row if it matches ANY selected line type
    const matchesDebit = lineTypes.includes('debit') && (row.debit != null && row.debit > 0)
    const matchesCredit = lineTypes.includes('credit') && (row.credit != null && row.credit > 0)
    if (!matchesDebit && !matchesCredit) return false
  }
  return true
}

const sortLines = (docs: JournalEntryLineDoc[]) =>
  [...docs].sort((a, b) => {
    const dateA = getRelText(a.journalEntry, 'entryDate') || ''
    const dateB = getRelText(b.journalEntry, 'entryDate') || ''
    const dateCmp = String(dateB).localeCompare(String(dateA))
    if (dateCmp !== 0) return dateCmp
    return (a.lineNumber ?? 0) - (b.lineNumber ?? 0)
  })

const buildMetrics = (rows: JournalEntryLinesRegisterRow[]): RegisterMetric[] => {
  const total = rows.length
  const withTaxCode = rows.filter((r) => r.taxCode).length
  const withReference = rows.filter((r) => r.referenceEntityType).length
  const debitLines = rows.filter((r) => r.debit != null && r.debit > 0).length
  return [
    { id: 'total-lines', label: 'Journal Lines', value: total, change: 'Line items across all journal entries', trend: total > 0 ? 'up' as const : 'neutral' as const },
    { id: 'tax-coded-lines', label: 'Tax-Coded Lines', value: withTaxCode, change: 'Lines with tax-code references', trend: withTaxCode > 0 ? 'up' as const : 'neutral' as const },
    { id: 'referenced-lines', label: 'Referenced Lines', value: withReference, change: 'Lines with source entity references', trend: withReference > 0 ? 'up' as const : 'neutral' as const },
    { id: 'debit-lines', label: 'Debit Lines', value: debitLines, change: 'Lines carrying debit amounts', trend: debitLines > 0 ? 'up' as const : 'neutral' as const },
  ]
}

const buildFilterOptions = (): RegisterFilterOptions => ({
  quickFilters: [
    { label: 'Has Tax Code', value: 'hasTaxCode:true' },
    { label: 'Has Reference', value: 'hasReference:true' },
    { label: 'Debit Lines', value: 'lineType:debit' },
    { label: 'Credit Lines', value: 'lineType:credit' },
  ],
})

export class AccountingJournalEntryLinesRegisterService {
  static async getJournalEntryLinesRegister(
    payload: Payload,
    query: JournalEntryLinesRegisterQuery = {},
  ): Promise<JournalEntryLinesRegisterResult> {
    const search = normalizeSearch(query.search)
    const hasTaxCode = Boolean(query.hasTaxCode)
    const hasReference = Boolean(query.hasReference)
    const lineTypes = Array.isArray(query.lineTypes) ? query.lineTypes : []
    const quickFilters = Array.isArray(query.quickFilters) ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean) : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const docs = await findAllDocs<JournalEntryLineDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      depth: 2,
      sort: '-createdAt',
    })

    const sorted = sortLines(docs)
    let allRows = sorted.map(mapLineRow)

    let filtered = allRows.filter(
      (row) => matchesSearch(row, search) && matchesFilters(row, hasTaxCode, hasReference, lineTypes),
    )

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue === 'hasTaxCode:true') {
            return Boolean(row.taxCode)
          }

          if (filterValue === 'hasReference:true') {
            return Boolean(row.referenceEntityType)
          }

          if (filterValue === 'lineType:debit') {
            return row.debit != null && row.debit > 0
          }

          if (filterValue === 'lineType:credit') {
            return row.credit != null && row.credit > 0
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
      appliedFilters: { search: normalizeText(query.search), hasTaxCode, hasReference, lineTypes, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: {
        totalLines: allRows.length,
        filteredLines: totalDocs,
        taxCodedLines: allRows.filter((r) => r.taxCode).length,
        referencedLines: allRows.filter((r) => r.referenceEntityType).length,
        debitLines: allRows.filter((r) => r.debit != null && r.debit > 0).length,
      },
    }
  }
}
