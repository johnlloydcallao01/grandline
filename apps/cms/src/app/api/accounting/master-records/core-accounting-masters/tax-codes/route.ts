import { NextRequest, NextResponse } from 'next/server'
import { AccountingTaxCodesRegisterService } from '@/accounting/services/tax-codes/AccountingTaxCodesRegisterService'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import type { AccountingTaxCalculationMethod, AccountingTaxScope } from '@/accounting/types/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '@/app/api/accounting/_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback
  }

  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = <T extends string>(searchParams: URLSearchParams, key: string): T[] => {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(values)) as T[]
}

const parseBooleanParam = (value: string | null): boolean | undefined => {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return undefined
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const [result, accountDocs] = await Promise.all([
      AccountingTaxCodesRegisterService.getTaxCodesRegister(payload, {
        search: searchParams.get('search') || '',
        scopes: parseListParam<AccountingTaxScope>(searchParams, 'scope'),
        calculationMethods: parseListParam<AccountingTaxCalculationMethod>(searchParams, 'calculationMethod'),
        isActive: parseBooleanParam(searchParams.get('isActive')),
        page: parseIntegerParam(searchParams.get('page'), 1),
        limit: parseIntegerParam(searchParams.get('limit'), 10),
      }),
      findAllDocs<{ id: number | string; code?: string | null; name?: string | null; isActive?: boolean | null }>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        depth: 0,
        sort: 'code',
      }),
    ])

    const chartAccounts = accountDocs
      .filter((account) => account.isActive !== false)
      .map((account) => ({
        id: account.id,
        code: account.code || null,
        name: account.name || null,
      }))

    return NextResponse.json({
      section: {
        id: 'tax-codes',
        label: 'Tax Codes',
        description:
          'Maintain tax-code metadata with code, scope, rate, calculation method, linked accounts, and active state.',
        searchPlaceholder: 'Search tax code, name, scope, rate, method, or active state',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Tax Code Register',
          description:
            'Tax-code records using code, scope, rate, method, and activity fields from the collection.',
          columns: ['Code', 'Name', 'Scope', 'Rate', 'Method', 'Status'],
          rows: result.rows.map((row) => ({
            id: row.id,
            code: row.code,
            name: row.name,
            scope: row.scope,
            scopeLabel: row.scopeLabel,
            rate: row.rate,
            rateDisplay: row.rateDisplay,
            calculationMethod: row.calculationMethod,
            calculationMethodLabel: row.calculationMethodLabel,
            purchaseAccountId: row.purchaseAccountId,
            purchaseAccountCode: row.purchaseAccountCode,
            purchaseAccountName: row.purchaseAccountName,
            salesAccountId: row.salesAccountId,
            salesAccountCode: row.salesAccountCode,
            salesAccountName: row.salesAccountName,
            isActive: row.isActive,
            isActiveLabel: row.isActiveLabel,
            description: row.description,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: [
              row.code,
              row.name,
              row.scopeLabel,
              row.rateDisplay,
              row.calculationMethodLabel,
              row.isActiveLabel,
            ],
          })),
        },
      },
      appliedFilters: result.appliedFilters,
      pagination: result.pagination,
      totals: result.totals,
      referenceData: {
        chartAccounts,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
