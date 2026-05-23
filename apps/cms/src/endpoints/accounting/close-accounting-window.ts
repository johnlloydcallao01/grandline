import { APIError, type PayloadRequest } from 'payload'
import { AccountingCloseService } from '@/accounting/services/periods/AccountingCloseService'
import { buildAccountingJsonResponse, parseAccountingRequestBody, requireAccountingAdmin } from './utils'

export const closeAccountingWindowEndpoint = async (req: PayloadRequest) => {
  try {
    const user = requireAccountingAdmin(req)
    const body = await parseAccountingRequestBody(req)
    const target = AccountingCloseService.parseCloseTarget(body?.target)

    if (target === 'period') {
      if (!body?.periodId) {
        throw new APIError('periodId is required when closing a period.', 400)
      }

      const period = await AccountingCloseService.closePeriod({
        payload: req.payload,
        periodId: body.periodId,
        userId: user.id,
        lockedFromDate: typeof body?.lockedFromDate === 'string' ? body.lockedFromDate : undefined,
      })

      return buildAccountingJsonResponse({ success: true, target, record: period })
    }

    if (!body?.fiscalYearId) {
      throw new APIError('fiscalYearId is required when closing a fiscal year.', 400)
    }

    const fiscalYear = await AccountingCloseService.closeFiscalYear({
      payload: req.payload,
      fiscalYearId: body.fiscalYearId,
      userId: user.id,
      lockedFromDate: typeof body?.lockedFromDate === 'string' ? body.lockedFromDate : undefined,
    })

    return buildAccountingJsonResponse({ success: true, target, record: fiscalYear })
  } catch (error) {
    console.error('Error closing accounting window:', error)

    const status = error instanceof APIError ? error.status : 500
    return buildAccountingJsonResponse(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status },
    )
  }
}
