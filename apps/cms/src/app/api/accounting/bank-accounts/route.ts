import { NextRequest, NextResponse } from 'next/server'
import { AccountingBankAccountRegisterService } from '@/accounting/services/banking/AccountingBankAccountRegisterService'
import type { AccountingBankAccountType } from '@/accounting/types/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

type BankAccountRegisterStatus = 'active' | 'inactive'

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

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const register = await AccountingBankAccountRegisterService.getBankAccountMasterRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<BankAccountRegisterStatus>(searchParams, 'status'),
      accountTypes: parseListParam<AccountingBankAccountType>(searchParams, 'accountType'),
      defaultReceiptOnly: parseBooleanParam(searchParams.get('defaultReceiptOnly')),
      defaultDisbursementOnly: parseBooleanParam(searchParams.get('defaultDisbursementOnly')),
      ledgerMappedOnly: parseBooleanParam(searchParams.get('ledgerMappedOnly')),
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
    const body = await request.json()
    const record = await payload.create({
      collection: 'accounting-bank-accounts',
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      },
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
