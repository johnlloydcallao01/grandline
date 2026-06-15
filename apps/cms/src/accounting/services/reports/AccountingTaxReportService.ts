import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { TAX_CALCULATION_METHOD_OPTIONS, TAX_SCOPE_OPTIONS } from '../../constants/accounting'
import type { AccountingTaxSummaryRow } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'

type TaxAccumulator = AccountingTaxSummaryRow

const scopeLabelMap = new Map<string, string>(TAX_SCOPE_OPTIONS.map((option) => [option.value, option.label]))
const methodLabelMap = new Map<string, string>(TAX_CALCULATION_METHOD_OPTIONS.map((option) => [option.value, option.label]))
const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

const buildKey = (taxCodeId: number | string | null | undefined, taxScope: string | null | undefined) =>
  `${String(taxCodeId || 'none')}::${String(taxScope || 'unknown')}`

const upsertAccumulator = (
  map: Map<string, TaxAccumulator>,
  nextRow: Omit<TaxAccumulator, 'sourceDocumentCount'>,
) => {
  const key = buildKey(nextRow.taxCodeId, nextRow.taxScope)
  const current = map.get(key)

  if (!current) {
    map.set(key, {
      ...nextRow,
      sourceDocumentCount: 1,
    })
    return
  }

  current.taxableAmount = normalizeAmount(current.taxableAmount + nextRow.taxableAmount)
  current.taxAmount = normalizeAmount(current.taxAmount + nextRow.taxAmount)
  current.sourceDocumentCount += 1
}

export class AccountingTaxReportService {
  static async getTaxSummary(
    payload: Payload,
    query: {
      search?: string
      scopes?: string[]
      calculationMethods?: string[]
      quickFilters?: string[]
      page?: number
      limit?: number
    } = {},
  ) {
    const {
      search = '',
      scopes = [],
      calculationMethods = [],
      quickFilters = [],
      page = 1,
      limit = 10,
    } = query

    const [invoiceLines, billLines, expenses] = await Promise.all([
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
        depth: 2,
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
        depth: 2,
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
        depth: 1,
        where: {
          status: {
            equals: 'posted',
          },
        },
      }),
    ])

    const accumulator = new Map<string, TaxAccumulator>()

    for (const line of invoiceLines) {
      const invoice = typeof line.invoice === 'object' ? line.invoice : null
      const taxCode = typeof line.taxCode === 'object' ? line.taxCode : null

      if (!invoice || !taxCode || !['posted', 'partially_paid', 'paid'].includes(String(invoice.status || ''))) {
        continue
      }

      upsertAccumulator(
        accumulator,
        {
          taxCodeId: getRelationshipId(line.taxCode),
          taxCode: taxCode.code || null,
          taxName: taxCode.name || null,
          taxScope: taxCode.scope || null,
          calculationMethod: taxCode.calculationMethod || null,
          taxableAmount: normalizeAmount(line.lineSubtotal),
          taxAmount: normalizeAmount(line.lineTax),
        },
      )
    }

    for (const line of billLines) {
      const bill = typeof line.bill === 'object' ? line.bill : null
      const taxCode = typeof line.taxCode === 'object' ? line.taxCode : null

      if (!bill || !taxCode || !['posted', 'partially_paid', 'paid'].includes(String(bill.status || ''))) {
        continue
      }

      upsertAccumulator(
        accumulator,
        {
          taxCodeId: getRelationshipId(line.taxCode),
          taxCode: taxCode.code || null,
          taxName: taxCode.name || null,
          taxScope: taxCode.scope || null,
          calculationMethod: taxCode.calculationMethod || null,
          taxableAmount: normalizeAmount(line.lineSubtotal),
          taxAmount: normalizeAmount(line.lineTax),
        },
      )
    }

    for (const expense of expenses) {
      const taxCode = typeof expense.taxCode === 'object' ? expense.taxCode : null

      if (!taxCode || normalizeAmount(expense.taxTotal) <= 0) {
        continue
      }

      upsertAccumulator(
        accumulator,
        {
          taxCodeId: getRelationshipId(expense.taxCode),
          taxCode: taxCode.code || null,
          taxName: taxCode.name || null,
          taxScope: taxCode.scope || null,
          calculationMethod: taxCode.calculationMethod || null,
          taxableAmount: normalizeAmount(expense.subtotal),
          taxAmount: normalizeAmount(expense.taxTotal),
        },
      )
    }

    let allRows = Array.from(accumulator.values()).sort((left, right) =>
      String(left.taxCode || '').localeCompare(String(right.taxCode || '')),
    )

    const searchLower = normalizeSearch(search)
    const activeScopes = scopes.filter(Boolean)
    const activeCalculationMethods = calculationMethods.filter(Boolean)

    allRows = allRows.filter((r) => {
      const matchSearch =
        !searchLower ||
        normalizeSearch(r.taxCode).includes(searchLower) ||
        normalizeSearch(r.taxName).includes(searchLower) ||
        normalizeSearch(r.taxScope).includes(searchLower) ||
        normalizeSearch(r.calculationMethod).includes(searchLower)
      const matchScope = activeScopes.length === 0 || activeScopes.includes(String(r.taxScope || ''))
      const matchCalculationMethod =
        activeCalculationMethods.length === 0 ||
        activeCalculationMethods.includes(String(r.calculationMethod || ''))
      return matchSearch && matchScope && matchCalculationMethod
    })

    if (quickFilters.length > 0) {
      const selectedQuickFilters = quickFilters
        .map((value) => String(value || '').trim())
        .filter(Boolean)

      allRows = allRows.filter((row) =>
        selectedQuickFilters.some((filterValue) => {
          if (filterValue.startsWith('scope:')) {
            return normalizeSearch(row.taxScope) === normalizeSearch(filterValue.replace('scope:', ''))
          }

          if (filterValue.startsWith('method:')) {
            return normalizeSearch(row.calculationMethod) === normalizeSearch(filterValue.replace('method:', ''))
          }

          return false
        }),
      )
    }

    const totalRows = allRows.length
    const totalPages = Math.ceil(totalRows / limit)
    const pagedRows = allRows.slice((page - 1) * limit, page * limit)

    let totalTaxable = 0
    let totalTax = 0
    let totalSourceDocs = 0

    const formattedRows = pagedRows.map((r, idx) => {
      const rowId = `tax-summary-${page}-${idx}`
      
      return {
        id: rowId,
        taxCode: r.taxCode,
        taxName: r.taxName,
        taxScope: r.taxScope,
        calculationMethod: r.calculationMethod,
        taxableAmount: r.taxableAmount,
        taxAmount: r.taxAmount,
        sourceDocumentCount: r.sourceDocumentCount,
        cells: [
          { text: String(r.taxCode || '-'), emphasis: true },
          String(r.taxName || '-'),
          String(r.taxScope || '-'),
          String(r.calculationMethod || '-'),
          { text: `PHP ${r.taxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, emphasis: true, align: 'right' },
          { text: `PHP ${r.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, align: 'right' },
        ]
      }
    })

    allRows.forEach(r => {
      totalTaxable += r.taxableAmount
      totalTax += r.taxAmount
      totalSourceDocs += r.sourceDocumentCount
    })

    const availableScopes = Array.from(
      new Set(Array.from(accumulator.values()).map((r) => String(r.taxScope || '').trim()).filter(Boolean)),
    ).sort((left, right) => left.localeCompare(right))
    const availableCalculationMethods = Array.from(
      new Set(
        Array.from(accumulator.values())
          .map((r) => String(r.calculationMethod || '').trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right))

    return {
      rows: formattedRows,
      metrics: [
        {
          id: 'summary-rows',
          label: 'Summary Rows',
          value: totalRows.toString(),
          change: 'Distinct tax code & scope combinations',
          trend: 'neutral',
        },
        {
          id: 'taxable-base',
          label: 'Taxable Base',
          value: `PHP ${(totalTaxable / 1000000).toFixed(2)}M`,
          change: 'Posted sources included in report',
          trend: 'up',
        },
        {
          id: 'tax-amount',
          label: 'Tax Amount',
          value: `PHP ${totalTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: 'Total tax from supported records',
          trend: 'up',
        },
        {
          id: 'source-documents',
          label: 'Source Documents',
          value: totalSourceDocs.toString(),
          change: 'Documents contributing to summary',
          trend: 'neutral',
        },
      ],
      filterOptions: {
        scopes: availableScopes.map((value) => ({
          label: scopeLabelMap.get(value) || value.charAt(0).toUpperCase() + value.slice(1),
          value,
        })),
        calculationMethods: availableCalculationMethods.map((value) => ({
          label: methodLabelMap.get(value) || value.charAt(0).toUpperCase() + value.slice(1),
          value,
        })),
        quickFilters: [
          ...availableScopes.map((value) => ({
            label: scopeLabelMap.get(value) || value.charAt(0).toUpperCase() + value.slice(1),
            value: `scope:${value}`,
          })),
          ...availableCalculationMethods.map((value) => ({
            label: methodLabelMap.get(value) || value.charAt(0).toUpperCase() + value.slice(1),
            value: `method:${value}`,
          })),
        ],
      },
      appliedFilters: {
        search,
        scopes: activeScopes,
        calculationMethods: activeCalculationMethods,
        quickFilters,
      },
      pagination: {
        page,
        limit,
        totalDocs: totalRows,
        totalPages: totalPages === 0 ? 1 : totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
      totals: {
        totalRows,
        totalTaxable,
        totalTax,
      },
    }
  }
}
