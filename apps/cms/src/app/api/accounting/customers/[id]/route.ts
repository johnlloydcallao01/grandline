import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const countInvoicesForCustomer = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  customerId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
    where: {
      customer: {
        equals: customerId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countPaymentsReceivedForCustomer = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  customerId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
    where: {
      customer: {
        equals: customerId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

const countCreditNotesForCustomer = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  customerId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
    where: {
      customer: {
        equals: customerId,
      },
    } as never,
    overrideAccess: true,
  })

  return Number(usage.totalDocs || 0)
}

type CustomerUsageSummary = {
  invoiceCount: number
  paymentReceivedCount: number
  creditNoteCount: number
  hasDependents: boolean
}

const computeCustomerUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  customerId: number | string,
): Promise<CustomerUsageSummary> => {
  const [invoiceCount, paymentReceivedCount, creditNoteCount] = await Promise.all([
    countInvoicesForCustomer(payload, customerId),
    countPaymentsReceivedForCustomer(payload, customerId),
    countCreditNotesForCustomer(payload, customerId),
  ])

  return {
    invoiceCount,
    paymentReceivedCount,
    creditNoteCount,
    hasDependents: invoiceCount > 0 || paymentReceivedCount > 0 || creditNoteCount > 0,
  }
}

const buildCustomerDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: Record<string, unknown>,
) => {
  const usage = await computeCustomerUsageSummary(payload, record.id as number | string)

  return {
    ...record,
    usageSummary: {
      invoiceCount: usage.invoiceCount,
      paymentReceivedCount: usage.paymentReceivedCount,
      creditNoteCount: usage.creditNoteCount,
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json(await buildCustomerDetailResponse(payload, record as unknown as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = await request.json()

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      },
    })

    return NextResponse.json(await buildCustomerDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const customerId = parseNumberParam(id) || id

    const usage = await computeCustomerUsageSummary(payload, customerId)

    const barriers: string[] = []

    if (usage.invoiceCount > 0) {
      barriers.push(`referenced by ${usage.invoiceCount} invoice(s)`)
    }

    if (usage.paymentReceivedCount > 0) {
      barriers.push(`referenced by ${usage.paymentReceivedCount} payment(s) received`)
    }

    if (usage.creditNoteCount > 0) {
      barriers.push(`referenced by ${usage.creditNoteCount} credit note(s)`)
    }

    if (barriers.length > 0) {
      throw new AccountingApiError(
        `Cannot delete customer: ${barriers.join(', ')}. Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      id: customerId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
