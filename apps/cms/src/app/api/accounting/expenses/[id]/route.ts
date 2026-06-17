import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'
import {
  assertExpenseMutationPayload,
  buildExpenseDetailResponse,
  buildExpensePersistenceData,
  buildExpenseTotals,
  computeExpenseDeleteBarriers,
  normalizeExpenseMutationBody,
  type ExpenseDoc,
} from '../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params

    const record = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      id: parseNumberParam(params.id) || params.id,
      depth: 2,
      overrideAccess: true,
    })) as ExpenseDoc

    return NextResponse.json(await buildExpenseDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const expenseId = parseNumberParam(params.id) || params.id
    const currentExpense = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      id: expenseId,
      depth: 0,
      overrideAccess: true,
    })) as ExpenseDoc

    if (['posted', 'voided'].includes(String(currentExpense.status || ''))) {
      throw new Error('Posted or voided expenses cannot be edited directly.')
    }

    const body = normalizeExpenseMutationBody((await request.json()) as Record<string, unknown>)
    await assertExpenseMutationPayload(payload, body)
    const totals = await buildExpenseTotals(payload, body)
    const persistenceData = buildExpensePersistenceData(body)

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      id: expenseId,
      depth: 2,
      overrideAccess: true,
      data: {
        ...persistenceData,
        status: 'draft',
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        updatedBy: user.id,
      } as never,
    })

    const record = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      id: expenseId,
      depth: 2,
      overrideAccess: true,
    })) as ExpenseDoc

    return NextResponse.json(await buildExpenseDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const expenseId = parseNumberParam(params.id) || params.id
    const currentExpense = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      id: expenseId,
      depth: 0,
      overrideAccess: true,
    })) as ExpenseDoc

    const barriers = await computeExpenseDeleteBarriers(payload, currentExpense)
    if (barriers.length > 0) {
      throw new Error(
        `Cannot delete expense: ${barriers.join(', ')}. Remove all linked references before deleting.`,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      id: expenseId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
