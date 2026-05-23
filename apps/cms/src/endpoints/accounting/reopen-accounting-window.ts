import { APIError, type PayloadRequest } from 'payload'
import { AccountingCloseService } from '@/accounting/services/periods/AccountingCloseService'
import { buildAccountingJsonResponse, parseAccountingRequestBody, requireAccountingAdmin } from './utils'

export const reopenAccountingWindowEndpoint = async (req: PayloadRequest) => {
  try {
    const user = requireAccountingAdmin(req)
    const body = await parseAccountingRequestBody(req)
    const target = AccountingCloseService.parseCloseTarget(body?.target)
    const clearLockDate = Boolean(body?.clearLockDate)

    if (target === 'period') {
      if (!body?.periodId) {
        throw new APIError('periodId is required when reopening a period.', 400)
      }

      const period = await AccountingCloseService.reopenPeriod({
        payload: req.payload,
        periodId: body.periodId,
        userId: user.id,
        clearLockDate,
      })

      return buildAccountingJsonResponse({ success: true, target, record: period })
    }

    if (!body?.fiscalYearId) {
      throw new APIError('fiscalYearId is required when reopening a fiscal year.', 400)
    }

    const fiscalYear = await AccountingCloseService.reopenFiscalYear({
      payload: req.payload,
      fiscalYearId: body.fiscalYearId,
      userId: user.id,
      clearLockDate,
    })

    return buildAccountingJsonResponse({ success: true, target, record: fiscalYear })
  } catch (error) {
    console.error('Error reopening accounting window:', error)

    const status = error instanceof APIError ? error.status : 500
    return buildAccountingJsonResponse(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status },
    )
  }
}
