import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_ACCOUNT_TYPE_OPTIONS,
} from '@/accounting/constants/accounting'
import type { AccountingBankAccountType } from '@/accounting/types/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import { normalizeSearch, parseIntegerParam, parseListParam } from '../../_shared'

type CashAccountStatus = 'active' | 'inactive'
type CashAccountType = Extract<AccountingBankAccountType, 'cash_on_hand' | 'undeposited_funds'>

type CashAccountDoc = {
  id: number | string
  accountName?: string | null
  accountNumberMasked?: string | null
  bankName?: string | null
  branchName?: string | null
  accountType?: AccountingBankAccountType | null
  currencyReference?: {
    id: number | string
    code?: string | null
    name?: string | null
  } | null
  ledgerAccount?: {
    id: number | string
    code?: string | null
    name?: string | null
    isActive?: boolean | null
  } | null
  isDefaultReceiptAccount?: boolean | null
  isDefaultDisbursementAccount?: boolean | null
  isActive?: boolean | null
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

type CashAccountCell =
  | string
  | {
      text: string
      tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'
      emphasis?: boolean
      align?: 'left' | 'right' | 'center'
    }

type CashAccountRow = {
  id: string
  accountName: string
  accountNumberMasked: string
  bankName: string
  branchName: string
  accountType: CashAccountType
  accountTypeLabel: string
  currency: string
  currencyReferenceId: string
  ledgerAccountId: string
  ledgerAccountCode: string
  ledgerAccountName: string
  ledgerAccountDisplay: string
  isDefaultReceiptAccount: boolean
  isDefaultDisbursementAccount: boolean
  isLedgerMapped: boolean
  status: CashAccountStatus
  statusLabel: string
  statusTone: 'gray' | 'green'
  notes: string
  createdAt: string
  updatedAt: string
  searchableText: string
  cells: CashAccountCell[]
}

const CASH_ACCOUNT_TYPES: CashAccountType[] = ['cash_on_hand', 'undeposited_funds']

const accountTypeLabelMap = new Map(
  BANK_ACCOUNT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const buildLedgerAccountDisplay = (ledgerAccount: CashAccountDoc['ledgerAccount']) => {
  const code = String(ledgerAccount?.code || '').trim()
  const name = String(ledgerAccount?.name || '').trim()
  if (code && name) return `${code} - ${name}`
  return code || name || ''
}

const matchesQuickFilter = (row: CashAccountRow, quickFilter: string) => {
  const [group, value] = quickFilter.split(':')
  if (group === 'status') return row.status === value
  if (group === 'type') return row.accountType === value
  if (group === 'coverage' && value === 'default_receipt') return row.isDefaultReceiptAccount
  if (group === 'coverage' && value === 'default_disbursement') return row.isDefaultDisbursementAccount
  if (group === 'coverage' && value === 'ledger_mapped') return row.isLedgerMapped
  return false
}

const matchesSelectedFilters = (
  row: CashAccountRow,
  filters: {
    statuses: string[]
    accountTypes: string[]
    coverageStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.accountTypes.map((accountType) => row.accountType === accountType),
    ...filters.coverageStates.map((coverageState) =>
      coverageState === 'default_receipt'
        ? row.isDefaultReceiptAccount
        : coverageState === 'default_disbursement'
          ? row.isDefaultDisbursementAccount
          : coverageState === 'ledger_mapped'
            ? row.isLedgerMapped
            : false,
    ),
    ...filters.quickFilters.map((quickFilter) => matchesQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) return true
  return predicates.some(Boolean)
}

const buildMetrics = (rows: CashAccountRow[]) => [
  {
    id: 'cash-accounts-active',
    label: 'Active Cash Accounts',
    value: rows.filter((row) => row.status === 'active').length,
    change: 'Usable for cash-backed activity',
    trend: 'up' as const,
  },
  {
    id: 'cash-accounts-default-disbursement',
    label: 'Default Disbursement',
    value: rows.filter((row) => row.isDefaultDisbursementAccount).length,
    change: 'Preferred for outgoing petty cash',
    trend: 'neutral' as const,
  },
  {
    id: 'cash-accounts-undeposited',
    label: 'Undeposited Funds',
    value: rows.filter((row) => row.accountType === 'undeposited_funds').length,
    change: 'Used for cash receipts awaiting deposit',
    trend: 'neutral' as const,
  },
  {
    id: 'cash-accounts-inactive',
    label: 'Inactive Accounts',
    value: rows.filter((row) => row.status === 'inactive').length,
    change: 'Hidden from current cash workflows',
    trend: 'down' as const,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const statuses = parseListParam(searchParams, 'status')
    const accountTypes = parseListParam(searchParams, 'accountType').filter((value): value is CashAccountType =>
      CASH_ACCOUNT_TYPES.includes(value as CashAccountType),
    )
    const coverageStates = parseListParam(searchParams, 'coverage')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [cashAccountDocs, currencies, ledgerAccounts] = await Promise.all([
      findAllDocs<CashAccountDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
        depth: 1,
        sort: 'accountName',
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.currencies,
        depth: 0,
        sort: 'code',
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        depth: 0,
        sort: 'code',
      }),
    ])

    const rows: CashAccountRow[] = cashAccountDocs
      .filter((cashAccount) => CASH_ACCOUNT_TYPES.includes(String(cashAccount.accountType || '') as CashAccountType))
      .map((cashAccount) => {
        const accountType = String(cashAccount.accountType || '') as CashAccountType
        const accountTypeLabel = accountTypeLabelMap.get(accountType) || accountType
        const currency = String(cashAccount.currencyReference?.code || cashAccount.currencyReference?.name || '').trim()
        const ledgerAccountDisplay = buildLedgerAccountDisplay(cashAccount.ledgerAccount)
        const status: CashAccountStatus = cashAccount.isActive === false ? 'inactive' : 'active'
        const statusLabel = status === 'inactive' ? 'Inactive' : 'Active'
        const defaults: string[] = []
        if (cashAccount.isDefaultDisbursementAccount) defaults.push('Disbursement')
        if (cashAccount.isDefaultReceiptAccount) defaults.push('Receipt')

        return {
          id: String(cashAccount.id),
          accountName: String(cashAccount.accountName || '').trim() || `Cash Account ${cashAccount.id}`,
          accountNumberMasked: String(cashAccount.accountNumberMasked || '').trim(),
          bankName: String(cashAccount.bankName || '').trim(),
          branchName: String(cashAccount.branchName || '').trim(),
          accountType,
          accountTypeLabel,
          currency,
          currencyReferenceId: String(cashAccount.currencyReference?.id || ''),
          ledgerAccountId: String(cashAccount.ledgerAccount?.id || ''),
          ledgerAccountCode: String(cashAccount.ledgerAccount?.code || '').trim(),
          ledgerAccountName: String(cashAccount.ledgerAccount?.name || '').trim(),
          ledgerAccountDisplay,
          isDefaultReceiptAccount: cashAccount.isDefaultReceiptAccount === true,
          isDefaultDisbursementAccount: cashAccount.isDefaultDisbursementAccount === true,
          isLedgerMapped: Boolean(cashAccount.ledgerAccount?.id),
          status,
          statusLabel,
          statusTone: status === 'inactive' ? 'gray' : 'green',
          notes: String(cashAccount.notes || '').trim(),
          createdAt: String(cashAccount.createdAt || ''),
          updatedAt: String(cashAccount.updatedAt || ''),
          searchableText: normalizeSearch(
            [
              cashAccount.accountName,
              cashAccount.accountNumberMasked,
              cashAccount.bankName,
              cashAccount.branchName,
              accountTypeLabel,
              currency,
              ledgerAccountDisplay,
              defaults.join(' '),
              cashAccount.notes,
              statusLabel,
            ].join(' '),
          ),
          cells: [
            { text: String(cashAccount.accountName || '').trim() || `Cash Account ${cashAccount.id}`, emphasis: true },
            accountTypeLabel,
            ledgerAccountDisplay || '-',
            currency || '-',
            defaults.join(', ') || 'None',
            { text: statusLabel, tone: status === 'inactive' ? 'gray' : 'green' },
          ],
        }
      })

    const normalizedQuery = normalizeSearch(search)
    const filteredRows = rows.filter((row) => {
      if (normalizedQuery && !row.searchableText.includes(normalizedQuery)) return false
      return matchesSelectedFilters(row, {
        statuses,
        accountTypes,
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
        statuses: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        accountTypes: CASH_ACCOUNT_TYPES.map((accountType) => ({
          label: accountTypeLabelMap.get(accountType) || accountType,
          value: accountType,
        })),
        coverageStates: [
          { label: 'Default Receipt', value: 'default_receipt' },
          { label: 'Default Disbursement', value: 'default_disbursement' },
          { label: 'Ledger Mapped', value: 'ledger_mapped' },
        ],
        quickFilters: [
          { label: 'Active', value: 'status:active' },
          { label: 'Cash On Hand', value: 'type:cash_on_hand' },
          { label: 'Undeposited Funds', value: 'type:undeposited_funds' },
          { label: 'Default Disbursement', value: 'coverage:default_disbursement' },
        ],
      },
      appliedFilters: {
        search,
        statuses,
        accountTypes,
        coverageStates,
        quickFilters,
      },
      meta: {
        id: 'cash-accounts',
        label: 'Cash Accounts',
        description:
          'Review cash-style accounts used in day-to-day disbursement and receipt handling, including cash on hand and undeposited funds.',
        searchPlaceholder: 'Search account name, branch, masked number, type, currency, ledger account, or note',
        tableTitle: 'Cash Account Directory',
        tableDescription:
          'Cash-account directory used by finance teams when selecting source and destination accounts for petty cash activity.',
        columns: ['Account', 'Type', 'Ledger Account', 'Currency', 'Defaults', 'Status'],
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
      referenceData: {
        currencies: currencies
          .filter((currency) => currency?.isActive !== false)
          .map((currency) => ({
            id: String(currency.id),
            code: String(currency.code || '').trim() || null,
            name: String(currency.name || '').trim() || null,
          })),
        ledgerAccounts: ledgerAccounts
          .filter((ledgerAccount) => ledgerAccount?.isActive !== false)
          .map((ledgerAccount) => ({
            id: String(ledgerAccount.id),
            code: String(ledgerAccount.code || '').trim() || null,
            name: String(ledgerAccount.name || '').trim() || null,
          })),
      },
      summary: {
        defaultReceiptCount: filteredRows.filter((row) => row.isDefaultReceiptAccount).length,
        defaultDisbursementCount: filteredRows.filter((row) => row.isDefaultDisbursementAccount).length,
        ledgerMappedCount: filteredRows.filter((row) => row.isLedgerMapped).length,
      },
      rowMetadata: paginatedRows.map((row) => ({
        id: row.id,
        defaultsLabel: [row.isDefaultDisbursementAccount ? 'Disbursement' : '', row.isDefaultReceiptAccount ? 'Receipt' : '']
          .filter(Boolean)
          .join(', ') || 'None',
        ledgerMappingLabel: row.isLedgerMapped ? 'Mapped' : 'Unmapped',
        statusLabel: row.statusLabel,
      })),
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
