import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { parseNumberParam, handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'
import {
  assertBankTransactionMutationPayload,
  assertMutableBankTransaction,
  buildBankTransactionDetailResponse,
  buildBankTransactionPersistenceData,
  computeBankTransactionDeleteBarriers,
  normalizeBankTransactionMutationBody,
  type BankTransactionDoc,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
      id: parseNumberParam(params.id) || params.id,
      depth: 1,
      overrideAccess: true,
    })) as BankTransactionDoc

    return NextResponse.json(await buildBankTransactionDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const transactionId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
      id: transactionId,
      depth: 1,
      overrideAccess: true,
    })) as BankTransactionDoc

    assertMutableBankTransaction(currentRecord)

    const body = normalizeBankTransactionMutationBody((await request.json()) as Record<string, unknown>)
    await assertBankTransactionMutationPayload(payload, {
      bankAccount:
        body.bankAccount ??
        (typeof currentRecord.bankAccount === 'object' && currentRecord.bankAccount
          ? currentRecord.bankAccount.id ?? null
          : currentRecord.bankAccount ?? null),
      transactionDate: body.transactionDate ?? currentRecord.transactionDate ?? null,
      description: body.description ?? currentRecord.description ?? null,
      amountIn: body.amountIn ?? currentRecord.amountIn ?? 0,
      amountOut: body.amountOut ?? currentRecord.amountOut ?? 0,
      matchStatus: body.matchStatus ?? currentRecord.matchStatus ?? 'unmatched',
      matchedEntityType: body.matchedEntityType ?? currentRecord.matchedEntityType ?? null,
      matchedEntityId: body.matchedEntityId ?? currentRecord.matchedEntityId ?? null,
      valueDate: body.valueDate ?? currentRecord.valueDate ?? null,
      referenceNumber: body.referenceNumber ?? currentRecord.referenceNumber ?? null,
      runningBalance: body.runningBalance ?? currentRecord.runningBalance ?? null,
      metadata: body.metadata ?? currentRecord.metadata ?? null,
    })

    const updatedRecord = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
      id: transactionId,
      overrideAccess: true,
      depth: 1,
      data: {
        ...buildBankTransactionPersistenceData(body),
        updatedBy: user.id,
      } as never,
    })) as BankTransactionDoc

    return NextResponse.json(await buildBankTransactionDetailResponse(payload, updatedRecord))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const transactionId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
      id: transactionId,
      depth: 1,
      overrideAccess: true,
    })) as BankTransactionDoc

    const barriers = computeBankTransactionDeleteBarriers(currentRecord)
    if (barriers.length > 0) {
      throw new Error(
        `Cannot delete bank transaction: ${barriers.join(', ')}. Remove the match or linked reference first.`,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions,
      id: transactionId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
