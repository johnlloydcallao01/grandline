import type { Payload } from 'payload'
import type { AccountingPartyStatus, AccountingVendorType } from '../../types/accounting'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_PARTY_STATUS_OPTIONS,
  VENDOR_TYPE_OPTIONS,
} from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

type VendorRegisterDoc = {
  id: number | string
  vendorCode?: string | null
  displayName?: string | null
  legalName?: string | null
  vendorType?: AccountingVendorType | null
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
  status?: AccountingPartyStatus | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type AccountingVendorRegisterQuery = {
  search?: string
  vendorTypes?: AccountingVendorType[]
  statuses?: AccountingPartyStatus[]
  quickFilters?: string[]
  page?: number
  limit?: number
}

export type AccountingVendorRegisterRow = {
  id: number | string
  vendorCode: string | null
  displayName: string | null
  legalName: string | null
  vendorType: AccountingVendorType | null
  vendorTypeLabel: string | null
  email: string | null
  currency: string | null
  paymentTerms: string | null
  currencyReferenceId: number | string | null
  paymentTermReferenceId: number | string | null
  status: AccountingPartyStatus | null
  statusLabel: string | null
  createdAt: string | null
  updatedAt: string | null
}

type VendorRegisterReferenceItem = {
  id: number | string
  code: string | null
  name: string | null
}

type VendorRegisterReferenceData = {
  currencies: VendorRegisterReferenceItem[]
  paymentTerms: Array<
    VendorRegisterReferenceItem & {
      dueInDays: number
    }
  >
}

type VendorRegisterMetric = {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

type VendorRegisterFilterOption = {
  label: string
  value: string
}

type VendorRegisterFilterOptions = {
  statuses: VendorRegisterFilterOption[]
  vendorTypes: VendorRegisterFilterOption[]
  quickFilters: VendorRegisterFilterOption[]
}

type VendorRegisterPagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type AccountingVendorRegisterResult = {
  rows: AccountingVendorRegisterRow[]
  metrics: VendorRegisterMetric[]
  filterOptions: VendorRegisterFilterOptions
  appliedFilters: {
    search: string
    statuses: AccountingPartyStatus[]
    vendorTypes: AccountingVendorType[]
    quickFilters: string[]
  }
  pagination: VendorRegisterPagination
  referenceData: VendorRegisterReferenceData
  totals: {
    totalVendors: number
    filteredVendors: number
  }
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const VENDOR_TYPE_LABELS: Record<string, string> = {
  contractor: 'Service Provider',
  utility: 'Utility Provider',
}

const statusLabelMap = new Map(
  ACCOUNTING_PARTY_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const vendorTypeLabelMap = new Map(
  VENDOR_TYPE_OPTIONS.map((option) => [
    option.value,
    VENDOR_TYPE_LABELS[option.value] || option.label,
  ]),
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

const sortVendors = (vendors: VendorRegisterDoc[]) =>
  [...vendors].sort((left, right) => {
    const leftName = normalizeText(left.displayName).toLowerCase()
    const rightName = normalizeText(right.displayName).toLowerCase()

    if (leftName !== rightName) {
      return leftName.localeCompare(rightName)
    }

    return normalizeText(left.vendorCode).localeCompare(normalizeText(right.vendorCode))
  })

const mapVendorRow = (vendor: VendorRegisterDoc): AccountingVendorRegisterRow => {
  return {
    id: vendor.id,
    vendorCode: vendor.vendorCode || null,
    displayName: vendor.displayName || null,
    legalName: vendor.legalName || null,
    vendorType: vendor.vendorType || null,
    vendorTypeLabel: vendor.vendorType ? vendorTypeLabelMap.get(vendor.vendorType) || vendor.vendorType : null,
    email: vendor.email || null,
    currency: vendor.currencyReference?.code || null,
    paymentTerms: vendor.paymentTermReference?.name || null,
    currencyReferenceId: vendor.currencyReference?.id || null,
    paymentTermReferenceId: vendor.paymentTermReference?.id || null,
    status: vendor.status || null,
    statusLabel: vendor.status ? statusLabelMap.get(vendor.status) || vendor.status : null,
    createdAt: vendor.createdAt || null,
    updatedAt: vendor.updatedAt || null,
  }
}

const matchesSearch = (vendor: AccountingVendorRegisterRow, search: string) => {
  if (!search) {
    return true
  }

  const haystacks = [
    vendor.vendorCode,
    vendor.displayName,
    vendor.legalName,
    vendor.email,
    vendor.vendorTypeLabel,
    vendor.statusLabel,
  ]

  return haystacks.some((value) => normalizeSearch(value).includes(search))
}

const matchesVendorTypes = (
  vendor: AccountingVendorRegisterRow,
  vendorTypes: AccountingVendorType[],
) => {
  if (!vendorTypes.length) {
    return true
  }

  return Boolean(vendor.vendorType && vendorTypes.includes(vendor.vendorType))
}

const matchesStatuses = (
  vendor: AccountingVendorRegisterRow,
  statuses: AccountingPartyStatus[],
) => {
  if (!statuses.length) {
    return true
  }

  return Boolean(vendor.status && statuses.includes(vendor.status))
}

const matchesQuickFilters = (
  vendor: AccountingVendorRegisterRow,
  quickFilters: string[],
) => {
  if (!quickFilters.length) {
    return true
  }

  return quickFilters.some((filterValue) => {
    if (filterValue.startsWith('status:')) {
      return Boolean(vendor.status && vendor.status === filterValue.replace('status:', ''))
    }

    if (filterValue.startsWith('vendorType:')) {
      return Boolean(
        vendor.vendorType &&
          vendor.vendorType === filterValue.replace('vendorType:', ''),
      )
    }

    return false
  })
}

const buildMetrics = (vendors: AccountingVendorRegisterRow[]): VendorRegisterMetric[] => {
  const activeVendors = vendors.filter((vendor) => vendor.status === 'active').length
  const suppliers = vendors.filter((vendor) => vendor.vendorType === 'supplier').length
  const serviceProviders = vendors.filter(
    (vendor) => vendor.vendorType === 'contractor' || vendor.vendorType === 'utility',
  ).length
  const inactiveVendors = vendors.filter((vendor) =>
    vendor.status === 'inactive' || vendor.status === 'archived',
  ).length

  return [
    {
      id: 'active-vendors',
      label: 'Active Vendors',
      value: activeVendors,
      change: 'Vendors available for AP and expense use',
      trend: 'up',
    },
    {
      id: 'supplier-vendors',
      label: 'Suppliers',
      value: suppliers,
      change: 'Vendors classified as suppliers',
      trend: 'neutral',
    },
    {
      id: 'service-provider-vendors',
      label: 'Service Providers',
      value: serviceProviders,
      change: 'Vendors used for services and utilities',
      trend: 'neutral',
    },
    {
      id: 'inactive-vendors',
      label: 'Inactive Vendors',
      value: inactiveVendors,
      change: 'Retained for historical payables',
      trend: 'down',
    },
  ]
}

const buildFilterOptions = (): VendorRegisterFilterOptions => ({
  statuses: ACCOUNTING_PARTY_STATUS_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
  vendorTypes: VENDOR_TYPE_OPTIONS.map((option) => ({
    label: VENDOR_TYPE_LABELS[option.value] || option.label,
    value: option.value,
  })),
  quickFilters: [
    { label: 'Active', value: 'status:active' },
    { label: 'Supplier', value: 'vendorType:supplier' },
    { label: 'Contractor', value: 'vendorType:contractor' },
    { label: 'Utility', value: 'vendorType:utility' },
  ],
})

const buildReferenceData = async (payload: Payload): Promise<VendorRegisterReferenceData> => {
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

export class AccountingVendorRegisterService {
  static async getVendorMasterRegister(
    payload: Payload,
    query: AccountingVendorRegisterQuery = {},
  ): Promise<AccountingVendorRegisterResult> {
    const normalizedSearch = normalizeSearch(query.search)
    const vendorTypes = Array.isArray(query.vendorTypes) ? query.vendorTypes : []
    const statuses = Array.isArray(query.statuses) ? query.statuses : []
    const quickFilters = Array.isArray(query.quickFilters) ? query.quickFilters : []
    const limit = sanitizeLimit(query.limit)
    const requestedPage = sanitizePage(query.page)

    const [vendorDocs, referenceData] = await Promise.all([
      findAllDocs<VendorRegisterDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
        depth: 1,
        sort: 'displayName',
      }),
      buildReferenceData(payload),
    ])

    const allVendors = sortVendors(vendorDocs).map(mapVendorRow)
    const filteredVendors = allVendors.filter((vendor) => {
      return (
        matchesSearch(vendor, normalizedSearch) &&
        matchesVendorTypes(vendor, vendorTypes) &&
        matchesStatuses(vendor, statuses) &&
        matchesQuickFilters(vendor, quickFilters)
      )
    })

    const totalDocs = filteredVendors.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const page = Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * limit
    const rows = filteredVendors.slice(startIndex, startIndex + limit)

    return {
      rows,
      metrics: buildMetrics(allVendors),
      filterOptions: buildFilterOptions(),
      appliedFilters: {
        search: normalizeText(query.search),
        statuses,
        vendorTypes,
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
        totalVendors: allVendors.length,
        filteredVendors: totalDocs,
      },
    }
  }
}
