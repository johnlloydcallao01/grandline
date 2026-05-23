import { APIError, type PayloadRequest } from 'payload'
import { getGeneralLedger } from '@/accounting/queries/getGeneralLedger'
import { buildAccountingJsonResponse, getUrl, requireAccountingAdmin } from './utils'

export const getAccountingGeneralLedgerEndpoint = async (req: PayloadRequest) => {
  try {
    requireAccountingAdmin(req)

    const url = getUrl(req)
    const accountId = url.searchParams.get('accountId')
    const fromDate = url.searchParams.get('fromDate')
    const toDate = url.searchParams.get('toDate')
    const fiscalYearId = url.searchParams.get('fiscalYearId')
    const periodId = url.searchParams.get('periodId')

    const rows = await getGeneralLedger(req.payload, {
      accountId: accountId || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      fiscalYearId: fiscalYearId || undefined,
      periodId: periodId || undefined,
    })

    return buildAccountingJsonResponse({
      success: true,
      rows,
      totalRows: rows.length,
    })
  } catch (error) {
    console.error('Error fetching accounting general ledger:', error)

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
