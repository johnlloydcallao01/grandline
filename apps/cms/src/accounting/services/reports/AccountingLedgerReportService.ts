import type { Payload, Where } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, JOURNAL_STATUS_OPTIONS } from '../../constants/accounting'
import type { AccountingLedgerRow } from '../../types/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'

type GeneralLedgerArgs = {
  accountId?: number | string | null
  fromDate?: string | null
  toDate?: string | null
  fiscalYearId?: number | string | null
  periodId?: number | string | null
  search?: string
  statuses?: string[]
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type GeneralLedgerRegisterRow = {
  id: number | string
  postingDate: string | null | undefined
  entryNumber: string | null | undefined
  account: string | null
  debit: number | null
  credit: number | null
  runningBalance: number | null | undefined
  status: string | null | undefined
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

type Metric = { id: string; label: string; value: number | string; change: string; trend: 'up' | 'down' | 'neutral' }
type FilterOptions = { statuses: Array<{ label: string; value: string }>; quickFilters: Array<{ label: string; value: string }> }
type Pagination = { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean }

export type TrialBalanceRegisterRow = {
  id: number | string
  accountCode: string | null
  accountName: string | null
  accountType: string | null
  totalDebit: number | null
  totalCredit: number | null
  closingBalance: number | null
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

export type TrialBalanceRegisterResult = {
  rows: TrialBalanceRegisterRow[]
  metrics: Metric[]
  filterOptions: FilterOptions
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] }
  pagination: Pagination
  totals: { totalEntries: number; filteredEntries: number; totalDebit: number; totalCredit: number; balanceDifference: number }
}



export type JournalRegisterRow = {
  id: number | string
  entryNumber: string | null
  postingDate: string | null
  sourceType: string | null
  referenceNumber: string | null
  totalDebit: number | null
  status: string | null
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

export type JournalRegisterResult = {
  rows: JournalRegisterRow[]
  metrics: Metric[]
  filterOptions: FilterOptions
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] }
  pagination: Pagination
  totals: { totalEntries: number; filteredEntries: number; postedJournals: number; reversedJournals: number; totalDebitAmount: number }
}

export type GeneralLedgerRegisterResult = {
  rows: GeneralLedgerRegisterRow[]
  metrics: Metric[]
  filterOptions: FilterOptions
  appliedFilters: { search: string; statuses: string[]; quickFilters: string[] }
  pagination: Pagination
  totals: { totalEntries: number; filteredEntries: number; postedJournals: number; reversedJournals: number; accountsHit: number }
}

const DEFAULT_LIMIT = 10; const MAX_LIMIT = 100
const normalizeText = (value?: string | null) => String(value || '').trim()
const normalizeSearch = (value?: string | null) => normalizeText(value).toLowerCase()
const sanitizePage = (page?: number) => { if (!Number.isFinite(page)) return 1; return Math.max(1, Math.trunc(page || 1)) }
const sanitizeLimit = (limit?: number) => { if (!Number.isFinite(limit)) return DEFAULT_LIMIT; return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit || DEFAULT_LIMIT))) }

export class AccountingLedgerReportService {
  static async getGeneralLedger(payload: Payload, args: GeneralLedgerArgs = {}) {
    const journalWhere: Where[] = [
      {
        status: {
          in: ['posted', 'reversed'],
        },
      },
    ]

    if (args.fromDate) {
      journalWhere.push({
        postingDate: {
          greater_than_equal: new Date(args.fromDate).toISOString(),
        },
      })
    }

    if (args.toDate) {
      journalWhere.push({
        postingDate: {
          less_than_equal: new Date(args.toDate).toISOString(),
        },
      })
    }

    if (args.fiscalYearId) {
      journalWhere.push({
        fiscalYear: {
          equals: args.fiscalYearId,
        },
      })
    }

    if (args.periodId) {
      journalWhere.push({
        period: {
          equals: args.periodId,
        },
      })
    }

    const journals = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      depth: 0,
      where: {
        and: journalWhere,
      },
      sort: 'postingDate',
      pageSize: 200,
    })

    if (!journals.length) {
      return []
    }

    const lineWhere: Where[] = [
      {
        journalEntry: {
          in: journals.map((journal) => journal.id),
        },
      },
    ]

    if (args.accountId) {
      lineWhere.push({
        account: {
          equals: args.accountId,
        },
      })
    }

    const lines = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      depth: 2,
      where: {
        and: lineWhere,
      },
      sort: 'lineNumber',
      pageSize: 200,
    })

    const rows: AccountingLedgerRow[] = lines
      .map((line) => {
        const journal = typeof line.journalEntry === 'object' ? line.journalEntry : null
        const account = typeof line.account === 'object' ? line.account : null
        const debit = normalizeAmount(line.debit)
        const credit = normalizeAmount(line.credit)
        const normalBalance = account?.normalBalance || 'debit'

        return {
          journalEntryId: getRelationshipId(line.journalEntry) || line.id,
          journalEntryNumber: journal?.entryNumber || null,
          journalStatus: journal?.status || null,
          postingDate: journal?.postingDate || null,
          entryDate: journal?.entryDate || null,
          memo: journal?.memo || null,
          lineId: line.id,
          lineNumber: line.lineNumber || null,
          accountId: getRelationshipId(line.account) || line.id,
          accountCode: account?.code || null,
          accountName: account?.name || null,
          normalBalance,
          description: line.description || null,
          debit,
          credit,
          runningBalance: null,
        }
      })
      .sort((left, right) => {
        const leftDate = new Date(left.postingDate || 0).getTime()
        const rightDate = new Date(right.postingDate || 0).getTime()

        if (leftDate !== rightDate) {
          return leftDate - rightDate
        }

        return Number(left.lineNumber || 0) - Number(right.lineNumber || 0)
      })

    if (args.accountId) {
      let runningBalance = 0

      for (const row of rows) {
        runningBalance =
          row.normalBalance === 'credit'
            ? roundCurrency(runningBalance + row.credit - row.debit)
            : roundCurrency(runningBalance + row.debit - row.credit)

        row.runningBalance = runningBalance
      }
    }

    return rows
  }

  static async getRegister(payload: Payload, query: GeneralLedgerArgs = {}): Promise<GeneralLedgerRegisterResult> {
    const search = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const quickFilters = Array.isArray(query.quickFilters)
      ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean)
      : []
    const limit = sanitizeLimit(query.limit); const requestedPage = sanitizePage(query.page)

    // Call the base getGeneralLedger with any relevant args
    const allRows = await this.getGeneralLedger(payload, { accountId: query.accountId })

    // Map to RegisterRow
    const mappedRows: GeneralLedgerRegisterRow[] = allRows.map((r) => {
      const accountLabel = r.accountCode ? `${r.accountCode} ${r.accountName || ''}`.trim() : (r.accountName || 'Unknown')
      return {
        id: r.lineId,
        postingDate: r.postingDate,
        entryNumber: r.journalEntryNumber,
        account: accountLabel,
        debit: r.debit,
        credit: r.credit,
        runningBalance: r.runningBalance,
        status: r.journalStatus,
        cells: [
          r.postingDate ? new Date(r.postingDate).toLocaleDateString() : '-',
          { text: r.journalEntryNumber || '-', emphasis: true },
          accountLabel,
          { text: r.debit ? `PHP ${r.debit.toLocaleString()}` : 'PHP 0', align: 'right' },
          { text: r.credit ? `PHP ${r.credit.toLocaleString()}` : 'PHP 0', align: 'right' },
          { text: r.runningBalance != null ? `PHP ${r.runningBalance.toLocaleString()}` : '-', emphasis: true, align: 'right' },
        ],
      }
    })

    // Filter
    let filtered = mappedRows.filter((row) => {
      let match = true
      if (search) {
        match = [row.entryNumber, row.account].some((v) => normalizeSearch(v).includes(search))
      }
      if (match && statuses.length > 0) {
        match = Boolean(row.status && statuses.includes(row.status))
      }
      return match
    })

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue.startsWith('status:')) {
            return Boolean(row.status && normalizeText(row.status) === normalizeText(filterValue.replace('status:', '')))
          }
          return false
        }),
      )
    }

    const totalDocs = filtered.length; const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const rows = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

    const postedJournals = new Set(allRows.filter(r => r.journalStatus === 'posted').map(r => r.journalEntryId)).size
    const reversedJournals = new Set(allRows.filter(r => r.journalStatus === 'reversed').map(r => r.journalEntryId)).size
    const accountsHit = new Set(allRows.map(r => r.accountId)).size

    const metrics: Metric[] = [
      { id: 'ledger-rows', label: 'Ledger Rows', value: allRows.length, change: 'Lines available to general-ledger reporting', trend: allRows.length > 0 ? 'up' : 'neutral' },
      { id: 'posted-journals', label: 'Posted Journals', value: postedJournals, change: 'Headers included in ledger output', trend: postedJournals > 0 ? 'up' : 'neutral' },
      { id: 'reversed-journals', label: 'Reversed Journals', value: reversedJournals, change: 'Still visible in ledger reporting scope', trend: 'neutral' },
      { id: 'accounts-hit', label: 'Accounts Hit', value: accountsHit, change: 'Accounts with ledger movement in range', trend: accountsHit > 0 ? 'up' : 'neutral' },
    ]

    const filterOptions: FilterOptions = {
      statuses: JOURNAL_STATUS_OPTIONS.filter(o => o.value === 'posted' || o.value === 'reversed').map((o) => ({ label: o.label, value: o.value })),
      quickFilters: [
        { label: 'Posted', value: 'status:posted' },
        { label: 'Reversed', value: 'status:reversed' },
      ],
    }

    return {
      rows, metrics, filterOptions,
      appliedFilters: { search: normalizeText(query.search), statuses, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: { totalEntries: allRows.length, filteredEntries: totalDocs, postedJournals, reversedJournals, accountsHit },
    }
  }

  static async getTrialBalanceRegister(payload: Payload, query: GeneralLedgerArgs = {}): Promise<TrialBalanceRegisterResult> {
    const search = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const quickFilters = Array.isArray(query.quickFilters)
      ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean)
      : []
    const limit = sanitizeLimit(query.limit); const requestedPage = sanitizePage(query.page)

    // Call the base getGeneralLedger with any relevant args
    const allRows = await this.getGeneralLedger(payload, { accountId: query.accountId })

    // Aggregate into Trial Balance accounts
    const accountMap = new Map<string, { id: string | number, code: string, name: string, debit: number, credit: number }>()

    for (const r of allRows) {
      if (!r.accountId) continue
      const accountIdStr = String(r.accountId)
      if (!accountMap.has(accountIdStr)) {
        accountMap.set(accountIdStr, {
          id: r.accountId,
          code: r.accountCode || '',
          name: r.accountName || 'Unknown',
          debit: 0,
          credit: 0
        })
      }
      const acc = accountMap.get(accountIdStr)!
      acc.debit += (r.debit || 0)
      acc.credit += (r.credit || 0)
    }

    let globalTotalDebit = 0
    let globalTotalCredit = 0

    // Map to RegisterRow
    const mappedRows: TrialBalanceRegisterRow[] = Array.from(accountMap.values()).map((acc) => {
      const isCreditBalance = acc.code.startsWith('2') || acc.code.startsWith('3') || acc.code.startsWith('4')
      const closingBalance = isCreditBalance ? acc.credit - acc.debit : acc.debit - acc.credit
      const accountType = acc.code.startsWith('1') ? 'asset' : acc.code.startsWith('2') ? 'liability' : acc.code.startsWith('3') ? 'equity' : acc.code.startsWith('4') ? 'income' : 'expense'
      
      globalTotalDebit += acc.debit
      globalTotalCredit += acc.credit

      return {
        id: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: accountType,
        totalDebit: acc.debit,
        totalCredit: acc.credit,
        closingBalance,
        cells: [
          { text: acc.code || '-', emphasis: true },
          acc.name,
          accountType,
          { text: acc.debit ? `PHP ${acc.debit.toLocaleString()}` : 'PHP 0', align: 'right' },
          { text: acc.credit ? `PHP ${acc.credit.toLocaleString()}` : 'PHP 0', align: 'right' },
          { text: closingBalance != null ? `PHP ${closingBalance.toLocaleString()}` : '-', emphasis: true, align: 'right' },
        ],
      }
    })

    // Filter
    let filtered = mappedRows.filter((row) => {
      let match = true
      if (search) {
        match = [row.accountCode, row.accountName, row.accountType].some((v) => normalizeSearch(v).includes(search))
      }
      if (match && statuses.length > 0) {
        // Here statuses map to "account types" for trial balance (e.g. assets, liabilities)
        match = Boolean(row.accountType && statuses.includes(row.accountType))
      }
      return match
    })

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue.startsWith('status:')) {
            return Boolean(row.accountType && normalizeText(row.accountType) === normalizeText(filterValue.replace('status:', '')))
          }
          return false
        }),
      )
    }

    const totalDocs = filtered.length; const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const rows = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

    const balanceDifference = Math.abs(globalTotalDebit - globalTotalCredit)

    const metrics: Metric[] = [
      { id: 'accounts-in-tb', label: 'Accounts In TB', value: accountMap.size, change: 'Accounts with debit or credit movement', trend: accountMap.size > 0 ? 'up' : 'neutral' },
      { id: 'total-debit', label: 'Total Debit', value: `PHP ${globalTotalDebit.toLocaleString()}`, change: 'Aggregated debit movement in scope', trend: globalTotalDebit > 0 ? 'up' : 'neutral' },
      { id: 'total-credit', label: 'Total Credit', value: `PHP ${globalTotalCredit.toLocaleString()}`, change: 'Aggregated credit movement in scope', trend: globalTotalCredit > 0 ? 'up' : 'neutral' },
      { id: 'balanced-result', label: 'Balanced Result', value: `PHP ${balanceDifference.toLocaleString()}`, change: 'Debit-credit difference across the report', trend: balanceDifference === 0 ? 'neutral' : 'down' },
    ]

    const filterOptions: FilterOptions = {
      statuses: [
        { label: 'Assets', value: 'asset' },
        { label: 'Liabilities', value: 'liability' },
        { label: 'Equity', value: 'equity' },
        { label: 'Income', value: 'income' },
        { label: 'Expenses', value: 'expense' },
      ],
      quickFilters: [
        { label: 'Assets', value: 'status:asset' },
        { label: 'Liabilities', value: 'status:liability' },
      ],
    }

    return {
      rows, metrics, filterOptions,
      appliedFilters: { search: normalizeText(query.search), statuses, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: { totalEntries: mappedRows.length, filteredEntries: totalDocs, totalDebit: globalTotalDebit, totalCredit: globalTotalCredit, balanceDifference },
    }
  }

  static async getJournalRegister(payload: Payload, query: GeneralLedgerArgs = {}): Promise<JournalRegisterResult> {
    const search = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const quickFilters = Array.isArray(query.quickFilters)
      ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean)
      : []
    const limit = sanitizeLimit(query.limit); const requestedPage = sanitizePage(query.page)

    const journalWhere: Where[] = [
      {
        status: {
          in: ['posted', 'reversed'],
        },
      },
    ]

    if (query.fromDate) {
      journalWhere.push({
        postingDate: {
          greater_than_equal: new Date(query.fromDate).toISOString(),
        },
      })
    }

    if (query.toDate) {
      journalWhere.push({
        postingDate: {
          less_than_equal: new Date(query.toDate).toISOString(),
        },
      })
    }

    if (query.fiscalYearId) {
      journalWhere.push({
        fiscalYear: {
          equals: query.fiscalYearId,
        },
      })
    }

    if (query.periodId) {
      journalWhere.push({
        period: {
          equals: query.periodId,
        },
      })
    }

    const journals = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      depth: 0,
      where: {
        and: journalWhere,
      },
      sort: '-postingDate',
      pageSize: 200,
    })

    const statusLabelMap = new Map<string, string>(JOURNAL_STATUS_OPTIONS.map((o) => [o.value, o.label]))

    let globalTotalDebitAmount = 0
    let postedJournalsCount = 0
    let reversedJournalsCount = 0

    const mappedRows: JournalRegisterRow[] = journals.map((j) => {
      const statusLabel = j.status ? statusLabelMap.get(j.status) || j.status : null
      const totalDebit = j.totalDebit || 0
      
      globalTotalDebitAmount += totalDebit
      if (j.status === 'posted') postedJournalsCount++
      if (j.status === 'reversed') reversedJournalsCount++

      return {
        id: j.id,
        entryNumber: j.entryNumber || null,
        postingDate: j.postingDate || null,
        sourceType: j.sourceType || null,
        referenceNumber: j.referenceNumber || null,
        totalDebit,
        status: j.status || null,
        cells: [
          { text: j.entryNumber || '-', emphasis: true },
          j.postingDate ? new Date(j.postingDate).toLocaleDateString() : '-',
          j.sourceType || '-',
          j.referenceNumber || '-',
          { text: totalDebit ? `PHP ${Number(totalDebit).toLocaleString()}` : 'PHP 0', align: 'right' },
          { text: statusLabel || '-', tone: j.status === 'posted' ? 'green' : j.status === 'reversed' ? 'gray' : 'gray' },
        ],
      }
    })

    // Filter
    let filtered = mappedRows.filter((row) => {
      let match = true
      if (search) {
        match = [row.entryNumber, row.sourceType, row.referenceNumber, row.status].some((v) => normalizeSearch(v).includes(search))
      }
      if (match && statuses.length > 0) {
        match = Boolean(row.status && statuses.includes(row.status))
      }
      return match
    })

    if (quickFilters.length > 0) {
      filtered = filtered.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue.startsWith('status:')) {
            return Boolean(row.status && normalizeText(row.status) === normalizeText(filterValue.replace('status:', '')))
          }
          return false
        }),
      )
    }

    const totalDocs = filtered.length; const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const rows = filtered.slice((page - 1) * limit, (page - 1) * limit + limit)

    const metrics: Metric[] = [
      { id: 'total-journals', label: 'Total Journals', value: journals.length, change: 'Journals included in register output', trend: journals.length > 0 ? 'up' : 'neutral' },
      { id: 'posted-journals', label: 'Posted Journals', value: postedJournalsCount, change: 'Active ledger journals', trend: postedJournalsCount > 0 ? 'up' : 'neutral' },
      { id: 'reversed-journals', label: 'Reversed Journals', value: reversedJournalsCount, change: 'Reversed/voided journals', trend: 'neutral' },
      { id: 'total-debit-amount', label: 'Total Debit Amount', value: `PHP ${globalTotalDebitAmount.toLocaleString()}`, change: 'Sum of all debit lines in journals', trend: globalTotalDebitAmount > 0 ? 'up' : 'neutral' },
    ]

    const filterOptions: FilterOptions = {
      statuses: [
        { label: 'Posted', value: 'posted' },
        { label: 'Reversed', value: 'reversed' },
      ],
      quickFilters: [
        { label: 'Posted', value: 'status:posted' },
        { label: 'Reversed', value: 'status:reversed' },
      ],
    }

    return {
      rows, metrics, filterOptions,
      appliedFilters: { search: normalizeText(query.search), statuses, quickFilters },
      pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
      totals: { totalEntries: mappedRows.length, filteredEntries: totalDocs, postedJournals: postedJournalsCount, reversedJournals: reversedJournalsCount, totalDebitAmount: globalTotalDebitAmount },
    }
  }
}
