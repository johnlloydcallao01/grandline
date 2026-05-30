import { NextRequest, NextResponse } from 'next/server'
import { AccountingInvoiceService } from '@/accounting/services/invoices/AccountingInvoiceService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params

    const invoice = await AccountingInvoiceService.postInvoice({
      payload,
      invoiceId: params.id,
      userId: user.id,
    })

    return NextResponse.json(invoice)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
