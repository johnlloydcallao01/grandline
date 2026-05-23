import { APIError, type PayloadRequest } from 'payload'
import { AccountingManualWorkflowService } from '@/accounting/services/journals/AccountingManualWorkflowService'
import { buildAccountingJsonResponse, parseAccountingRequestBody, requireAccountingAdmin } from './utils'

export const reverseAccountingJournalEntryEndpoint = async (req: PayloadRequest) => {
  try {
    const user = requireAccountingAdmin(req)
    const body = await parseAccountingRequestBody(req)
    const journalEntryId = body?.journalEntryId

    if (!journalEntryId) {
      throw new APIError('journalEntryId is required.', 400)
    }

    const reversalEntry = await AccountingManualWorkflowService.createReversalEntry({
      payload: req.payload,
      journalEntryId,
      userId: user.id,
      postingDate: typeof body?.postingDate === 'string' ? body.postingDate : undefined,
      entryDate: typeof body?.entryDate === 'string' ? body.entryDate : undefined,
      memo: typeof body?.memo === 'string' ? body.memo : undefined,
      referenceNumber: typeof body?.referenceNumber === 'string' ? body.referenceNumber : undefined,
    })

    return buildAccountingJsonResponse({
      success: true,
      reversalEntry,
    })
  } catch (error) {
    console.error('Error reversing accounting journal entry:', error)

    const status = error instanceof APIError ? error.status : 500

    return buildAccountingJsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status },
    )
  }
}
