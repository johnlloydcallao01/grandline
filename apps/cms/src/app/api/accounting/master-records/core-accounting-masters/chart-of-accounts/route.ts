import { NextRequest, NextResponse } from 'next/server'
import { AccountingChartOfAccountsRegisterService, type ChartOfAccountsRegisterStatus } from '@/accounting/services/chart-of-accounts/AccountingChartOfAccountsRegisterService'
import type { AccountingAccountSubType, AccountingAccountType } from '@/accounting/types/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '@/app/api/accounting/_utils/auth'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback
  }

  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseBooleanParam = (value: string | null) => {
  if (!value) {
    return false
  }

  return ['1', 'true', 'yes'].includes(value.trim().toLowerCase())
}

const parseListParam = <T extends string>(searchParams: URLSearchParams, key: string): T[] => {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(values)) as T[]
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const result = await AccountingChartOfAccountsRegisterService.getChartOfAccountsRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<ChartOfAccountsRegisterStatus>(searchParams, 'status'),
      accountTypes: parseListParam<AccountingAccountType>(searchParams, 'accountType'),
      accountSubTypes: parseListParam<AccountingAccountSubType>(searchParams, 'accountSubType'),
      controlAccountsOnly: parseBooleanParam(searchParams.get('controlAccountsOnly')),
      manualEntriesOnly: parseBooleanParam(searchParams.get('manualEntriesOnly')),
      retainedEarningsOnly: parseBooleanParam(searchParams.get('retainedEarningsOnly')),
      parentAccountsOnly: parseBooleanParam(searchParams.get('parentAccountsOnly')),
      quickFilters: parseListParam(searchParams, 'quickFilter'),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      section: {
        id: 'chart-of-accounts',
        label: 'Chart of Accounts',
        description:
          'Manage ledger accounts using code, type, subtype, hierarchy, control flags, and activity status.',
        searchPlaceholder: 'Search account code, name, type, parent, or control flag',
        filters: result.filterOptions,
        metrics: result.metrics,
        table: {
          title: 'Chart Of Accounts Register',
          description:
            'Account master records using code, type, hierarchy, normal balance, and control flags.',
          columns: ['Code', 'Name', 'Type', 'Parent', 'Normal Balance', 'Status'],
          rows: result.rows.map((row) => ({
            id: row.id,
            accountId: row.id,
            code: row.code,
            name: row.name,
            accountType: row.accountType,
            accountTypeLabel: row.accountTypeLabel,
            accountSubType: row.accountSubType,
            accountSubTypeLabel: row.accountSubTypeLabel,
            parentAccountId: row.parentAccountId,
            parentAccountCode: row.parentAccountCode,
            parentAccountName: row.parentAccountName,
            parentAccountDisplay: row.parentAccountDisplay,
            hierarchyLevel: row.hierarchyLevel,
            normalBalance: row.normalBalance,
            normalBalanceLabel: row.normalBalanceLabel,
            status: row.status,
            statusLabel: row.statusLabel,
            allowManualEntries: row.allowManualEntries,
            isControlAccount: row.isControlAccount,
            isRetainedEarnings: row.isRetainedEarnings,
            isSuspenseAccount: row.isSuspenseAccount,
            description: row.description,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            cells: [
              row.code,
              row.name,
              row.accountTypeLabel,
              row.parentAccountName || '-',
              row.normalBalanceLabel,
              row.statusLabel,
            ],
          })),
        },
      },
      appliedFilters: result.appliedFilters,
      pagination: result.pagination,
      referenceData: result.referenceData,
      totals: result.totals,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
