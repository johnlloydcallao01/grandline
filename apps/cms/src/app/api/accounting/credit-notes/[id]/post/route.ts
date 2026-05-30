import { NextRequest, NextResponse } from 'next/server'
import { AccountingCreditNoteService } from '@/accounting/services/invoices/AccountingCreditNoteService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params

    const record = await AccountingCreditNoteService.postCreditNote({
      payload,
      creditNoteId: params.id,
      userId: user.id,
    })

    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
