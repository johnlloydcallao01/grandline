import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  TAX_CALCULATION_METHOD_OPTIONS,
  TAX_SCOPE_OPTIONS,
} from '../../constants/accounting'
import type { AccountingTaxCalculationMethod, AccountingTaxScope } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'

export type TaxCodeGovernanceRow = {
  id: string
  code: string | null
  scope: AccountingTaxScope | null
  scopeLabel: string | null
  rate: number | null
  rateDisplay: string | null
  method: AccountingTaxCalculationMethod | null
  methodLabel: string | null
  accountMapping: string
  isActive: boolean
  statusLabel: string
  cells: Array<string | { text: string; emphasis?: boolean; tone?: string; align?: string }>
}

export type TaxCodeGovernanceResult = {
  rows: TaxCodeGovernanceRow[]
  metrics: any[]
  filterOptions: any
  appliedFilters: any
  pagination: any
  totals: any
}

const scopeLabelMap = new Map<AccountingTaxScope, string>(
  TAX_SCOPE_OPTIONS.map((option) => [option.value, option.label]),
)

const methodLabelMap = new Map<AccountingTaxCalculationMethod, string>(
  TAX_CALCULATION_METHOD_OPTIONS.map((option) => [option.value, option.label]),
)

export class AccountingTaxCodeGovernanceService {
  static async getGovernanceRegister(
    payload: Payload,
    query: {
      search?: string
      status?: string[]
      mapping?: string[]
      quickFilters?: string[]
      page?: number
      limit?: number
    } = {},
  ): Promise<TaxCodeGovernanceResult> {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 10))

    const taxCodes = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      depth: 1,
    })

    taxCodes.sort((a, b) => String(a.code || '').localeCompare(String(b.code || '')))

    const allRows: TaxCodeGovernanceRow[] = taxCodes.map(tc => {
      const hasSales = !!tc.salesAccount
      const hasPurchase = !!tc.purchaseAccount
      
      let accountMapping = 'No Active Mapping'
      if (hasSales && hasPurchase) {
        accountMapping = 'Sales + Purchase'
      } else if (hasSales) {
        accountMapping = 'Sales Only'
      } else if (hasPurchase) {
        accountMapping = 'Purchase Only'
      }

      return {
        id: tc.id,
        code: tc.code,
        scope: tc.scope,
        scopeLabel: tc.scope ? scopeLabelMap.get(tc.scope) || tc.scope : null,
        rate: tc.rate,
        rateDisplay: tc.rate !== null ? `${tc.rate}%` : null,
        method: tc.calculationMethod,
        methodLabel: tc.calculationMethod ? methodLabelMap.get(tc.calculationMethod) || tc.calculationMethod : null,
        accountMapping,
        isActive: tc.isActive !== false,
        statusLabel: tc.isActive !== false ? 'Active' : 'Inactive',
        cells: [
          { text: tc.code || '-', emphasis: true },
          tc.scope ? scopeLabelMap.get(tc.scope) || tc.scope : '-',
          { text: tc.rate !== null ? `${tc.rate}%` : '-', align: 'right' },
          tc.calculationMethod ? methodLabelMap.get(tc.calculationMethod) || tc.calculationMethod : '-',
          accountMapping,
          { text: tc.isActive !== false ? 'Active' : 'Inactive', tone: tc.isActive !== false ? 'green' : 'amber' }
        ]
      }
    })

    let filteredRows = allRows
    if (query.search) {
      const s = query.search.toLowerCase()
      filteredRows = filteredRows.filter(r => 
        (r.code && r.code.toLowerCase().includes(s)) ||
        (r.scopeLabel && r.scopeLabel.toLowerCase().includes(s)) ||
        (r.methodLabel && r.methodLabel.toLowerCase().includes(s)) ||
        (r.rateDisplay && r.rateDisplay.toLowerCase().includes(s)) ||
        r.accountMapping.toLowerCase().includes(s)
      )
    }

    if (query.status && query.status.length > 0) {
      filteredRows = filteredRows.filter(r => 
        (query.status!.includes('Active') && r.isActive) ||
        (query.status!.includes('Inactive') && !r.isActive)
      )
    }

    if (query.mapping && query.mapping.length > 0) {
      filteredRows = filteredRows.filter(r => {
        if (query.mapping!.includes('Mapped Accounts') && r.accountMapping !== 'No Active Mapping') return true
        if (query.mapping!.includes('Unmapped Accounts') && r.accountMapping === 'No Active Mapping') return true
        return false
      })
    }

    if (query.quickFilters && query.quickFilters.length > 0) {
      const selectedQuickFilters = query.quickFilters
        .map((value) => String(value || '').trim())
        .filter(Boolean)

      filteredRows = filteredRows.filter((row) =>
        selectedQuickFilters.some((filterValue) => {
          if (filterValue === 'Active') return row.isActive
          if (filterValue === 'Inactive') return !row.isActive
          if (filterValue === 'mapping:Mapped Accounts') return row.accountMapping !== 'No Active Mapping'
          if (filterValue === 'mapping:Unmapped Accounts') return row.accountMapping === 'No Active Mapping'
          return false
        }),
      )
    }

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const pagedRows = filteredRows.slice((page - 1) * limit, page * limit)

    let filteredCodesWithSales = 0
    let filteredCodesWithPurchase = 0
    let filteredBothMapped = 0
    let filteredInactiveCodes = 0

    filteredRows.forEach(r => {
      if (r.accountMapping === 'Sales + Purchase') { filteredBothMapped++; filteredCodesWithSales++; filteredCodesWithPurchase++; }
      else if (r.accountMapping === 'Sales Only') { filteredCodesWithSales++; }
      else if (r.accountMapping === 'Purchase Only') { filteredCodesWithPurchase++; }
      if (!r.isActive) filteredInactiveCodes++;
    })

    return {
      rows: pagedRows,
      metrics: [
        { label: 'Codes With Sales Account', value: filteredCodesWithSales.toString(), change: 'Configured with sales-side posting account', trend: filteredCodesWithSales > 0 ? 'up' : 'neutral' },
        { label: 'Codes With Purchase Account', value: filteredCodesWithPurchase.toString(), change: 'Configured with purchase-side posting account', trend: filteredCodesWithPurchase > 0 ? 'up' : 'neutral' },
        { label: 'Both Accounts Mapped', value: filteredBothMapped.toString(), change: 'Fully configured for both transaction sides', trend: 'neutral' },
        { label: 'Inactive Codes', value: filteredInactiveCodes.toString(), change: 'Retained for historical usage only', trend: 'down' },
      ],
      filterOptions: {
        status: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }],
        mapping: [{ label: 'Mapped Accounts', value: 'Mapped Accounts' }, { label: 'Unmapped Accounts', value: 'Unmapped Accounts' }],
        quickFilters: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
          { label: 'Mapped Accounts', value: 'mapping:Mapped Accounts' },
          { label: 'Unmapped Accounts', value: 'mapping:Unmapped Accounts' },
        ],
      },
      appliedFilters: {
        search: query.search || '',
        status: query.status || [],
        mapping: query.mapping || [],
        quickFilters: query.quickFilters || [],
      },
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages
      },
      totals: {
        totalRows: taxCodes.length,
        filteredRows: totalDocs,
      }
    }
  }
}
