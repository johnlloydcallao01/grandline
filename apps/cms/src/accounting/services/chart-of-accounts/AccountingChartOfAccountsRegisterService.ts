import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNT_SUB_TYPE_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
} from '../../constants/accounting'
import type {
  AccountingAccountSubType,
  AccountingAccountType,
  AccountingNormalBalance,
} from '../../types/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { findAllDocs } from '../../utils/findAllDocs'

type ChartOfAccountRelationship =
  | number
  | string
  | {
      id: number | string
      code?: string | null
      name?: string | null
    }
  | null

type ChartOfAccountRegisterDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  accountType?: AccountingAccountType | null
  accountSubType?: AccountingAccountSubType | null
  normalBalance?: AccountingNormalBalance | null
  parentAccount?: ChartOfAccountRelationship
  isActive?: boolean | null
  allowManualEntries?: boolean | null
  isControlAccount?: boolean | null
  isRetainedEarnings?: boolean | null
  isSuspenseAccount?: boolean | null
  description?: string | null
  sortOrder?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type ChartOfAccountsRegisterStatus = 'active' | 'inactive'

export type AccountingChartOfAccountsRegisterQuery = {
  search?: string
  statuses?: ChartOfAccountsRegisterStatus[]
  accountTypes?: AccountingAccountType[]
  accountSubTypes?: AccountingAccountSubType[]
  controlAccountsOnly?: boolean
  manualEntriesOnly?: boolean
  retainedEarningsOnly?: boolean
  parentAccountsOnly?: boolean
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type AccountingChartOfAccountsRegisterRow = {
  id: number | string
  code: string | null
  name: string | null
  accountType: AccountingAccountType | null
  accountTypeLabel: string | null
  accountSubType: AccountingAccountSubType | null
  accountSubTypeLabel: string | null
  parentAccountId: number | string | null
  parentAccountCode: string | null
  parentAccountName: string | null
  parentAccountDisplay: string | null
  hierarchyLevel: number
  normalBalance: AccountingNormalBalance | null
  normalBalanceLabel: string | null
  status: ChartOfAccountsRegisterStatus
  statusLabel: string
  allowManualEntries: boolean
  isControlAccount: boolean
  isRetainedEarnings: boolean
  isSuspenseAccount: boolean
  description: string | null
  createdAt: string | null
  updatedAt: string | null
}

type ChartOfAccountsRegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type ChartOfAccountsRegisterFilterOption = {
  label: string
  value: string
}

type ChartOfAccountsRegisterFilterOptions = {
  statuses: ChartOfAccountsRegisterFilterOption[]
  accountTypes: ChartOfAccountsRegisterFilterOption[]
  accountSubTypes: ChartOfAccountsRegisterFilterOption[]
  quickFilters: ChartOfAccountsRegisterFilterOption[]
}

type ChartOfAccountsRegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

type ChartOfAccountsReferenceItem = {
  id: number | string
  code: string | null
  name: string | null
}

type ChartOfAccountsReferenceData = {
  parentAccounts: Array<
    ChartOfAccountsReferenceItem & {
      accountType: AccountingAccountType | null
      isActive: boolean
    }
  >
}

export type AccountingChartOfAccountsRegisterResult = {
  rows: AccountingChartOfAccountsRegisterRow[]
  metrics: ChartOfAccountsRegisterMetric[]
  filterOptions: ChartOfAccountsRegisterFilterOptions
  appliedFilters: {
    search: string
    statuses: ChartOfAccountsRegisterStatus[]
    accountTypes: AccountingAccountType[]
    accountSubTypes: AccountingAccountSubType[]
    controlAccountsOnly: boolean
    manualEntriesOnly: boolean
    retainedEarningsOnly: boolean
    parentAccountsOnly: boolean
    quickFilters: string[]
  }
  pagination: ChartOfAccountsRegisterPagination
  referenceData: ChartOfAccountsReferenceData
  totals: {
    totalAccounts: number
    filteredAccounts: number
    activeAccounts: number
    controlAccounts: number
    manualEntryAllowed: number
    parentAccounts: number
  }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const statusLabelMap = new Map<ChartOfAccountsRegisterStatus, string>([
  ['active', 'Active'],
  ['inactive', 'Inactive'],
])

const accountTypeLabelMap = new Map(
  ACCOUNT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const accountSubTypeLabelMap = new Map(
  ACCOUNT_SUB_TYPE_OPTIONS.map((option) => [option.value, option.label]),
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

const buildParentDisplay = (parentCode?: string | null, parentName?: string | null) => {
  const code = normalizeText(parentCode)
  const name = normalizeText(parentName)

  if (code && name) {
    return `${code} ${name}`
  }

  return code || name || null
}

const resolveParentDoc = (
  account: ChartOfAccountRegisterDoc,
  accountMap: Map<string, ChartOfAccountRegisterDoc>,
): ChartOfAccountRegisterDoc | null => {
  const parentId = getRelationshipId(account.parentAccount)

  if (!parentId) {
    return null
  }

  const cachedParent = accountMap.get(String(parentId))
  if (cachedParent) {
    return cachedParent
  }

  if (typeof account.parentAccount === 'object' && account.parentAccount !== null && 'id' in account.parentAccount) {
    return {
      id: account.parentAccount.id,
      code: account.parentAccount.code || null,
      name: account.parentAccount.name || null,
    }
  }

  return null
}

const getHierarchyLevel = (
  account: ChartOfAccountRegisterDoc,
  accountMap: Map<string, ChartOfAccountRegisterDoc>,
) => {
  let current = resolveParentDoc(account, accountMap)
  let level = 0
  const visited = new Set<string>()

  while (current && level < 25) {
    const currentId = String(current.id)
    if (visited.has(currentId)) {
      break
    }

    visited.add(currentId)
    level += 1
    current = resolveParentDoc(current, accountMap)
  }

  return level
}

const sortAccounts = (accounts: ChartOfAccountRegisterDoc[]) =>
  [...accounts].sort((left, right) => {
    const leftSortOrder = Number(left.sortOrder || 0)
    const rightSortOrder = Number(right.sortOrder || 0)

    if (leftSortOrder !== rightSortOrder) {
      return leftSortOrder - rightSortOrder
    }

    const leftCode = normalizeText(left.code)
    const rightCode = normalizeText(right.code)

    if (leftCode !== rightCode) {
      return leftCode.localeCompare(rightCode, undefined, { numeric: true, sensitivity: 'base' })
    }

    return normalizeText(left.name).localeCompare(normalizeText(right.name), undefined, {
      sensitivity: 'base',
    })
  })

const mapChartOfAccountRow = (
  account: ChartOfAccountRegisterDoc,
  accountMap: Map<string, ChartOfAccountRegisterDoc>,
): AccountingChartOfAccountsRegisterRow => {
  const parentAccount = resolveParentDoc(account, accountMap)
  const status: ChartOfAccountsRegisterStatus = account.isActive === false ? 'inactive' : 'active'

  return {
    id: account.id,
    code: account.code || null,
    name: account.name || null,
    accountType: account.accountType || null,
    accountTypeLabel: account.accountType ? accountTypeLabelMap.get(account.accountType) || account.accountType : null,
    accountSubType: account.accountSubType || null,
    accountSubTypeLabel: account.accountSubType
      ? accountSubTypeLabelMap.get(account.accountSubType) || account.accountSubType
      : null,
    parentAccountId: parentAccount?.id || null,
    parentAccountCode: parentAccount?.code || null,
    parentAccountName: parentAccount?.name || null,
    parentAccountDisplay: buildParentDisplay(parentAccount?.code, parentAccount?.name),
    hierarchyLevel: getHierarchyLevel(account, accountMap),
    normalBalance: account.normalBalance || null,
    normalBalanceLabel: account.normalBalance ? normalizeText(account.normalBalance) : null,
    status,
    statusLabel: statusLabelMap.get(status) || status,
    allowManualEntries: account.allowManualEntries !== false,
    isControlAccount: account.isControlAccount === true,
    isRetainedEarnings: account.isRetainedEarnings === true,
    isSuspenseAccount: account.isSuspenseAccount === true,
    description: account.description || null,
    createdAt: account.createdAt || null,
    updatedAt: account.updatedAt || null,
  }
}

const matchesSearch = (account: AccountingChartOfAccountsRegisterRow, search: string) => {
  if (!search) {
    return true
  }

  const haystacks = [
    account.code,
    account.name,
    account.accountTypeLabel,
    account.accountSubTypeLabel,
    account.parentAccountDisplay,
    account.normalBalance,
    account.isControlAccount ? 'control account' : '',
    account.allowManualEntries ? 'manual entries allowed' : 'manual entries disallowed',
    account.isRetainedEarnings ? 'retained earnings' : '',
    account.statusLabel,
  ]

  return haystacks.some((value) => normalizeSearch(value).includes(search))
}

const matchesStatuses = (
  account: AccountingChartOfAccountsRegisterRow,
  statuses: ChartOfAccountsRegisterStatus[],
) => {
  if (!statuses.length) {
    return true
  }

  return statuses.includes(account.status)
}

const matchesAccountTypes = (
  account: AccountingChartOfAccountsRegisterRow,
  accountTypes: AccountingAccountType[],
) => {
  if (!accountTypes.length) {
    return true
  }

  return Boolean(account.accountType && accountTypes.includes(account.accountType))
}

const matchesAccountSubTypes = (
  account: AccountingChartOfAccountsRegisterRow,
  accountSubTypes: AccountingAccountSubType[],
) => {
  if (!accountSubTypes.length) {
    return true
  }

  return Boolean(account.accountSubType && accountSubTypes.includes(account.accountSubType))
}

const matchesQuickFilters = (
  account: AccountingChartOfAccountsRegisterRow,
  quickFilters: string[],
) => {
  if (!quickFilters.length) {
    return true
  }

  return quickFilters.some((filterValue) => {
    if (filterValue.startsWith('status:')) {
      return account.status === filterValue.replace('status:', '')
    }

    if (filterValue === 'controlAccountsOnly:true') {
      return account.isControlAccount
    }

    if (filterValue === 'manualEntriesOnly:true') {
      return account.allowManualEntries
    }

    if (filterValue === 'retainedEarningsOnly:true') {
      return account.isRetainedEarnings
    }

    if (filterValue === 'parentAccountsOnly:true') {
      return !account.parentAccountId
    }

    return false
  })
}

const buildMetrics = (
  accounts: AccountingChartOfAccountsRegisterRow[],
): ChartOfAccountsRegisterMetric[] => {
  const activeAccounts = accounts.filter((account) => account.status === 'active').length
  const controlAccounts = accounts.filter((account) => account.isControlAccount).length
  const manualEntryAllowed = accounts.filter((account) => account.allowManualEntries).length
  const parentAccounts = accounts.filter((account) => !account.parentAccountId).length

  return [
    {
      id: 'active-accounts',
      label: 'Active Accounts',
      value: activeAccounts,
      change: 'Chart accounts currently available for use',
      trend: 'up',
    },
    {
      id: 'control-accounts',
      label: 'Control Accounts',
      value: controlAccounts,
      change: 'System-controlled ledger accounts',
      trend: 'neutral',
    },
    {
      id: 'manual-entry-allowed',
      label: 'Manual Entry Allowed',
      value: manualEntryAllowed,
      change: 'Accounts open to direct manual journals',
      trend: 'up',
    },
    {
      id: 'parent-accounts',
      label: 'Parent Accounts',
      value: parentAccounts,
      change: 'Hierarchy roots and grouping parents',
      trend: 'neutral',
    },
  ]
}

const buildFilterOptions = (): ChartOfAccountsRegisterFilterOptions => ({
  statuses: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ],
  accountTypes: ACCOUNT_TYPE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  accountSubTypes: ACCOUNT_SUB_TYPE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  quickFilters: [
    { label: 'Active', value: 'status:active' },
    { label: 'Control Accounts', value: 'controlAccountsOnly:true' },
    { label: 'Manual Entries', value: 'manualEntriesOnly:true' },
    { label: 'Retained Earnings', value: 'retainedEarningsOnly:true' },
  ],
})

const buildReferenceData = async (
  payload: Payload,
  rows: AccountingChartOfAccountsRegisterRow[],
): Promise<ChartOfAccountsReferenceData> => {
  const parentAccountIds = new Set(
    rows.filter((row) => !row.parentAccountId).map((row) => String(row.id)),
  )

  const parentAccountDocs = await findAllDocs<ChartOfAccountRegisterDoc>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    depth: 0,
    sort: 'code',
  })

  return {
    parentAccounts: sortAccounts(parentAccountDocs)
      .filter((account) => parentAccountIds.has(String(account.id)))
      .map((account) => ({
        id: account.id,
        code: account.code || null,
        name: account.name || null,
        accountType: account.accountType || null,
        isActive: account.isActive !== false,
      })),
  }
}

export class AccountingChartOfAccountsRegisterService {
  static async getChartOfAccountsRegister(
    payload: Payload,
    query: AccountingChartOfAccountsRegisterQuery = {},
  ): Promise<AccountingChartOfAccountsRegisterResult> {
    const normalizedSearch = normalizeSearch(query.search)
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const accountTypes = Array.isArray(query.accountTypes) ? query.accountTypes : []
    const accountSubTypes = Array.isArray(query.accountSubTypes) ? query.accountSubTypes : []
    const controlAccountsOnly = Boolean(query.controlAccountsOnly)
    const manualEntriesOnly = Boolean(query.manualEntriesOnly)
    const retainedEarningsOnly = Boolean(query.retainedEarningsOnly)
    const parentAccountsOnly = Boolean(query.parentAccountsOnly)
    const quickFilters = Array.isArray(query.quickFilters) ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean) : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const accountDocs = await findAllDocs<ChartOfAccountRegisterDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      depth: 1,
      sort: 'code',
    })

    const sortedDocs = sortAccounts(accountDocs)
    const accountMap = new Map(sortedDocs.map((account) => [String(account.id), account]))
    const allAccounts = sortedDocs.map((account) => mapChartOfAccountRow(account, accountMap))

    const filteredAccounts = allAccounts.filter((account) => {
      return (
        matchesSearch(account, normalizedSearch) &&
        matchesStatuses(account, statuses) &&
        matchesAccountTypes(account, accountTypes) &&
        matchesAccountSubTypes(account, accountSubTypes) &&
        (!controlAccountsOnly || account.isControlAccount) &&
        (!manualEntriesOnly || account.allowManualEntries) &&
        (!retainedEarningsOnly || account.isRetainedEarnings) &&
        (!parentAccountsOnly || !account.parentAccountId) &&
        matchesQuickFilters(account, quickFilters)
      )
    })

    const totalDocs = filteredAccounts.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filteredAccounts.slice(startIndex, startIndex + limit)
    const activeAccounts = allAccounts.filter((account) => account.status === 'active').length
    const controlAccounts = allAccounts.filter((account) => account.isControlAccount).length
    const manualEntryAllowed = allAccounts.filter((account) => account.allowManualEntries).length
    const parentAccounts = allAccounts.filter((account) => !account.parentAccountId).length

    return {
      rows,
      metrics: buildMetrics(allAccounts),
      filterOptions: buildFilterOptions(),
      appliedFilters: {
        search: normalizeText(query.search),
        statuses,
        accountTypes,
        accountSubTypes,
        controlAccountsOnly,
        manualEntriesOnly,
        retainedEarningsOnly,
        parentAccountsOnly,
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
      referenceData: await buildReferenceData(payload, allAccounts),
      totals: {
        totalAccounts: allAccounts.length,
        filteredAccounts: totalDocs,
        activeAccounts,
        controlAccounts,
        manualEntryAllowed,
        parentAccounts,
      },
    }
  }
}
