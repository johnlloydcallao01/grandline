import type { Payload } from 'payload'
import { ACCOUNTING_HOOK_CONTEXT } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { AccountingJournalService } from '../journals/AccountingJournalService'
import { AccountingPeriodService } from '../periods/AccountingPeriodService'

type JournalEntryData = Record<string, unknown> & {
  entryDate?: string | null
  postingDate?: string | null
  status?: string | null
  postingStatus?: string | null
  sourceType?: string | null
  reversalOf?: number | string | { id?: number | string | null } | null
  postedAt?: string | null
  postedBy?: number | string | null
}

export class AccountingPostingService {
  static async prepareForPersistence({
    payload,
    data,
    originalDoc,
    userId,
    context,
  }: {
    payload: Payload
    data: JournalEntryData
    originalDoc?: Record<string, any> | null
    userId?: number | string | null
    context?: Record<string, unknown> | null
  }) {
    const preparedData = { ...data }

    if (!preparedData.postingDate && preparedData.entryDate) {
      preparedData.postingDate = preparedData.entryDate
    }

    const nextStatus = String(preparedData.status || originalDoc?.status || 'draft')

    if (nextStatus !== 'posted') {
      preparedData.postingStatus =
        nextStatus === 'reversed' || nextStatus === 'voided' ? nextStatus : 'unposted'

      return preparedData
    }

    if (
      originalDoc &&
      ['posted', 'reversed', 'voided'].includes(String(originalDoc.status || '')) &&
      !context?.[ACCOUNTING_HOOK_CONTEXT.skipPostedImmutability]
    ) {
      throw new Error('Posted journal entries cannot be posted again.')
    }

    if (!originalDoc?.id) {
      throw new Error('Journal entries must exist before they can be posted.')
    }

    const postingDate = preparedData.postingDate || preparedData.entryDate || originalDoc.postingDate

    if (!postingDate) {
      throw new Error('A posting date is required before a journal can be posted.')
    }

    const { fiscalYear, period } = await AccountingPeriodService.ensurePostingAllowed(payload, postingDate)
    const lines = await AccountingJournalService.getJournalLines(payload, originalDoc.id)

    await AccountingJournalService.validateLinesForEntry(payload, lines, {
      sourceType: String(preparedData.sourceType || originalDoc.sourceType || 'manual'),
    })

    if (preparedData.sourceType === 'reversal') {
      const reversalOfId = getRelationshipId(preparedData.reversalOf)

      if (!reversalOfId) {
        throw new Error('Reversal journal entries must reference the journal entry being reversed.')
      }

      await AccountingJournalService.validateReversalEntry(payload, reversalOfId, lines)
    }

    const { totalDebit, totalCredit, isBalanced } = AccountingJournalService.calculateTotals(lines)

    return {
      ...preparedData,
      fiscalYear: fiscalYear.id,
      period: period.id,
      totalDebit,
      totalCredit,
      isBalanced,
      status: 'posted',
      postingStatus: 'posted',
      postedAt: new Date().toISOString(),
      postedBy: userId || preparedData.postedBy || originalDoc.postedBy || null,
    }
  }
}
