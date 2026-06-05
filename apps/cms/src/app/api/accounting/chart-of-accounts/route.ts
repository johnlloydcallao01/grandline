import { NextRequest, NextResponse } from 'next/server'
import { AccountingChartOfAccountsRegisterService, type ChartOfAccountsRegisterStatus } from '@/accounting/services/chart-of-accounts/AccountingChartOfAccountsRegisterService'
import type { AccountingAccountSubType, AccountingAccountType, AccountingNormalBalance } from '@/accounting/types/accounting'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../_utils/auth'

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

  return ['true', '1', 'yes'].includes(String(value).toLowerCase())
}

const parseListParam = <T extends string>(searchParams: URLSearchParams, key: string): T[] => {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(values)) as T[]
}

const normalizeChartOfAccountsMutationBody = (body: Record<string, unknown>) => {
  const rawParentAccount =
    typeof body.parentAccount === 'string'
      ? body.parentAccount.trim()
      : body.parentAccount === null || body.parentAccount === undefined
        ? null
        : body.parentAccount

  const parentAccount =
    rawParentAccount === null || rawParentAccount === ''
      ? undefined
      : typeof rawParentAccount === 'string'
        ? parseNumberParam(rawParentAccount) ?? rawParentAccount
        : rawParentAccount

  const description =
    typeof body.description === 'string' ? body.description.trim() || null : body.description ?? null

  const sortOrder =
    typeof body.sortOrder === 'string'
      ? Number.isFinite(Number(body.sortOrder))
        ? Number(body.sortOrder)
        : 0
      : typeof body.sortOrder === 'number'
        ? body.sortOrder
        : 0

  const accountSubType =
    typeof body.accountSubType === 'string' && !body.accountSubType.trim()
      ? undefined
      : (body.accountSubType as string | undefined) ?? undefined

  return {
    code:
      typeof body.code === 'string'
        ? body.code.trim().toUpperCase()
        : String(body.code ?? '').trim().toUpperCase(),
    name: typeof body.name === 'string' ? body.name.trim() : String(body.name ?? '').trim(),
    accountType: (typeof body.accountType === 'string' ? body.accountType : undefined) as AccountingAccountType | undefined,
    accountSubType: accountSubType as AccountingAccountSubType | undefined,
    normalBalance: (typeof body.normalBalance === 'string' ? body.normalBalance : undefined) as AccountingNormalBalance | undefined,
    parentAccount: parentAccount as number | string | undefined,
    isActive: body.isActive === true,
    allowManualEntries: body.allowManualEntries !== false,
    isControlAccount: body.isControlAccount === true,
    isRetainedEarnings: body.isRetainedEarnings === true,
    isSuspenseAccount: body.isSuspenseAccount === true,
    description: description as string | null | undefined,
    sortOrder,
  }
}

const assertChartOfAccountsCreatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
) => {
  const code = String(body.code || '').trim().toUpperCase()
  const name = String(body.name || '').trim()

  if (!code) {
    throw new AccountingApiError('Account code is required.', 400)
  }

  if (!name) {
    throw new AccountingApiError('Account name is required.', 400)
  }

  const existing = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    where: {
      code: {
        equals: code,
      },
    } as never,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    throw new AccountingApiError(`Account code "${code}" already exists. Use a different code.`, 409)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const register = await AccountingChartOfAccountsRegisterService.getChartOfAccountsRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<ChartOfAccountsRegisterStatus>(searchParams, 'status'),
      accountTypes: parseListParam<AccountingAccountType>(searchParams, 'accountType'),
      accountSubTypes: parseListParam<AccountingAccountSubType>(searchParams, 'accountSubType'),
      controlAccountsOnly: parseBooleanParam(searchParams.get('controlAccountsOnly')),
      manualEntriesOnly: parseBooleanParam(searchParams.get('manualEntriesOnly')),
      retainedEarningsOnly: parseBooleanParam(searchParams.get('retainedEarningsOnly')),
      parentAccountsOnly: parseBooleanParam(searchParams.get('parentAccountsOnly')),
      page: parseIntegerParam(searchParams.get('page'), 1),
      limit: parseIntegerParam(searchParams.get('limit'), 10),
    })

    return NextResponse.json({
      docs: register.rows,
      totalDocs: register.pagination.totalDocs,
      totalPages: register.pagination.totalPages,
      page: register.pagination.page,
      limit: register.pagination.limit,
      hasPrevPage: register.pagination.hasPrevPage,
      hasNextPage: register.pagination.hasNextPage,
      metrics: register.metrics,
      filterOptions: register.filterOptions,
      appliedFilters: register.appliedFilters,
      referenceData: register.referenceData,
      totals: register.totals,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeChartOfAccountsMutationBody(await request.json())
    await assertChartOfAccountsCreatePayload(payload, body)
    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
