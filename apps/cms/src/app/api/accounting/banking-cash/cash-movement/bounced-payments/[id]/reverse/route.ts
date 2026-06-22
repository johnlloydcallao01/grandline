import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { AccountingManualWorkflowService } from '@/accounting/services/journals/AccountingManualWorkflowService'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { AccountingApiError, handleAccountingApiError, requireAccountingAdmin } from '../../../../../_utils/auth'
import { buildBouncedPaymentDetailResponse, type BouncedPaymentDoc } from '../../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const caseRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })) as BouncedPaymentDoc

    if (caseRecord.reversalJournalEntry) {
      throw new AccountingApiError('This bounced-payment case already has a posted reversal journal.', 400)
    }

    const originalJournalEntryId = getRelationshipId(caseRecord.originalJournalEntry)
    if (!originalJournalEntryId) {
      throw new AccountingApiError('Original journal entry is missing for this bounced-payment case.', 400)
    }

    const reversalJournal = await AccountingManualWorkflowService.createReversalEntry({
      payload,
      journalEntryId: originalJournalEntryId,
      userId: user.id,
      postingDate: caseRecord.bounceDate || caseRecord.bankNoticeDate || new Date().toISOString(),
      entryDate: caseRecord.bounceDate || caseRecord.bankNoticeDate || new Date().toISOString(),
      memo: `Bounced payment reversal for ${caseRecord.caseNumber || `case ${caseRecord.id}`}`,
      referenceNumber: caseRecord.caseNumber || undefined,
    })

    let chargeJournalId: number | string | null = null
    const bankChargeAmount = normalizeAmount(caseRecord.bankChargeAmount)
    const chargeExpenseAccountId = getRelationshipId(caseRecord.chargeExpenseAccount)

    if (bankChargeAmount > 0) {
      if (!chargeExpenseAccountId) {
        throw new AccountingApiError('Charge expense account is required before posting bank charges.', 400)
      }

      const originalPayment =
        typeof caseRecord.originalPayment === 'object' && caseRecord.originalPayment
          ? caseRecord.originalPayment
          : caseRecord.originalPayment
            ? await payload.findByID({
                collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
                id: caseRecord.originalPayment,
                depth: 2,
                overrideAccess: true,
              })
            : null

      const originalDepositAccount =
        originalPayment && typeof originalPayment.depositAccount === 'object'
          ? originalPayment.depositAccount
          : getRelationshipId(originalPayment?.depositAccount)
            ? await payload.findByID({
                collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
                id: getRelationshipId(originalPayment?.depositAccount) as number | string,
                depth: 1,
                overrideAccess: true,
              })
            : null

      const creditAccountId =
        getRelationshipId(originalDepositAccount?.ledgerAccount) ||
        getRelationshipId(originalPayment?.undepositedFundsAccount) ||
        (await AccountingCommercialService.getDefaultAccountId(payload, 'defaultUndepositedFundsAccount'))

      if (!creditAccountId) {
        throw new AccountingApiError('Unable to determine the cash or undeposited-funds account for the bounced-payment charge.', 400)
      }

      const chargeJournal = await AccountingManualWorkflowService.createStructuredJournal({
        payload,
        userId: user.id,
        sourceType: 'system',
        entryDate: caseRecord.bounceDate || caseRecord.bankNoticeDate || new Date().toISOString(),
        postingDate: caseRecord.bounceDate || caseRecord.bankNoticeDate || new Date().toISOString(),
        memo: `Bank charge for bounced payment ${caseRecord.caseNumber || caseRecord.id}`,
        referenceNumber: caseRecord.caseNumber || undefined,
        sourceReference:
          typeof caseRecord.originalPayment === 'object' && caseRecord.originalPayment
            ? caseRecord.originalPayment.receiptNumber || undefined
            : undefined,
        autoPost: true,
        lines: [
          {
            account: chargeExpenseAccountId,
            description: `Bank charge for ${caseRecord.caseNumber || caseRecord.id}`,
            debit: bankChargeAmount,
            credit: 0,
          },
          {
            account: creditAccountId,
            description: `Cash reduction for ${caseRecord.caseNumber || caseRecord.id}`,
            debit: 0,
            credit: bankChargeAmount,
          },
        ],
      })

      chargeJournalId = chargeJournal.id
    }

    const updatedRecord = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bouncedPayments,
      id: caseRecord.id,
      overrideAccess: true,
      depth: 2,
      data: {
        reversalJournalEntry: reversalJournal.id,
        chargeJournalEntry: chargeJournalId || undefined,
        caseStatus:
          getRelationshipId(caseRecord.recoveryPayment) || caseRecord.resolutionDate
            ? 'resolved'
            : caseRecord.caseStatus === 'written_off'
              ? 'written_off'
              : 'collections_follow_up',
        updatedBy: user.id,
      } as never,
    })) as BouncedPaymentDoc

    return NextResponse.json(await buildBouncedPaymentDetailResponse(payload, updatedRecord))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
