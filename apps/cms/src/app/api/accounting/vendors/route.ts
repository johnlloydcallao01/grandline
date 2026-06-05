import { NextRequest, NextResponse } from 'next/server'
import { AccountingVendorRegisterService } from '@/accounting/services/vendors/AccountingVendorRegisterService'
import type { AccountingPartyStatus, AccountingVendorType } from '@/accounting/types/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

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

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const register = await AccountingVendorRegisterService.getVendorMasterRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<AccountingPartyStatus>(searchParams, 'status'),
      vendorTypes: parseListParam<AccountingVendorType>(searchParams, 'vendorType'),
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
      collection: 'accounting-vendors',
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
