import { APIError, type PayloadRequest } from 'payload'
import { getTrialBalance } from '@/accounting/queries/getTrialBalance'
import { buildAccountingJsonResponse, getUrl, requireAccountingAdmin } from './utils'

export const getAccountingTrialBalanceEndpoint = async (req: PayloadRequest) => {
  try {
    requireAccountingAdmin(req)

    const url = getUrl(req)
    const fromDate = url.searchParams.get('fromDate')
    const toDate = url.searchParams.get('toDate')
    const fiscalYearId = url.searchParams.get('fiscalYearId')
    const periodId = url.searchParams.get('periodId')
    const includeZeroBalances = url.searchParams.get('includeZeroBalances') === 'true'

    const rows = await getTrialBalance(req.payload, {
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      fiscalYearId: fiscalYearId || undefined,
      periodId: periodId || undefined,
      includeZeroBalances,
    })

    return buildAccountingJsonResponse({
      success: true,
      rows,
      totalRows: rows.length,
    })
  } catch (error) {
    console.error('Error fetching accounting trial balance:', error)

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
