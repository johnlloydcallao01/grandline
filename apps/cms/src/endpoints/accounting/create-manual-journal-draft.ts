import { APIError, type PayloadRequest } from 'payload'
import { AccountingManualWorkflowService } from '@/accounting/services/journals/AccountingManualWorkflowService'
import { buildAccountingJsonResponse, parseAccountingRequestBody, requireAccountingAdmin } from './utils'

export const createAccountingManualJournalDraftEndpoint = async (req: PayloadRequest) => {
  try {
    const user = requireAccountingAdmin(req)
    const body = await parseAccountingRequestBody(req)

    if (!Array.isArray(body?.lines) || body.lines.length === 0) {
      throw new APIError('lines are required to create a manual journal draft.', 400)
    }

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload: req.payload,
      userId: user.id,
      sourceType: 'manual',
      entryDate: typeof body?.entryDate === 'string' ? body.entryDate : undefined,
      postingDate: typeof body?.postingDate === 'string' ? body.postingDate : undefined,
      memo: typeof body?.memo === 'string' ? body.memo : undefined,
      referenceNumber: typeof body?.referenceNumber === 'string' ? body.referenceNumber : undefined,
      sourceReference: typeof body?.sourceReference === 'string' ? body.sourceReference : undefined,
      autoPost: false,
      lines: body.lines,
    })

    return buildAccountingJsonResponse({
      success: true,
      journalEntry,
    })
  } catch (error) {
    console.error('Error creating accounting manual journal draft:', error)

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
