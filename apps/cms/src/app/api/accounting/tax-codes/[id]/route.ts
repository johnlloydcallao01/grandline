import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import type { AccountingTaxCalculationMethod, AccountingTaxScope } from '@/accounting/types/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type TaxCodeRecord = {
  id: number | string
  code?: string | null
  name?: string | null
  scope?: string | null
  rate?: number | null
  calculationMethod?: string | null
  purchaseAccount?: unknown
  salesAccount?: unknown
  isActive?: boolean | null
  description?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

const normalizeTaxCodeMutationBody = (body: Record<string, unknown>) => {
  const code =
    typeof body.code === 'string'
      ? body.code.trim().toUpperCase()
      : body.code === undefined
        ? undefined
        : String(body.code ?? '').trim().toUpperCase()

  const name =
    typeof body.name === 'string'
      ? body.name.trim()
      : body.name === undefined
        ? undefined
        : String(body.name ?? '').trim()

  const description =
    typeof body.description === 'string'
      ? body.description.trim() || null
      : (body.description as string | null | undefined)

  return {
    ...(code !== undefined ? { code } : {}),
    ...(name !== undefined ? { name } : {}),
    ...(body.scope !== undefined ? { scope: (typeof body.scope === 'string' ? body.scope : 'both') as AccountingTaxScope } : {}),
    ...(body.rate !== undefined ? { rate: typeof body.rate === 'number' ? body.rate : Number(body.rate ?? 0) } : {}),
    ...(body.calculationMethod !== undefined ? { calculationMethod: (typeof body.calculationMethod === 'string' ? body.calculationMethod : 'exclusive') as AccountingTaxCalculationMethod } : {}),
    ...(body.purchaseAccount !== undefined ? { purchaseAccount: body.purchaseAccount !== '' ? body.purchaseAccount : null } : {}),
    ...(body.salesAccount !== undefined ? { salesAccount: body.salesAccount !== '' ? body.salesAccount : null } : {}),
    ...(body.isActive !== undefined ? { isActive: typeof body.isActive === 'boolean' ? body.isActive : true } : {}),
    ...(description !== undefined ? { description: description as string | null | undefined } : {}),
    ...(body.createdBy !== undefined ? { createdBy: body.createdBy as number | undefined } : {}),
    ...(body.updatedBy !== undefined ? { updatedBy: body.updatedBy as number | undefined } : {}),
  }
}

const assertTaxCodeUpdatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
  currentRecord: TaxCodeRecord,
) => {
  const currentId = currentRecord.id

  if ('code' in body) {
    const code = String(body.code || '').trim().toUpperCase()

    if (!code) {
      throw new AccountingApiError('Tax code is required.', 400)
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

    if (existing.docs[0] && String(existing.docs[0].id) !== String(currentId)) {
      throw new AccountingApiError(`Tax code "${code}" already exists. Use a different code.`, 409)
    }
  }

  if ('name' in body) {
    const name = String(body.name || '').trim()

    if (!name) {
      throw new AccountingApiError('Tax code name is required.', 400)
    }
  }

  if ('purchaseAccount' in body) {
    const purchaseAccountId = body.purchaseAccount !== undefined && body.purchaseAccount !== '' ? body.purchaseAccount : null

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
  }

  if ('salesAccount' in body) {
    const salesAccountId = body.salesAccount !== undefined && body.salesAccount !== '' ? body.salesAccount : null

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
}

const countExpensesForTaxCode = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  taxCodeId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
    where: {
      taxCode: {
        equals: taxCodeId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countBillLineItemsForTaxCode = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  taxCodeId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
    where: {
      taxCode: {
        equals: taxCodeId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countInvoiceLineItemsForTaxCode = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  taxCodeId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
    where: {
      taxCode: {
        equals: taxCodeId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countJournalEntryLinesForTaxCode = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  taxCodeId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
    where: {
      taxCode: {
        equals: taxCodeId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

type TaxCodeUsageSummary = {
  expenseCount: number
  billLineItemCount: number
  invoiceLineItemCount: number
  journalEntryLineCount: number
  hasDependents: boolean
}

const computeTaxCodeUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  taxCodeId: number | string,
): Promise<TaxCodeUsageSummary> => {
  const [expenseCount, billLineItemCount, invoiceLineItemCount, journalEntryLineCount] = await Promise.all([
    countExpensesForTaxCode(payload, taxCodeId),
    countBillLineItemsForTaxCode(payload, taxCodeId),
    countInvoiceLineItemsForTaxCode(payload, taxCodeId),
    countJournalEntryLinesForTaxCode(payload, taxCodeId),
  ])

  return {
    expenseCount,
    billLineItemCount,
    invoiceLineItemCount,
    journalEntryLineCount,
    hasDependents: expenseCount > 0 || billLineItemCount > 0 || invoiceLineItemCount > 0 || journalEntryLineCount > 0,
  }
}

const buildTaxCodeDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: TaxCodeRecord,
) => {
  const usage = await computeTaxCodeUsageSummary(payload, record.id)

  return {
    ...record,
    usageSummary: {
      expenseCount: usage.expenseCount,
      billLineItemCount: usage.billLineItemCount,
      invoiceLineItemCount: usage.invoiceLineItemCount,
      journalEntryLineCount: usage.journalEntryLineCount,
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })) as TaxCodeRecord

    return NextResponse.json(await buildTaxCodeDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = normalizeTaxCodeMutationBody(await request.json())
    const currentId = parseNumberParam(id) || id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      id: currentId,
      depth: 0,
      overrideAccess: true,
    })) as TaxCodeRecord
    await assertTaxCodeUpdatePayload(payload, body, currentRecord)

    const record = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      id: currentId,
      depth: 1,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      } as never,
    })) as unknown as TaxCodeRecord

    return NextResponse.json(await buildTaxCodeDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const taxCodeId = parseNumberParam(id) || id

    const usage = await computeTaxCodeUsageSummary(payload, taxCodeId)

    const barriers: string[] = []

    if (usage.expenseCount > 0) {
      barriers.push(`referenced by ${usage.expenseCount} expense(s)`)
    }

    if (usage.billLineItemCount > 0) {
      barriers.push(`referenced by ${usage.billLineItemCount} bill line item(s)`)
    }

    if (usage.invoiceLineItemCount > 0) {
      barriers.push(`referenced by ${usage.invoiceLineItemCount} invoice line item(s)`)
    }

    if (usage.journalEntryLineCount > 0) {
      barriers.push(`referenced by ${usage.journalEntryLineCount} journal entry line(s)`)
    }

    if (barriers.length > 0) {
      throw new AccountingApiError(
        `Cannot delete tax code: ${barriers.join(', ')}. Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      id: taxCodeId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
