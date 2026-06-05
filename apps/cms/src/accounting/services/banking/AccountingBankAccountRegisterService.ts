import type { Payload } from 'payload'
import type { AccountingBankAccountType } from '../../types/accounting'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  BANK_ACCOUNT_TYPE_OPTIONS,
} from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type BankAccountRegisterStatus = 'active' | 'inactive'

type BankAccountRegisterDoc = {
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

export type AccountingBankAccountRegisterQuery = {
  search?: string
  accountTypes?: AccountingBankAccountType[]
  statuses?: BankAccountRegisterStatus[]
  defaultReceiptOnly?: boolean
  defaultDisbursementOnly?: boolean
  ledgerMappedOnly?: boolean
  page?: number
  limit?: number
}

export type AccountingBankAccountRegisterRow = {
  id: number | string
  accountName: string | null
  accountNumberMasked: string | null
  bankName: string | null
  branchName: string | null
  accountType: AccountingBankAccountType | null
  accountTypeLabel: string | null
  currency: string | null
  currencyReferenceId: number | string | null
  ledgerAccountId: number | string | null
  ledgerAccountCode: string | null
  ledgerAccountName: string | null
  ledgerAccountDisplay: string | null
  isDefaultReceiptAccount: boolean
  isDefaultDisbursementAccount: boolean
  isLedgerMapped: boolean
  status: BankAccountRegisterStatus
  statusLabel: string
  notes: string | null
  createdAt: string | null
  updatedAt: string | null
}

type BankAccountRegisterReferenceItem = {
  id: number | string
  code: string | null
  name: string | null
}

type BankAccountRegisterReferenceData = {
  currencies: BankAccountRegisterReferenceItem[]
  ledgerAccounts: BankAccountRegisterReferenceItem[]
}

type BankAccountRegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type BankAccountRegisterFilterOption = {
  label: string
  value: string
}

type BankAccountRegisterFilterOptions = {
  statuses: BankAccountRegisterFilterOption[]
  accountTypes: BankAccountRegisterFilterOption[]
  quickFilters: BankAccountRegisterFilterOption[]
}

type BankAccountRegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type AccountingBankAccountRegisterResult = {
  rows: AccountingBankAccountRegisterRow[]
  metrics: BankAccountRegisterMetric[]
  filterOptions: BankAccountRegisterFilterOptions
  appliedFilters: {
    search: string
    statuses: BankAccountRegisterStatus[]
    accountTypes: AccountingBankAccountType[]
    defaultReceiptOnly: boolean
    defaultDisbursementOnly: boolean
    ledgerMappedOnly: boolean
  }
  pagination: BankAccountRegisterPagination
  referenceData: BankAccountRegisterReferenceData
  totals: {
    totalBankAccounts: number
    filteredBankAccounts: number
  }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const statusLabelMap = new Map<BankAccountRegisterStatus, string>([
  ['active', 'Active'],
  ['inactive', 'Inactive'],
])

const accountTypeLabelMap = new Map(
  BANK_ACCOUNT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const normalizeText = (value?: string | null) => String(value || '').trim()

const normalizeSearch = (value?: string | null) => normalizeText(value).toLowerCase()

const sanitizePage = (page?: number) => {
  if (!Number.isFinite(page)) {
    return 1
  }

  return Math.max(1, Math.trunc(page || 1))
}

const sanitizeLimit = (limit?: number) => {
  if (!Number.isFinite(limit)) {
    return DEFAULT_LIMIT
  }

  return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit || DEFAULT_LIMIT)))
}

const sortBankAccounts = (bankAccounts: BankAccountRegisterDoc[]) =>
  [...bankAccounts].sort((left, right) => {
    const leftName = normalizeText(left.accountName).toLowerCase()
    const rightName = normalizeText(right.accountName).toLowerCase()

    if (leftName !== rightName) {
      return leftName.localeCompare(rightName)
    }

    return normalizeText(left.bankName).localeCompare(normalizeText(right.bankName))
  })

const buildLedgerAccountDisplay = (ledgerAccount: BankAccountRegisterDoc['ledgerAccount']) => {
  const code = normalizeText(ledgerAccount?.code)
  const name = normalizeText(ledgerAccount?.name)

  if (code && name) {
    return `${code} ${name}`
  }

  return code || name || null
}

const mapBankAccountRow = (
  bankAccount: BankAccountRegisterDoc,
): AccountingBankAccountRegisterRow => {
  const status: BankAccountRegisterStatus = bankAccount.isActive === false ? 'inactive' : 'active'

  return {
    id: bankAccount.id,
    accountName: bankAccount.accountName || null,
    accountNumberMasked: bankAccount.accountNumberMasked || null,
    bankName: bankAccount.bankName || null,
    branchName: bankAccount.branchName || null,
    accountType: bankAccount.accountType || null,
    accountTypeLabel: bankAccount.accountType
      ? accountTypeLabelMap.get(bankAccount.accountType) || bankAccount.accountType
      : null,
    currency: bankAccount.currencyReference?.code || bankAccount.currencyReference?.name || null,
    currencyReferenceId: bankAccount.currencyReference?.id || null,
    ledgerAccountId: bankAccount.ledgerAccount?.id || null,
    ledgerAccountCode: bankAccount.ledgerAccount?.code || null,
    ledgerAccountName: bankAccount.ledgerAccount?.name || null,
    ledgerAccountDisplay: buildLedgerAccountDisplay(bankAccount.ledgerAccount),
    isDefaultReceiptAccount: bankAccount.isDefaultReceiptAccount === true,
    isDefaultDisbursementAccount: bankAccount.isDefaultDisbursementAccount === true,
    isLedgerMapped: Boolean(bankAccount.ledgerAccount?.id),
    status,
    statusLabel: statusLabelMap.get(status) || status,
    notes: bankAccount.notes || null,
    createdAt: bankAccount.createdAt || null,
    updatedAt: bankAccount.updatedAt || null,
  }
}

const matchesSearch = (bankAccount: AccountingBankAccountRegisterRow, search: string) => {
  if (!search) {
    return true
  }

  const haystacks = [
    bankAccount.accountName,
    bankAccount.accountNumberMasked,
    bankAccount.bankName,
    bankAccount.branchName,
    bankAccount.accountTypeLabel,
    bankAccount.currency,
    bankAccount.ledgerAccountDisplay,
    bankAccount.statusLabel,
  ]

  return haystacks.some((value) => normalizeSearch(value).includes(search))
}

const matchesAccountTypes = (
  bankAccount: AccountingBankAccountRegisterRow,
  accountTypes: AccountingBankAccountType[],
) => {
  if (!accountTypes.length) {
    return true
  }

  return Boolean(bankAccount.accountType && accountTypes.includes(bankAccount.accountType))
}

const matchesStatuses = (
  bankAccount: AccountingBankAccountRegisterRow,
  statuses: BankAccountRegisterStatus[],
) => {
  if (!statuses.length) {
    return true
  }

  return statuses.includes(bankAccount.status)
}

const matchesDefaultReceipt = (
  bankAccount: AccountingBankAccountRegisterRow,
  defaultReceiptOnly: boolean,
) => {
  if (!defaultReceiptOnly) {
    return true
  }

  return bankAccount.isDefaultReceiptAccount
}

const matchesDefaultDisbursement = (
  bankAccount: AccountingBankAccountRegisterRow,
  defaultDisbursementOnly: boolean,
) => {
  if (!defaultDisbursementOnly) {
    return true
  }

  return bankAccount.isDefaultDisbursementAccount
}

const matchesLedgerMapped = (
  bankAccount: AccountingBankAccountRegisterRow,
  ledgerMappedOnly: boolean,
) => {
  if (!ledgerMappedOnly) {
    return true
  }

  return bankAccount.isLedgerMapped
}

const buildMetrics = (
  bankAccounts: AccountingBankAccountRegisterRow[],
): BankAccountRegisterMetric[] => {
  const activeAccounts = bankAccounts.filter((bankAccount) => bankAccount.status === 'active').length
  const defaultReceiptAccounts = bankAccounts.filter((bankAccount) => bankAccount.isDefaultReceiptAccount).length
  const defaultDisbursementAccounts = bankAccounts.filter(
    (bankAccount) => bankAccount.isDefaultDisbursementAccount,
  ).length
  const ledgerMappedAccounts = bankAccounts.filter((bankAccount) => bankAccount.isLedgerMapped).length

  return [
    {
      id: 'active-bank-accounts',
      label: 'Active Accounts',
      value: activeAccounts,
      change: 'Cash and bank accounts available for use',
      trend: 'up',
    },
    {
      id: 'default-receipt-bank-accounts',
      label: 'Default Receipt Accounts',
      value: defaultReceiptAccounts,
      change: 'Accounts flagged for incoming receipts',
      trend: 'neutral',
    },
    {
      id: 'default-disbursement-bank-accounts',
      label: 'Default Disbursement',
      value: defaultDisbursementAccounts,
      change: 'Accounts flagged for outgoing payments',
      trend: 'neutral',
    },
    {
      id: 'ledger-mapped-bank-accounts',
      label: 'Ledger Mapped',
      value: ledgerMappedAccounts,
      change: 'Accounts linked to a controlling ledger account',
      trend: 'up',
    },
  ]
}

const buildFilterOptions = (): BankAccountRegisterFilterOptions => ({
  statuses: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ],
  accountTypes: BANK_ACCOUNT_TYPE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  quickFilters: [
    { label: 'Active', value: 'status:active' },
    { label: 'Default Receipt', value: 'defaultReceiptOnly:true' },
    { label: 'Default Disbursement', value: 'defaultDisbursementOnly:true' },
    { label: 'Cash On Hand', value: 'accountType:cash_on_hand' },
  ],
})

const buildReferenceData = async (
  payload: Payload,
): Promise<BankAccountRegisterReferenceData> => {
  const [currencies, ledgerAccounts] = await Promise.all([
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

  return {
    currencies: currencies
      .filter((currency) => currency?.isActive !== false)
      .map((currency) => ({
        id: currency.id,
        code: currency.code || null,
        name: currency.name || null,
      })),
    ledgerAccounts: ledgerAccounts
      .filter((ledgerAccount) => ledgerAccount?.isActive !== false)
      .map((ledgerAccount) => ({
        id: ledgerAccount.id,
        code: ledgerAccount.code || null,
        name: ledgerAccount.name || null,
      })),
  }
}

export class AccountingBankAccountRegisterService {
  static async getBankAccountMasterRegister(
    payload: Payload,
    query: AccountingBankAccountRegisterQuery = {},
  ): Promise<AccountingBankAccountRegisterResult> {
    const normalizedSearch = normalizeSearch(query.search)
    const accountTypes = Array.isArray(query.accountTypes) ? query.accountTypes : []
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const defaultReceiptOnly = Boolean(query.defaultReceiptOnly)
    const defaultDisbursementOnly = Boolean(query.defaultDisbursementOnly)
    const ledgerMappedOnly = Boolean(query.ledgerMappedOnly)
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const [bankAccountDocs, referenceData] = await Promise.all([
      findAllDocs<BankAccountRegisterDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
        depth: 1,
        sort: 'accountName',
      }),
      buildReferenceData(payload),
    ])

    const allBankAccounts = sortBankAccounts(bankAccountDocs).map(mapBankAccountRow)
    const filteredBankAccounts = allBankAccounts.filter((bankAccount) => {
      return (
        matchesSearch(bankAccount, normalizedSearch) &&
        matchesAccountTypes(bankAccount, accountTypes) &&
        matchesStatuses(bankAccount, statuses) &&
        matchesDefaultReceipt(bankAccount, defaultReceiptOnly) &&
        matchesDefaultDisbursement(bankAccount, defaultDisbursementOnly) &&
        matchesLedgerMapped(bankAccount, ledgerMappedOnly)
      )
    })

    const totalDocs = filteredBankAccounts.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filteredBankAccounts.slice(startIndex, startIndex + limit)

    return {
      rows,
      metrics: buildMetrics(allBankAccounts),
      filterOptions: buildFilterOptions(),
      appliedFilters: {
        search: normalizeText(query.search),
        statuses,
        accountTypes,
        defaultReceiptOnly,
        defaultDisbursementOnly,
        ledgerMappedOnly,
      },
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
      referenceData,
      totals: {
        totalBankAccounts: allBankAccounts.length,
        filteredBankAccounts: totalDocs,
      },
    }
  }
}
