import type { Payload } from 'payload'
import type { AccountingCustomerType, AccountingPartyStatus } from '../../types/accounting'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PARTY_STATUS_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
} from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type CustomerRegisterDoc = {
  id: number | string
  customerCode?: string | null
  displayName?: string | null
  legalName?: string | null
  customerType?: AccountingCustomerType | null
  email?: string | null
  currencyReference?: {
    id: number | string
    code?: string | null
    name?: string | null
  } | null
  paymentTermReference?: {
    id: number | string
    code?: string | null
    name?: string | null
    dueInDays?: number | null
  } | null
  creditLimit?: number | null
  status?: AccountingPartyStatus | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountingCustomerRegisterQuery = {
  search?: string
  customerTypes?: AccountingCustomerType[]
  statuses?: AccountingPartyStatus[]
  hasCreditLimit?: boolean
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type AccountingCustomerRegisterRow = {
  id: number | string
  customerCode: string | null
  displayName: string | null
  legalName: string | null
  customerType: AccountingCustomerType | null
  customerTypeLabel: string | null
  email: string | null
  currency: string | null
  paymentTerms: string | null
  currencyReferenceId: number | string | null
  paymentTermReferenceId: number | string | null
  creditLimit: number
  hasCreditLimit: boolean
  status: AccountingPartyStatus | null
  statusLabel: string | null
  createdAt: string | null
  updatedAt: string | null
}

type CustomerRegisterReferenceItem = {
  id: number | string
  code: string | null
  name: string | null
}

type CustomerRegisterReferenceData = {
  currencies: CustomerRegisterReferenceItem[]
  paymentTerms: Array<
    CustomerRegisterReferenceItem & {
      dueInDays: number
    }
  >
}

type CustomerRegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type CustomerRegisterFilterOption = {
  label: string
  value: string
}

type CustomerRegisterFilterOptions = {
  statuses: CustomerRegisterFilterOption[]
  customerTypes: CustomerRegisterFilterOption[]
  quickFilters: CustomerRegisterFilterOption[]
}

type CustomerRegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type AccountingCustomerRegisterResult = {
  rows: AccountingCustomerRegisterRow[]
  metrics: CustomerRegisterMetric[]
  filterOptions: CustomerRegisterFilterOptions
  appliedFilters: {
    search: string
    statuses: AccountingPartyStatus[]
    customerTypes: AccountingCustomerType[]
    hasCreditLimit: boolean
    quickFilters: string[]
  }
  pagination: CustomerRegisterPagination
  referenceData: CustomerRegisterReferenceData
  totals: {
    totalCustomers: number
    filteredCustomers: number
  }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  company: 'Corporate',
}

const statusLabelMap = new Map(
  ACCOUNTING_PARTY_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const customerTypeLabelMap = new Map(
  CUSTOMER_TYPE_OPTIONS.map((option) => [
    option.value,
    CUSTOMER_TYPE_LABELS[option.value] || option.label,
  ]),
)

const normalizeText = (value?: string | null) => String(value || '').trim()

const normalizeSearch = (value?: string | null) => normalizeText(value).toLowerCase()

const normalizeCreditLimit = (value?: number | null) => {
  const numericValue = Number(value || 0)
  return Number.isFinite(numericValue) ? numericValue : 0
}

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

const sortCustomers = (customers: CustomerRegisterDoc[]) =>
  [...customers].sort((left, right) => {
    const leftName = normalizeText(left.displayName).toLowerCase()
    const rightName = normalizeText(right.displayName).toLowerCase()

    if (leftName !== rightName) {
      return leftName.localeCompare(rightName)
    }

    return normalizeText(left.customerCode).localeCompare(normalizeText(right.customerCode))
  })

const mapCustomerRow = (customer: CustomerRegisterDoc): AccountingCustomerRegisterRow => {
  const creditLimit = normalizeCreditLimit(customer.creditLimit)

  return {
    id: customer.id,
    customerCode: customer.customerCode || null,
    displayName: customer.displayName || null,
    legalName: customer.legalName || null,
    customerType: customer.customerType || null,
    customerTypeLabel: customer.customerType ? customerTypeLabelMap.get(customer.customerType) || customer.customerType : null,
    email: customer.email || null,
    currency: customer.currencyReference?.code || null,
    paymentTerms: customer.paymentTermReference?.name || null,
    currencyReferenceId: customer.currencyReference?.id || null,
    paymentTermReferenceId: customer.paymentTermReference?.id || null,
    creditLimit,
    hasCreditLimit: creditLimit > 0,
    status: customer.status || null,
    statusLabel: customer.status ? statusLabelMap.get(customer.status) || customer.status : null,
    createdAt: customer.createdAt || null,
    updatedAt: customer.updatedAt || null,
  }
}

const matchesSearch = (customer: AccountingCustomerRegisterRow, search: string) => {
  if (!search) {
    return true
  }

  const haystacks = [
    customer.customerCode,
    customer.displayName,
    customer.legalName,
    customer.email,
    customer.customerTypeLabel,
    customer.statusLabel,
  ]

  return haystacks.some((value) => normalizeSearch(value).includes(search))
}

const matchesCustomerTypes = (
  customer: AccountingCustomerRegisterRow,
  customerTypes: AccountingCustomerType[],
) => {
  if (!customerTypes.length) {
    return true
  }

  return Boolean(customer.customerType && customerTypes.includes(customer.customerType))
}

const matchesStatuses = (
  customer: AccountingCustomerRegisterRow,
  statuses: AccountingPartyStatus[],
) => {
  if (!statuses.length) {
    return true
  }

  return Boolean(customer.status && statuses.includes(customer.status))
}

const matchesCreditLimit = (
  customer: AccountingCustomerRegisterRow,
  hasCreditLimit: boolean,
) => {
  if (!hasCreditLimit) {
    return true
  }

  return customer.hasCreditLimit
}

const matchesQuickFilters = (
  customer: AccountingCustomerRegisterRow,
  quickFilters: string[],
) => {
  if (!quickFilters.length) {
    return true
  }

  return quickFilters.some((filterValue) => {
    if (filterValue === 'hasCreditLimit:true') {
      return customer.hasCreditLimit
    }

    if (filterValue.startsWith('status:')) {
      return Boolean(customer.status && customer.status === filterValue.replace('status:', ''))
    }

    if (filterValue.startsWith('customerType:')) {
      return Boolean(
        customer.customerType &&
          customer.customerType === filterValue.replace('customerType:', ''),
      )
    }

    return false
  })
}

const buildMetrics = (customers: AccountingCustomerRegisterRow[]): CustomerRegisterMetric[] => {
  const activeCustomers = customers.filter((customer) => customer.status === 'active').length
  const corporateCustomers = customers.filter((customer) => customer.customerType === 'company').length
  const withCreditLimits = customers.filter((customer) => customer.hasCreditLimit).length
  const inactiveCustomers = customers.filter((customer) =>
    customer.status === 'inactive' || customer.status === 'archived',
  ).length

  return [
    {
      id: 'active-customers',
      label: 'Active Customers',
      value: activeCustomers,
      change: 'Customers available for receivables workflows',
      trend: 'up',
    },
    {
      id: 'corporate-customers',
      label: 'Corporate Customers',
      value: corporateCustomers,
      change: 'Customers flagged as company payers',
      trend: 'neutral',
    },
    {
      id: 'with-credit-limits',
      label: 'With Credit Limits',
      value: withCreditLimits,
      change: 'Profiles carrying a defined credit limit',
      trend: 'up',
    },
    {
      id: 'inactive-customers',
      label: 'Inactive Customers',
      value: inactiveCustomers,
      change: 'Retained for historical transactions',
      trend: 'down',
    },
  ]
}

const buildFilterOptions = (): CustomerRegisterFilterOptions => ({
  statuses: ACCOUNTING_PARTY_STATUS_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  customerTypes: CUSTOMER_TYPE_OPTIONS.map((option) => ({
    label: CUSTOMER_TYPE_LABELS[option.value] || option.label,
    value: option.value,
  })),
  quickFilters: [
    { label: 'Active', value: 'status:active' },
    { label: 'Individual', value: 'customerType:individual' },
    { label: 'Corporate', value: 'customerType:company' },
    { label: 'With Credit Limit', value: 'hasCreditLimit:true' },
  ],
})

const buildReferenceData = async (payload: Payload): Promise<CustomerRegisterReferenceData> => {
  const [currencies, paymentTerms] = await Promise.all([
    findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.currencies,
      depth: 0,
      sort: 'code',
    }),
    findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentTerms,
      depth: 0,
      sort: 'dueInDays',
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
    paymentTerms: paymentTerms
      .filter((paymentTerm) => paymentTerm?.isActive !== false)
      .map((paymentTerm) => ({
        id: paymentTerm.id,
        code: paymentTerm.code || null,
        name: paymentTerm.name || null,
        dueInDays: Number(paymentTerm.dueInDays || 0),
      })),
  }
}

export class AccountingCustomerRegisterService {
  static async getCustomerMasterRegister(
    payload: Payload,
    query: AccountingCustomerRegisterQuery = {},
  ): Promise<AccountingCustomerRegisterResult> {
    const normalizedSearch = normalizeSearch(query.search)
    const customerTypes = Array.isArray(query.customerTypes) ? query.customerTypes : []
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const hasCreditLimit = Boolean(query.hasCreditLimit)
    const quickFilters = Array.isArray(query.quickFilters) ? query.quickFilters : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const [customerDocs, referenceData] = await Promise.all([
      findAllDocs<CustomerRegisterDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.customers,
        depth: 1,
        sort: 'displayName',
      }),
      buildReferenceData(payload),
    ])

    const allCustomers = sortCustomers(customerDocs).map(mapCustomerRow)
    const filteredCustomers = allCustomers.filter((customer) => {
      return (
        matchesSearch(customer, normalizedSearch) &&
        matchesCustomerTypes(customer, customerTypes) &&
        matchesStatuses(customer, statuses) &&
        matchesCreditLimit(customer, hasCreditLimit) &&
        matchesQuickFilters(customer, quickFilters)
      )
    })

    const totalDocs = filteredCustomers.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filteredCustomers.slice(startIndex, startIndex + limit)

    return {
      rows,
      metrics: buildMetrics(allCustomers),
      filterOptions: buildFilterOptions(),
      appliedFilters: {
        search: normalizeText(query.search),
        statuses,
        customerTypes,
        hasCreditLimit,
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
      referenceData,
      totals: {
        totalCustomers: allCustomers.length,
        filteredCustomers: totalDocs,
      },
    }
  }
}
