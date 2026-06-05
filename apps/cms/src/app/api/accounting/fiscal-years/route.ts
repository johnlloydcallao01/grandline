import { NextRequest, NextResponse } from 'next/server'
import { AccountingFiscalYearsRegisterService } from '@/accounting/services/fiscal-years/AccountingFiscalYearsRegisterService'
import type { AccountingFiscalYearCloseMode, AccountingFiscalYearStatus } from '@/accounting/types/accounting'
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

const normalizeFiscalYearMutationBody = (body: Record<string, unknown>) => {
  const notes =
    typeof body.notes === 'string' ? body.notes.trim() || null : (body.notes as string | null | undefined) ?? null

  const lockedFromDate =
    typeof body.lockedFromDate === 'string' && !body.lockedFromDate.trim()
      ? null
      : (body.lockedFromDate as string | null | undefined) ?? null

  return {
    code:
      typeof body.code === 'string'
        ? body.code.trim().toUpperCase()
        : String(body.code ?? '').trim().toUpperCase(),
    name: typeof body.name === 'string' ? body.name.trim() : String(body.name ?? '').trim(),
    startDate: typeof body.startDate === 'string' ? body.startDate : undefined,
    endDate: typeof body.endDate === 'string' ? body.endDate : undefined,
    status: (typeof body.status === 'string' ? body.status : 'draft') as AccountingFiscalYearStatus,
    closeMode: (typeof body.closeMode === 'string' ? body.closeMode : 'manual') as AccountingFiscalYearCloseMode,
    lockedFromDate: lockedFromDate as string | null | undefined,
    notes: notes as string | null | undefined,
  }
}

const assertFiscalYearCreatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
) => {
  const code = String(body.code || '').trim().toUpperCase()
  const name = String(body.name || '').trim()

  if (!code) {
    throw new AccountingApiError('Fiscal year code is required.', 400)
  }

  if (!name) {
    throw new AccountingApiError('Fiscal year name is required.', 400)
  }

  if (!body.startDate) {
    throw new AccountingApiError('Fiscal year start date is required.', 400)
  }

  if (!body.endDate) {
    throw new AccountingApiError('Fiscal year end date is required.', 400)
  }

  const existing = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
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
    throw new AccountingApiError(`Fiscal year code "${code}" already exists. Use a different code.`, 409)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const register = await AccountingFiscalYearsRegisterService.getFiscalYearsRegister(payload, {
      search: searchParams.get('search') || '',
      statuses: parseListParam<AccountingFiscalYearStatus>(searchParams, 'status'),
      closeModes: parseListParam<AccountingFiscalYearCloseMode>(searchParams, 'closeMode'),
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
    const body = normalizeFiscalYearMutationBody(await request.json())
    await assertFiscalYearCreatePayload(payload, body)
    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
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
