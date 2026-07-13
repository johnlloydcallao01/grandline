import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export type CurrencyRecord = {
  id: number | string
  code: string
  name: string
  symbol?: string | null
  isBaseCurrency: boolean
  isActive: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export type PaymentTermRecord = {
  id: number | string
  code: string
  name: string
  dueInDays: number
  description?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ReferenceOverviewCounts = {
  bankAccounts: number
  activeBankAccounts: number
  taxCodes: number
  activeTaxCodes: number
  currencies: number
  activeCurrencies: number
  baseCurrencies: number
  paymentTerms: number
  activePaymentTerms: number
  branches: number
  departments: number
  locations: number
  chartOfAccounts: number
}

export type FinancialReferenceStateResponse = {
  currencies: CurrencyRecord[]
  paymentTerms: PaymentTermRecord[]
  counts: ReferenceOverviewCounts
}

async function findCount(payload: unknown, collection: string, activeField?: string): Promise<{ total: number; active: number }> {
  const all = await (payload as any).find({
    collection,
    depth: 0,
    limit: 0,
    overrideAccess: true,
  })
  const total = all.totalDocs ?? 0
  let active = total
  if (activeField) {
    const activeDocs = await (payload as any).find({
      collection,
      depth: 0,
      limit: 0,
      overrideAccess: true,
      where: { [activeField]: { equals: true } },
    })
    active = activeDocs.totalDocs ?? 0
  }
  return { total, active }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)

    const [currencies, paymentTerms, bankAccountCounts, taxCodeCounts, branchCounts, deptCounts, locCounts, coaCounts] =
      await Promise.all([
        (payload as any).find({
          collection: ACCOUNTING_COLLECTION_SLUGS.currencies,
          depth: 0,
          sort: 'code',
          limit: 200,
          overrideAccess: true,
        }),
        (payload as any).find({
          collection: ACCOUNTING_COLLECTION_SLUGS.paymentTerms,
          depth: 0,
          sort: 'dueInDays',
          limit: 200,
          overrideAccess: true,
        }),
        findCount(payload, ACCOUNTING_COLLECTION_SLUGS.bankAccounts, 'isActive'),
        findCount(payload, ACCOUNTING_COLLECTION_SLUGS.taxCodes, 'isActive'),
        (payload as any).find({
          collection: ACCOUNTING_COLLECTION_SLUGS.branches,
          depth: 0,
          limit: 0,
          overrideAccess: true,
        }),
        (payload as any).find({
          collection: ACCOUNTING_COLLECTION_SLUGS.departments,
          depth: 0,
          limit: 0,
          overrideAccess: true,
        }),
        (payload as any).find({
          collection: ACCOUNTING_COLLECTION_SLUGS.locations,
          depth: 0,
          limit: 0,
          overrideAccess: true,
        }),
        (payload as any).find({
          collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
          depth: 0,
          limit: 0,
          overrideAccess: true,
        }),
      ])

    const currencyDocs = (currencies?.docs ?? []) as CurrencyRecord[]
    const paymentTermDocs = (paymentTerms?.docs ?? []) as PaymentTermRecord[]

    const response: FinancialReferenceStateResponse = {
      currencies: currencyDocs.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        symbol: c.symbol ?? null,
        isBaseCurrency: c.isBaseCurrency ?? false,
        isActive: c.isActive ?? true,
        notes: c.notes ?? null,
        createdAt: c.createdAt ?? '',
        updatedAt: c.updatedAt ?? '',
      })),
      paymentTerms: paymentTermDocs.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        dueInDays: p.dueInDays ?? 0,
        description: p.description ?? null,
        isActive: p.isActive ?? true,
        createdAt: p.createdAt ?? '',
        updatedAt: p.updatedAt ?? '',
      })),
      counts: {
        bankAccounts: bankAccountCounts.total,
        activeBankAccounts: bankAccountCounts.active,
        taxCodes: taxCodeCounts.total,
        activeTaxCodes: taxCodeCounts.active,
        currencies: currencyDocs.length,
        activeCurrencies: currencyDocs.filter((c) => c.isActive).length,
        baseCurrencies: currencyDocs.filter((c) => c.isBaseCurrency).length,
        paymentTerms: paymentTermDocs.length,
        activePaymentTerms: paymentTermDocs.filter((p) => p.isActive).length,
        branches: branchCounts?.totalDocs ?? 0,
        departments: deptCounts?.totalDocs ?? 0,
        locations: locCounts?.totalDocs ?? 0,
        chartOfAccounts: coaCounts?.totalDocs ?? 0,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
