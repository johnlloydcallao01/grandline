import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../../../_utils/auth'
import {
  assertDepositMutationPayload,
  buildDepositDetailResponse,
  buildDepositPersistenceData,
  normalizeDepositMutationBody,
  type DepositDoc,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
      id: parseNumberParam(params.id) || params.id,
      depth: 2,
      overrideAccess: true,
    })) as DepositDoc

    return NextResponse.json(await buildDepositDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const depositId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
      id: depositId,
      depth: 2,
      overrideAccess: true,
    })) as DepositDoc

    if (String(currentRecord.status || '') !== 'draft') {
      throw new AccountingApiError('Posted or voided deposits cannot be edited directly.', 400)
    }

    const body = normalizeDepositMutationBody((await request.json()) as Record<string, unknown>)
    await assertDepositMutationPayload(payload, {
      depositNumber: body.depositNumber ?? currentRecord.depositNumber ?? null,
      depositDate: body.depositDate ?? currentRecord.depositDate ?? null,
      bankAccount:
        body.bankAccount ??
        (typeof currentRecord.bankAccount === 'object' && currentRecord.bankAccount
          ? currentRecord.bankAccount.id ?? null
          : currentRecord.bankAccount ?? null),
      sourceAccount:
        body.sourceAccount ??
        (typeof currentRecord.sourceAccount === 'object' && currentRecord.sourceAccount
          ? currentRecord.sourceAccount.id ?? null
          : currentRecord.sourceAccount ?? null),
      amount: body.amount ?? currentRecord.amount ?? null,
      notes: body.notes ?? currentRecord.notes ?? null,
    })

    const updatedRecord = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
      id: depositId,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildDepositPersistenceData(body),
        updatedBy: user.id,
      } as never,
    })) as DepositDoc

    return NextResponse.json(await buildDepositDetailResponse(payload, updatedRecord))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const depositId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
      id: depositId,
      depth: 0,
      overrideAccess: true,
    })) as DepositDoc

    if (String(currentRecord.status || '') !== 'draft') {
      throw new AccountingApiError('Posted or voided deposits cannot be deleted.', 400)
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits,
      id: depositId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
