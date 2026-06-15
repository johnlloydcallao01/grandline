import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  TAX_CALCULATION_METHOD_OPTIONS,
  TAX_SCOPE_OPTIONS,
} from '../../constants/accounting'
import type { AccountingTaxCalculationMethod, AccountingTaxScope } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type TaxCodeRegisterDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  scope?: AccountingTaxScope | null
  rate?: number | null
  calculationMethod?: AccountingTaxCalculationMethod | null
  purchaseAccount?:
    | { id: number | string; code?: string | null; name?: string | null }
    | number
    | string
    | null
  salesAccount?:
    | { id: number | string; code?: string | null; name?: string | null }
    | number
    | string
    | null
  isActive?: boolean | null
  description?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountingTaxCodesRegisterQuery = {
  search?: string
  scopes?: AccountingTaxScope[]
  calculationMethods?: AccountingTaxCalculationMethod[]
  statuses?: string[]
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type AccountingTaxCodesRegisterRow = {
  id: number | string
  code: string | null
  name: string | null
  scope: AccountingTaxScope | null
  scopeLabel: string | null
  rate: number | null
  rateDisplay: string | null
  calculationMethod: AccountingTaxCalculationMethod | null
  calculationMethodLabel: string | null
  purchaseAccountId: number | string | null
  purchaseAccountCode: string | null
  purchaseAccountName: string | null
  salesAccountId: number | string | null
  salesAccountCode: string | null
  salesAccountName: string | null
  isActive: boolean
  isActiveLabel: string
  description: string | null
  createdAt: string | null
  updatedAt: string | null
}

type TaxCodesRegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type TaxCodesRegisterFilterOptions = {
  scopes: Array<{ label: string; value: string }>
  calculationMethods: Array<{ label: string; value: string }>
  quickFilters: Array<{ label: string; value: string }>
}

type TaxCodesRegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type AccountingTaxCodesRegisterResult = {
  rows: AccountingTaxCodesRegisterRow[]
  metrics: TaxCodesRegisterMetric[]
  filterOptions: TaxCodesRegisterFilterOptions
  appliedFilters: {
    search: string
    scopes: AccountingTaxScope[]
    calculationMethods: AccountingTaxCalculationMethod[]
    statuses: string[]
    quickFilters: string[]
  }
  pagination: TaxCodesRegisterPagination
  totals: {
    totalCodes: number
    filteredCodes: number
    activeCodes: number
    inactiveCodes: number
    salesScope: number
    purchaseScope: number
    bothScope: number
  }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const scopeLabelMap = new Map<AccountingTaxScope, string>(
  TAX_SCOPE_OPTIONS.map((option) => [option.value, option.label]),
)

const methodLabelMap = new Map<AccountingTaxCalculationMethod, string>(
  TAX_CALCULATION_METHOD_OPTIONS.map((option) => [option.value, option.label]),
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

const resolveAccount = (
  account: TaxCodeRegisterDoc['purchaseAccount'] | TaxCodeRegisterDoc['salesAccount'],
): { id: number | string | null; code: string | null; name: string | null } => {
  if (typeof account === 'object' && account !== null) {
    return {
      id: account.id ?? null,
      code: account.code || null,
      name: account.name || null,
    }
  }

  return { id: account ?? null, code: null, name: null }
}

const mapTaxCodeRow = (doc: TaxCodeRegisterDoc): AccountingTaxCodesRegisterRow => {
  const purchaseAcct = resolveAccount(doc.purchaseAccount)
  const salesAcct = resolveAccount(doc.salesAccount)
  const rate = doc.rate ?? null

  return {
    id: doc.id,
    code: doc.code || null,
    name: doc.name || null,
    scope: doc.scope || null,
    scopeLabel: doc.scope ? scopeLabelMap.get(doc.scope) || doc.scope : null,
    rate,
    rateDisplay: rate !== null ? `${rate}%` : null,
    calculationMethod: doc.calculationMethod || null,
    calculationMethodLabel: doc.calculationMethod ? methodLabelMap.get(doc.calculationMethod) || doc.calculationMethod : null,
    purchaseAccountId: purchaseAcct.id,
    purchaseAccountCode: purchaseAcct.code,
    purchaseAccountName: purchaseAcct.name,
    salesAccountId: salesAcct.id,
    salesAccountCode: salesAcct.code,
    salesAccountName: salesAcct.name,
    isActive: doc.isActive ?? true,
    isActiveLabel: doc.isActive !== false ? 'Active' : 'Inactive',
    description: doc.description || null,
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  }
}

const matchesSearch = (row: AccountingTaxCodesRegisterRow, search: string) => {
  if (!search) {
    return true
  }

  const haystacks = [
    row.code,
    row.name,
    row.scopeLabel,
    row.calculationMethodLabel,
    row.rateDisplay,
  ]

  return haystacks.some((value) => normalizeSearch(value).includes(search))
}

const matchesScopes = (
  row: AccountingTaxCodesRegisterRow,
  scopes: AccountingTaxScope[],
) => {
  if (!scopes.length) {
    return true
  }

  return Boolean(row.scope && scopes.includes(row.scope))
}

const matchesCalculationMethods = (
  row: AccountingTaxCodesRegisterRow,
  methods: AccountingTaxCalculationMethod[],
) => {
  if (!methods.length) {
    return true
  }

  return Boolean(row.calculationMethod && methods.includes(row.calculationMethod))
}

const matchesStatuses = (
  row: AccountingTaxCodesRegisterRow,
  statuses: string[],
) => {
  if (!statuses.length) {
    return true
  }

  const rowStatus = row.isActive ? 'active' : 'inactive'
  return statuses.includes(rowStatus)
}

const sortTaxCodes = (docs: TaxCodeRegisterDoc[]) =>
  [...docs].sort((left, right) => {
    const leftCode = normalizeText(left.code)
    const rightCode = normalizeText(right.code)

    return leftCode.localeCompare(rightCode, undefined, { numeric: true, sensitivity: 'base' })
  })

const buildMetrics = (
  rows: AccountingTaxCodesRegisterRow[],
): TaxCodesRegisterMetric[] => {
  const totalCodes = rows.length
  const activeCodes = rows.filter((row) => row.isActive).length
  const inactiveCodes = rows.filter((row) => !row.isActive).length
  const bothScope = rows.filter((row) => row.scope === 'both').length

  return [
    {
      id: 'total-codes',
      label: 'Total Tax Codes',
      value: totalCodes,
      change: 'Tax codes on record',
      trend: 'neutral',
    },
    {
      id: 'active-codes',
      label: 'Active',
      value: activeCodes,
      change: 'Codes available for transaction use',
      trend: 'up',
    },
    {
      id: 'inactive-codes',
      label: 'Inactive',
      value: inactiveCodes,
      change: 'Retained for historical usage',
      trend: 'down',
    },
    {
      id: 'both-scope',
      label: 'Sales & Purchase',
      value: bothScope,
      change: 'Codes usable on both sides',
      trend: 'neutral',
    },
  ]
}

const buildFilterOptions = (): TaxCodesRegisterFilterOptions => ({
  scopes: TAX_SCOPE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  calculationMethods: TAX_CALCULATION_METHOD_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  quickFilters: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Sales', value: 'scope:sales' },
    { label: 'Purchase', value: 'scope:purchase' },
    { label: 'Both', value: 'scope:both' },
  ],
})

export class AccountingTaxCodesRegisterService {
  static async getTaxCodesRegister(
    payload: Payload,
    query: AccountingTaxCodesRegisterQuery = {},
  ): Promise<AccountingTaxCodesRegisterResult> {
    const normalizedSearch = normalizeSearch(query.search)
    const scopes = Array.isArray(query.scopes) ? query.scopes : []
    const calculationMethods = Array.isArray(query.calculationMethods) ? query.calculationMethods : []
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const quickFilters = Array.isArray(query.quickFilters) ? query.quickFilters.map((value) => normalizeText(value)).filter(Boolean) : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const taxCodeDocs = await findAllDocs<TaxCodeRegisterDoc>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      depth: 1,
      sort: 'code',
    })

    const sortedDocs = sortTaxCodes(taxCodeDocs)
    const allRows = sortedDocs.map(mapTaxCodeRow)

    let filteredRows = allRows.filter((row) => {
      return (
        matchesSearch(row, normalizedSearch) &&
        matchesScopes(row, scopes) &&
        matchesCalculationMethods(row, calculationMethods) &&
        matchesStatuses(row, statuses)
      )
    })

    if (quickFilters.length > 0) {
      filteredRows = filteredRows.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue === 'active') {
            return row.isActive
          }

          if (filterValue === 'inactive') {
            return !row.isActive
          }

          if (filterValue.startsWith('scope:')) {
            return normalizeText(row.scope || '') === normalizeText(filterValue.replace('scope:', ''))
          }

          if (filterValue.startsWith('method:')) {
            return normalizeText(row.calculationMethod || '') === normalizeText(filterValue.replace('method:', ''))
          }

          return false
        }),
      )
    }

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filteredRows.slice(startIndex, startIndex + limit)

    return {
      rows,
      metrics: buildMetrics(allRows),
      filterOptions: buildFilterOptions(),
      appliedFilters: {
        search: normalizeText(query.search),
        scopes,
        calculationMethods,
        statuses,
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
        totalCodes: allRows.length,
        filteredCodes: totalDocs,
        activeCodes: allRows.filter((r) => r.isActive).length,
        inactiveCodes: allRows.filter((r) => !r.isActive).length,
        salesScope: allRows.filter((r) => r.scope === 'sales').length,
        purchaseScope: allRows.filter((r) => r.scope === 'purchase').length,
        bothScope: allRows.filter((r) => r.scope === 'both').length,
      },
    }
  }
}
