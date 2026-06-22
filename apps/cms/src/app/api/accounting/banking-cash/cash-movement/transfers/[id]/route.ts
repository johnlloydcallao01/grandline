import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../../../_utils/auth'
import {
  assertTransferMutationPayload,
  buildTransferDetailResponse,
  buildTransferPersistenceData,
  normalizeTransferMutationBody,
  type TransferDoc,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
      id: parseNumberParam(params.id) || params.id,
      depth: 2,
      overrideAccess: true,
    })) as TransferDoc

    return NextResponse.json(await buildTransferDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const transferId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
      id: transferId,
      depth: 2,
      overrideAccess: true,
    })) as TransferDoc

    if (String(currentRecord.status || '') !== 'draft') {
      throw new AccountingApiError('Posted or voided transfers cannot be edited directly.', 400)
    }

    const body = normalizeTransferMutationBody((await request.json()) as Record<string, unknown>)
    await assertTransferMutationPayload(payload, {
      transferNumber: body.transferNumber ?? currentRecord.transferNumber ?? null,
      transferDate: body.transferDate ?? currentRecord.transferDate ?? null,
      fromBankAccount:
        body.fromBankAccount ??
        (typeof currentRecord.fromBankAccount === 'object' && currentRecord.fromBankAccount
          ? currentRecord.fromBankAccount.id ?? null
          : currentRecord.fromBankAccount ?? null),
      toBankAccount:
        body.toBankAccount ??
        (typeof currentRecord.toBankAccount === 'object' && currentRecord.toBankAccount
          ? currentRecord.toBankAccount.id ?? null
          : currentRecord.toBankAccount ?? null),
      amount: body.amount ?? currentRecord.amount ?? null,
      notes: body.notes ?? currentRecord.notes ?? null,
    })

    const updatedRecord = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
      id: transferId,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildTransferPersistenceData(body),
        updatedBy: user.id,
      } as never,
    })) as TransferDoc

    return NextResponse.json(await buildTransferDetailResponse(payload, updatedRecord))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const transferId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
      id: transferId,
      depth: 0,
      overrideAccess: true,
    })) as TransferDoc

    if (String(currentRecord.status || '') !== 'draft') {
      throw new AccountingApiError('Posted or voided transfers cannot be deleted.', 400)
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers,
      id: transferId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
