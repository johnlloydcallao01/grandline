import { NextRequest, NextResponse } from 'next/server'
import { AccountingTaxCodeGovernanceService } from '@/accounting/services/reports/AccountingTaxCodeGovernanceService'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback; const p = Number(value); return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const [result, accountDocs] = await Promise.all([
      AccountingTaxCodeGovernanceService.getGovernanceRegister(payload, {
        search: searchParams.get('search') || '',
        status: parseListParam(searchParams, 'status'),
        mapping: parseListParam(searchParams, 'mapping'),
        quickFilters: parseListParam(searchParams, 'quickFilter'),
        page: parseIntegerParam(searchParams.get('page'), 1),
        limit: parseIntegerParam(searchParams.get('limit'), 10),
      }),
      findAllDocs<{ id: number | string; code?: string | null; name?: string | null; isActive?: boolean | null }>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        depth: 0,
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
        id: 'tax-code-governance',
        label: 'Tax Code Governance',
        description: 'Review control fields on tax-code records including scope, rate, method, account mapping, and active state.',
        searchPlaceholder: 'Search tax code, scope, rate, method, sales account, or purchase account',
        filters: result.filterOptions,
        metrics: result.metrics.map((m, i) => ({ id: `gov-metric-${i}`, ...m })),
        table: {
          title: 'Tax Code Control Matrix',
          description: 'Control-focused view of tax-code settings and posting-account relationships from the tax-code collection.',
          columns: ['Code', 'Scope', { label: 'Rate', align: 'right' }, 'Method', 'Account Mapping', 'Status'],
          rows: result.rows,
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
