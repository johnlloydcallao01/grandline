import { NextRequest, NextResponse } from 'next/server'
import { AccountingEnrollmentInvoiceService } from '@/accounting/services/enrollment-billing/AccountingEnrollmentInvoiceService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json().catch(() => ({}))
    const invoice = await AccountingEnrollmentInvoiceService.ensureInvoiceForEnrollment({
      payload,
      enrollmentId: params.id,
      userId: user.id,
      createZeroValueInvoice: body?.createZeroValueInvoice !== false,
      autoPost: Boolean(body?.autoPost),
    })
    return NextResponse.json(invoice)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
