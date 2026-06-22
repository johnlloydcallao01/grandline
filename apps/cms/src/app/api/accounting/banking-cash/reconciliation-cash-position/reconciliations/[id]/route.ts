import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { isLockedReconciliationStatus } from '@/accounting/utils/commercial'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../../../_utils/auth'
import {
  assertReconciliationMutationPayload,
  buildReconciliationDetailResponse,
  buildReconciliationPersistenceData,
  normalizeReconciliationMutationBody,
  refreshReconciliationComputedFields,
  type ReconciliationDoc,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      id: parseNumberParam(params.id) || params.id,
      depth: 2,
      overrideAccess: true,
    })) as ReconciliationDoc

    return NextResponse.json(await buildReconciliationDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const reconciliationId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      id: reconciliationId,
      depth: 2,
      overrideAccess: true,
    })) as ReconciliationDoc

    if (isLockedReconciliationStatus(String(currentRecord.status || ''))) {
      throw new AccountingApiError('Completed or locked reconciliation sessions cannot be edited directly.', 400)
    }

    const body = normalizeReconciliationMutationBody((await request.json()) as Record<string, unknown>)
    await assertReconciliationMutationPayload(
      payload,
      {
        bankAccount:
          body.bankAccount ??
          (typeof currentRecord.bankAccount === 'object' && currentRecord.bankAccount
            ? currentRecord.bankAccount.id ?? null
            : currentRecord.bankAccount ?? null),
        statementStartDate: body.statementStartDate ?? currentRecord.statementStartDate ?? null,
        statementEndDate: body.statementEndDate ?? currentRecord.statementEndDate ?? null,
        statementClosingBalance: body.statementClosingBalance ?? currentRecord.statementClosingBalance ?? null,
        status: body.status ?? currentRecord.status ?? 'draft',
        notes: body.notes ?? currentRecord.notes ?? null,
      },
      { existingId: reconciliationId },
    )

    const updatedRecord = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      id: reconciliationId,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildReconciliationPersistenceData(body),
        updatedBy: user.id,
      } as never,
    })) as ReconciliationDoc

    const refreshedRecord = await refreshReconciliationComputedFields(payload, updatedRecord.id)
    return NextResponse.json(await buildReconciliationDetailResponse(payload, refreshedRecord))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const reconciliationId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      id: reconciliationId,
      depth: 0,
      overrideAccess: true,
    })) as ReconciliationDoc

    if (isLockedReconciliationStatus(String(currentRecord.status || ''))) {
      throw new AccountingApiError('Completed or locked reconciliation sessions cannot be deleted.', 400)
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations,
      id: reconciliationId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
