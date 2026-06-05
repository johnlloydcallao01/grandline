import { NextRequest, NextResponse } from 'next/server'
import { AccountingPeriodsRegisterService } from '@/accounting/services/periods/AccountingPeriodsRegisterService'
import type { AccountingPeriodStatus } from '@/accounting/types/accounting'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  requireAccountingAdmin,
} from '../_utils/auth'

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

const normalizePeriodMutationBody = (body: Record<string, unknown>) => {
  const notes =
    typeof body.notes === 'string' ? body.notes.trim() || null : (body.notes as string | null | undefined) ?? null

  const lockedFromDate =
    typeof body.lockedFromDate === 'string' && !body.lockedFromDate.trim()
      ? null
      : (body.lockedFromDate as string | null | undefined) ?? null

  return {
    fiscalYear: typeof body.fiscalYear === 'number' || typeof body.fiscalYear === 'string'
      ? body.fiscalYear
      : undefined,
    periodNumber: typeof body.periodNumber === 'number'
      ? body.periodNumber
      : body.periodNumber !== undefined
        ? Number(body.periodNumber)
        : undefined,
    label: typeof body.label === 'string' ? body.label.trim() : String(body.label ?? '').trim(),
    startDate: typeof body.startDate === 'string' ? body.startDate : undefined,
    endDate: typeof body.endDate === 'string' ? body.endDate : undefined,
    status: (typeof body.status === 'string' ? body.status : 'draft') as AccountingPeriodStatus,
    lockedFromDate: lockedFromDate as string | null | undefined,
    notes: notes as string | null | undefined,
  }
}

const assertPeriodCreatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
) => {
  const label = String(body.label || '').trim()
  const fiscalYear = body.fiscalYear

  if (!fiscalYear) {
    throw new AccountingApiError('Period must belong to a fiscal year.', 400)
  }

  if (!label) {
    throw new AccountingApiError('Period label is required.', 400)
  }

  if (body.periodNumber === undefined || body.periodNumber === null) {
    throw new AccountingApiError('Period number is required.', 400)
  }

  if (!body.startDate) {
    throw new AccountingApiError('Period start date is required.', 400)
  }

  if (!body.endDate) {
    throw new AccountingApiError('Period end date is required.', 400)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const register = await AccountingPeriodsRegisterService.getPeriodsRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<AccountingPeriodStatus>(searchParams, 'status'),
      fiscalYearId: searchParams.get('fiscalYearId') || '',
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
      totals: register.totals,
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizePeriodMutationBody(await request.json())
    await assertPeriodCreatePayload(payload, body)
    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
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
