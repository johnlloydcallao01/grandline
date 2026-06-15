import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

export type AccountingTaxUsageRow = {
  id: string
  sourceType: string
  document: string | null
  taxCode: string | null
  taxScope: string | null
  taxableAmount: number
  taxAmount: number
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

export type AccountingTaxUsageMetric = {
  id: string
  label: string
  value: number | string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

export type AccountingTaxUsageFilterOptions = {
  sourceTypes: Array<{ label: string; value: string }>
  quickFilters: Array<{ label: string; value: string }>
}

export type AccountingTaxUsageResult = {
  rows: AccountingTaxUsageRow[]
  metrics: AccountingTaxUsageMetric[]
  filterOptions: AccountingTaxUsageFilterOptions
  appliedFilters: {
    search: string
    sourceTypes: string[]
    quickFilters: string[]
  }
  pagination: {
    page: number
    limit: number
    totalDocs: number
    totalPages: number
    hasPrevPage: boolean
    hasNextPage: boolean
  }
  totals: {
    totalUsages: number
    filteredUsages: number
    invoiceLineUsage: number
    billLineUsage: number
    expenseUsage: number
    journalLineUsage: number
  }
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

export class AccountingTaxUsageRegisterService {
  static async getTaxUsageRegister(
    payload: Payload,
    query: { search?: string; sourceTypes?: string[]; quickFilters?: string[]; page?: number; limit?: number } = {},
  ): Promise<AccountingTaxUsageResult> {
    const search = normalizeSearch(query.search)
    const sourceTypes = Array.isArray(query.sourceTypes) ? query.sourceTypes : []
    const quickFilters = Array.isArray(query.quickFilters)
      ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean)
      : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const [invoiceLines, billLines, expenses, journalLines] = await Promise.all([
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems, depth: 2 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems, depth: 2 }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.expenses, depth: 1, where: { status: { equals: 'posted' } } }),
      findAllDocs<any>({ payload, collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines, depth: 2 }),
    ])

    const allUsages: AccountingTaxUsageRow[] = []

    let invoiceLineUsage = 0
    let billLineUsage = 0
    let expenseUsage = 0
    let journalLineUsage = 0

    // Process Invoice Lines
    for (const line of invoiceLines) {
      const invoice = typeof line.invoice === 'object' ? line.invoice : null
      const taxCode = typeof line.taxCode === 'object' ? line.taxCode : null
      if (!invoice || !taxCode || !['posted', 'partially_paid', 'paid'].includes(String(invoice.status || ''))) continue

      invoiceLineUsage++
      allUsages.push({
        id: `invoice-line-${line.id}`,
        sourceType: 'Invoice Line',
        document: invoice.invoiceNumber || String(invoice.id),
        taxCode: taxCode.code || null,
        taxScope: taxCode.scope || null,
        taxableAmount: line.lineSubtotal || 0,
        taxAmount: line.lineTax || 0,
        cells: [
          'Invoice Line',
          { text: invoice.invoiceNumber || String(invoice.id), emphasis: true },
          taxCode.code || '-',
          taxCode.scope || '-',
          { text: `PHP ${(line.lineSubtotal || 0).toLocaleString()}`, emphasis: true, align: 'right' },
          { text: `PHP ${(line.lineTax || 0).toLocaleString()}`, align: 'right' },
        ],
      })
    }

    // Process Bill Lines
    for (const line of billLines) {
      const bill = typeof line.bill === 'object' ? line.bill : null
      const taxCode = typeof line.taxCode === 'object' ? line.taxCode : null
      if (!bill || !taxCode || !['posted', 'partially_paid', 'paid'].includes(String(bill.status || ''))) continue

      billLineUsage++
      allUsages.push({
        id: `bill-line-${line.id}`,
        sourceType: 'Bill Line',
        document: bill.billNumber || String(bill.id),
        taxCode: taxCode.code || null,
        taxScope: taxCode.scope || null,
        taxableAmount: line.lineSubtotal || 0,
        taxAmount: line.lineTax || 0,
        cells: [
          'Bill Line',
          { text: bill.billNumber || String(bill.id), emphasis: true },
          taxCode.code || '-',
          taxCode.scope || '-',
          { text: `PHP ${(line.lineSubtotal || 0).toLocaleString()}`, emphasis: true, align: 'right' },
          { text: `PHP ${(line.lineTax || 0).toLocaleString()}`, align: 'right' },
        ],
      })
    }

    // Process Expenses
    for (const expense of expenses) {
      const taxCode = typeof expense.taxCode === 'object' ? expense.taxCode : null
      if (!taxCode || (expense.taxTotal || 0) <= 0) continue

      expenseUsage++
      allUsages.push({
        id: `expense-${expense.id}`,
        sourceType: 'Expense',
        document: expense.expenseNumber || String(expense.id),
        taxCode: taxCode.code || null,
        taxScope: taxCode.scope || null,
        taxableAmount: expense.subtotal || 0,
        taxAmount: expense.taxTotal || 0,
        cells: [
          'Expense',
          { text: expense.expenseNumber || String(expense.id), emphasis: true },
          taxCode.code || '-',
          taxCode.scope || '-',
          { text: `PHP ${(expense.subtotal || 0).toLocaleString()}`, emphasis: true, align: 'right' },
          { text: `PHP ${(expense.taxTotal || 0).toLocaleString()}`, align: 'right' },
        ],
      })
    }

    // Process Journal Lines
    for (const line of journalLines) {
      const journalEntry = typeof line.journalEntry === 'object' ? line.journalEntry : null
      const taxCode = typeof line.taxCode === 'object' ? line.taxCode : null
      if (!journalEntry || !taxCode || journalEntry.status !== 'posted') continue

      journalLineUsage++
      allUsages.push({
        id: `journal-line-${line.id}`,
        sourceType: 'Journal Line',
        document: journalEntry.entryNumber || String(journalEntry.id),
        taxCode: taxCode.code || null,
        taxScope: taxCode.scope || null,
        taxableAmount: line.debit || line.credit || 0,
        taxAmount: 0, // Assuming tax amount is recorded in a separate line or not applicable
        cells: [
          'Journal Line',
          { text: journalEntry.entryNumber || String(journalEntry.id), emphasis: true },
          taxCode.code || '-',
          taxCode.scope || '-',
          { text: `PHP ${(line.debit || line.credit || 0).toLocaleString()}`, emphasis: true, align: 'right' },
          { text: `PHP 0`, align: 'right' },
        ],
      })
    }

    // Sort newest first or alphabetically
    allUsages.sort((a, b) => (b.document || '').localeCompare(a.document || ''))

    // Filter
    let filtered = allUsages.filter((row) => {
      let match = true
      if (search) {
        match = [row.sourceType, row.document, row.taxCode, row.taxScope].some((v) => normalizeSearch(v).includes(search))
      }
      if (match && sourceTypes.length > 0) {
        match = sourceTypes.includes(row.sourceType)
      }
      return match
    })

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) => quickFilters.some((filterValue) => filterValue === row.sourceType))
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const rows = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

    const metrics: AccountingTaxUsageMetric[] = [
      { id: 'invoice-usage', label: 'Invoice Line Usage', value: invoiceLineUsage, change: 'Invoice lines carrying tax codes', trend: invoiceLineUsage > 0 ? 'up' : 'neutral' },
      { id: 'bill-usage', label: 'Bill Line Usage', value: billLineUsage, change: 'Bill lines carrying tax codes', trend: billLineUsage > 0 ? 'up' : 'neutral' },
      { id: 'expense-usage', label: 'Posted Expense Usage', value: expenseUsage, change: 'Posted expenses with tax totals', trend: expenseUsage > 0 ? 'up' : 'neutral' },
      { id: 'journal-usage', label: 'Journal Tax Lines', value: journalLineUsage, change: 'Journal entry lines linked to tax codes', trend: journalLineUsage > 0 ? 'up' : 'neutral' },
    ]

    const filterOptions: AccountingTaxUsageFilterOptions = {
      sourceTypes: [
        { label: 'Invoice Lines', value: 'Invoice Line' },
        { label: 'Bill Lines', value: 'Bill Line' },
        { label: 'Expenses', value: 'Expense' },
        { label: 'Journal Lines', value: 'Journal Line' },
      ],
      quickFilters: [
        { label: 'Invoice Lines', value: 'Invoice Line' },
        { label: 'Bill Lines', value: 'Bill Line' },
        { label: 'Expenses', value: 'Expense' },
        { label: 'Journal Lines', value: 'Journal Line' },
      ],
    }

    return {
      rows,
      metrics,
      filterOptions,
      appliedFilters: { search, sourceTypes, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: { totalUsages: allUsages.length, filteredUsages: totalDocs, invoiceLineUsage, billLineUsage, expenseUsage, journalLineUsage },
    }
  }
}
