import { APIError, type PayloadRequest } from 'payload'
import { AccountingManualWorkflowService } from '@/accounting/services/journals/AccountingManualWorkflowService'
import { buildAccountingJsonResponse, parseAccountingRequestBody, requireAccountingAdmin } from './utils'

export const postAccountingJournalEntryEndpoint = async (req: PayloadRequest) => {
  try {
    const user = requireAccountingAdmin(req)
    const body = await parseAccountingRequestBody(req)
    const journalEntryId = body?.journalEntryId

    if (!journalEntryId) {
      throw new APIError('journalEntryId is required.', 400)
    }

    const journalEntry = await AccountingManualWorkflowService.postJournalEntry({
      payload: req.payload,
      journalEntryId,
      userId: user.id,
    })

    return buildAccountingJsonResponse({
      success: true,
      journalEntry,
    })
  } catch (error) {
    console.error('Error posting accounting journal entry:', error)

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
