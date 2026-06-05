import { NextRequest, NextResponse } from 'next/server'
import { AccountingTaxCodesRegisterService } from '@/accounting/services/tax-codes/AccountingTaxCodesRegisterService'
import type { AccountingTaxCalculationMethod, AccountingTaxScope } from '@/accounting/types/accounting'
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

const parseBooleanParam = (value: string | null): boolean | undefined => {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return undefined
}

const normalizeTaxCodeMutationBody = (body: Record<string, unknown>) => {
  const description =
    typeof body.description === 'string' ? body.description.trim() || null : (body.description as string | null | undefined) ?? null

  return {
    code:
      typeof body.code === 'string'
        ? body.code.trim().toUpperCase()
        : String(body.code ?? '').trim().toUpperCase(),
    name: typeof body.name === 'string' ? body.name.trim() : String(body.name ?? '').trim(),
    scope: (typeof body.scope === 'string' ? body.scope : 'both') as AccountingTaxScope,
    rate: typeof body.rate === 'number' ? body.rate : Number(body.rate ?? 0),
    calculationMethod: (typeof body.calculationMethod === 'string' ? body.calculationMethod : 'exclusive') as AccountingTaxCalculationMethod,
    purchaseAccount: body.purchaseAccount !== undefined && body.purchaseAccount !== '' ? body.purchaseAccount : null,
    salesAccount: body.salesAccount !== undefined && body.salesAccount !== '' ? body.salesAccount : null,
    isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
    description: description as string | null | undefined,
  }
}

const assertTaxCodeCreatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
) => {
  const code = String(body.code || '').trim().toUpperCase()
  const name = String(body.name || '').trim()

  if (!code) {
    throw new AccountingApiError('Tax code is required.', 400)
  }

  if (!name) {
    throw new AccountingApiError('Tax code name is required.', 400)
  }

  const existing = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
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
    throw new AccountingApiError(`Tax code "${code}" already exists. Use a different code.`, 409)
  }

  const purchaseAccountId = body.purchaseAccount !== undefined && body.purchaseAccount !== '' ? body.purchaseAccount : null
  const salesAccountId = body.salesAccount !== undefined && body.salesAccount !== '' ? body.salesAccount : null

  if (purchaseAccountId !== null) {
    try {
      await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        id: purchaseAccountId as string | number,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      throw new AccountingApiError(`Purchase account with ID "${String(purchaseAccountId)}" not found. Provide a valid chart-of-account ID or leave the field empty.`, 400)
    }
  }

  if (salesAccountId !== null) {
    try {
      await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
        id: salesAccountId as string | number,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      throw new AccountingApiError(`Sales account with ID "${String(salesAccountId)}" not found. Provide a valid chart-of-account ID or leave the field empty.`, 400)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const register = await AccountingTaxCodesRegisterService.getTaxCodesRegister(payload, {
      search: searchParams.get('search') || '',
      scopes: parseListParam<AccountingTaxScope>(searchParams, 'scope'),
      calculationMethods: parseListParam<AccountingTaxCalculationMethod>(searchParams, 'calculationMethod'),
      isActive: parseBooleanParam(searchParams.get('isActive')),
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
    const body = normalizeTaxCodeMutationBody(await request.json())
    await assertTaxCodeCreatePayload(payload, body)
    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
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
