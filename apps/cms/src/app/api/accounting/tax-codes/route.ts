import { NextRequest, NextResponse } from 'next/server'
import { AccountingTaxCodesRegisterService } from '@/accounting/services/tax-codes/AccountingTaxCodesRegisterService'
import { AccountingAuditService } from '@/accounting/services/audit/AccountingAuditService'
import type { AccountingTaxCalculationMethod, AccountingTaxScope } from '@/accounting/types/accounting'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
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

const parseListParam = <T extends string>(searchParams: URLSearchParams, key: string): T[] => {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(values)) as T[]
}

const normalizeRelationshipId = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const stringValue = String(value).trim()
  if (!stringValue || stringValue === 'null' || stringValue === 'undefined') {
    return null
  }

  return parseNumberParam(stringValue)
}

const normalizeTaxCodeMutationBody = (body: Record<string, unknown>) => {
  const description =
    typeof body.description === 'string' ? body.description.trim() || null : (body.description as string | null | undefined) ?? null
  const purchaseAccount = normalizeRelationshipId(body.purchaseAccount)
  const salesAccount = normalizeRelationshipId(body.salesAccount)

  return {
    code:
      typeof body.code === 'string'
        ? body.code.trim().toUpperCase()
        : String(body.code ?? '').trim().toUpperCase(),
    name: typeof body.name === 'string' ? body.name.trim() : String(body.name ?? '').trim(),
    scope: (typeof body.scope === 'string' ? body.scope : 'both') as AccountingTaxScope,
    rate: typeof body.rate === 'number' ? body.rate : Number(body.rate ?? 0),
    calculationMethod: (typeof body.calculationMethod === 'string' ? body.calculationMethod : 'exclusive') as AccountingTaxCalculationMethod,
    purchaseAccount,
    salesAccount,
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

  const purchaseAccountId = normalizeRelationshipId(body.purchaseAccount)
  const salesAccountId = normalizeRelationshipId(body.salesAccount)

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

    const [register, accountDocs] = await Promise.all([
      AccountingTaxCodesRegisterService.getTaxCodesRegister(payload, {
        search: searchParams.get('search') || '',
        scopes: parseListParam<AccountingTaxScope>(searchParams, 'scope'),
        calculationMethods: parseListParam<AccountingTaxCalculationMethod>(searchParams, 'calculationMethod'),
        statuses: parseListParam(searchParams, 'status'),
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
        id: 'tax-codes',
        label: 'Tax Codes',
        description: 'Manage tax-code master data with scope, rate, calculation method, linked accounts, and active status.',
        searchPlaceholder: 'Search tax code, name, scope, rate, method, or account',
        filters: register.filterOptions,
        metrics: register.metrics,
        table: {
          title: 'Tax Code Register',
          description: 'Tax-code master records using code, scope, rate, calculation method, and active flags from the collection.',
          columns: ['Code', 'Name', 'Scope', 'Rate', 'Method', 'Status'],
          rows: register.rows.map((row) => ({
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
              { text: row.code || '-', emphasis: true },
              row.name || '-',
              row.scopeLabel || '-',
              { text: row.rateDisplay || '-', align: 'right' },
              row.calculationMethodLabel || '-',
              { text: row.isActiveLabel, tone: row.isActive ? 'green' : 'amber' },
            ],
          })),
        },
      },
      appliedFilters: register.appliedFilters,
      pagination: register.pagination,
      totals: register.totals,
      referenceData: {
        chartAccounts,
      },
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

    await AccountingAuditService.logAction({
      payload,
      entityType: 'audit_log',
      entityId: String(record.code || record.id),
      actionType: 'created',
      performedBy: user.id,
      afterData: {
        id: record.id,
        code: record.code || null,
        name: record.name || null,
        scope: record.scope || null,
        rate: record.rate ?? null,
        calculationMethod: record.calculationMethod || null,
        isActive: record.isActive !== false,
      },
      reason: `Created tax code ${record.code || record.id}.`,
      metadata: {
        domain: 'tax-code',
        eventSource: 'tax-code-record',
        taxCodeId: String(record.id),
        taxCodeCode: record.code || null,
        taxCodeName: record.name || null,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
