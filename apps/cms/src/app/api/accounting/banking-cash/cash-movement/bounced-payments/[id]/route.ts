import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../../../_utils/auth'
import {
  assertBouncedPaymentMutationPayload,
  buildBouncedPaymentDetailResponse,
  buildBouncedPaymentPersistenceData,
  normalizeBouncedPaymentMutationBody,
  type BouncedPaymentDoc,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
      id: parseNumberParam(params.id) || params.id,
      depth: 2,
      overrideAccess: true,
    })) as BouncedPaymentDoc

    return NextResponse.json(await buildBouncedPaymentDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const recordId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
      id: recordId,
      depth: 2,
      overrideAccess: true,
    })) as BouncedPaymentDoc

    const body = normalizeBouncedPaymentMutationBody((await request.json()) as Record<string, unknown>)
    const financialLock = Boolean(currentRecord.reversalJournalEntry || currentRecord.chargeJournalEntry)

    if (financialLock) {
      const attemptedFinancialChange =
        body.originalPayment !== undefined ||
        body.bankChargeAmount !== undefined ||
        body.chargeExpenseAccount !== undefined ||
        body.bounceDate !== undefined ||
        body.bankNoticeDate !== undefined ||
        body.bounceReason !== undefined

      if (attemptedFinancialChange) {
        throw new AccountingApiError(
          'Original payment, bounce event, and bank-charge fields cannot be changed after reversal or charge journals are posted.',
          400,
        )
      }
    }

    await assertBouncedPaymentMutationPayload(
      payload,
      {
        caseNumber: body.caseNumber ?? currentRecord.caseNumber ?? null,
        originalPayment:
          body.originalPayment ??
          (typeof currentRecord.originalPayment === 'object' && currentRecord.originalPayment
            ? currentRecord.originalPayment.id ?? null
            : currentRecord.originalPayment ?? null),
        bounceDate: body.bounceDate ?? currentRecord.bounceDate ?? null,
        bankNoticeDate: body.bankNoticeDate ?? currentRecord.bankNoticeDate ?? null,
        bounceReason: body.bounceReason ?? currentRecord.bounceReason ?? null,
        caseStatus: body.caseStatus ?? currentRecord.caseStatus ?? null,
        bankChargeAmount: body.bankChargeAmount ?? currentRecord.bankChargeAmount ?? null,
        chargeExpenseAccount:
          body.chargeExpenseAccount ??
          (typeof currentRecord.chargeExpenseAccount === 'object' && currentRecord.chargeExpenseAccount
            ? currentRecord.chargeExpenseAccount.id ?? null
            : currentRecord.chargeExpenseAccount ?? null),
        recoveryPayment:
          body.recoveryPayment ??
          (typeof currentRecord.recoveryPayment === 'object' && currentRecord.recoveryPayment
            ? currentRecord.recoveryPayment.id ?? null
            : currentRecord.recoveryPayment ?? null),
        recoveryDate: body.recoveryDate ?? currentRecord.recoveryDate ?? null,
        followUpDate: body.followUpDate ?? currentRecord.followUpDate ?? null,
        resolutionDate: body.resolutionDate ?? currentRecord.resolutionDate ?? null,
        notes: body.notes ?? currentRecord.notes ?? null,
        resolutionNotes: body.resolutionNotes ?? currentRecord.resolutionNotes ?? null,
      },
      {
        existingId: recordId,
      },
    )

    const updatedRecord = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
      id: recordId,
      overrideAccess: true,
      depth: 2,
      data: {
        ...buildBouncedPaymentPersistenceData(body),
        updatedBy: user.id,
      } as never,
    })) as BouncedPaymentDoc

    return NextResponse.json(await buildBouncedPaymentDetailResponse(payload, updatedRecord))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const recordId = parseNumberParam(params.id) || params.id
    const currentRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
      id: recordId,
      depth: 0,
      overrideAccess: true,
    })) as BouncedPaymentDoc

    if (currentRecord.reversalJournalEntry || currentRecord.chargeJournalEntry) {
      throw new AccountingApiError('Cases with posted reversal or charge journals cannot be deleted.', 400)
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
      id: recordId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
