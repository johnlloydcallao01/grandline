import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount } from '../../utils/amounts'
import { AccountingEnrollmentBillingService } from '../enrollment-billing/AccountingEnrollmentBillingService'

export class AccountingLmsPaymentAllocationService {
  static async rebuildAllocationsForPayment(payload: Payload, paymentId: number | string) {
    const payment = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: paymentId,
      depth: 2,
      overrideAccess: true,
    })

    if (!payment) {
      throw new APIError('Payment received record not found.', 404)
    }

    const existing = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
      where: {
        paymentReceived: {
          equals: paymentId,
        },
      },
      depth: 0,
    })

    for (const allocation of existing) {
      await payload.delete({
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
        id: allocation.id,
        overrideAccess: true,
      })
    }

    const applications = Array.isArray(payment.applications) ? payment.applications : []
    const createdAllocations: any[] = []

    for (const application of applications) {
      const invoiceId = getRelationshipId(application?.invoice)
      if (!invoiceId) continue
      const normalizedInvoiceId = typeof invoiceId === 'number' ? invoiceId : Number(invoiceId)
      if (!Number.isFinite(normalizedInvoiceId)) continue

      const billingLink = await payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        where: {
          invoice: {
            equals: normalizedInvoiceId,
          },
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      const enrollmentId = getRelationshipId(billingLink.docs[0]?.enrollment)
      const record = await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
        overrideAccess: true,
        depth: 1,
        data: {
          paymentReceived: payment.id,
          invoice: normalizedInvoiceId,
          enrollmentBillingLink: billingLink.docs[0]?.id,
          allocationDate: payment.paymentDate || payment.postingDate || new Date().toISOString(),
          allocatedAmount: normalizeAmount(application?.amountApplied),
          allocationType: (applications.length > 1 ? 'installment_payment' : 'invoice_settlement') as
            | 'invoice_settlement'
            | 'installment_payment',
          notes: payment.notes || undefined,
        },
      })

      createdAllocations.push(record)

      if (enrollmentId) {
        await AccountingEnrollmentBillingService.ensureBillingLink({
          payload,
          enrollmentId,
        })
        await AccountingEnrollmentBillingService.syncEnrollmentOperationalPaymentState(
          payload,
          enrollmentId,
        )
      }
    }

    return createdAllocations
  }

  static async allocatePaymentToEnrollment({
    payload,
    paymentId,
    enrollmentId,
    amount,
  }: {
    payload: Payload
    paymentId: number | string
    enrollmentId: number | string
    amount: number
  }) {
    const billingLink = await AccountingEnrollmentBillingService.ensureBillingLink({
      payload,
      enrollmentId,
    })
    const invoiceId = getRelationshipId((billingLink as any)?.invoice)
    const normalizedInvoiceId = typeof invoiceId === 'number' ? invoiceId : Number(invoiceId)

    if (!invoiceId || !Number.isFinite(normalizedInvoiceId)) {
      throw new APIError('Enrollment must be invoiced before payment allocations can be created.', 400)
    }

    const payment = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: paymentId,
      depth: 1,
      overrideAccess: true,
    })

    if (!payment) {
      throw new APIError('Payment received record not found.', 404)
    }

    const applications = Array.isArray(payment.applications) ? payment.applications : []
    const totalApplied = normalizeAmount(
      applications.reduce((total: number, application: any) => total + normalizeAmount(application?.amountApplied), 0),
    )
    const amountReceived = normalizeAmount(payment.amountReceived)
    const allocationAmount = normalizeAmount(amount)

    if (allocationAmount <= 0) {
      throw new APIError('Allocation amount must be greater than zero.', 400)
    }

    if (totalApplied + allocationAmount > amountReceived) {
      throw new APIError('Allocation would exceed the received amount.', 400)
    }

    const nextApplications = [
      ...applications,
      {
        invoice: normalizedInvoiceId,
        amountApplied: allocationAmount,
      },
    ]

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: paymentId,
      overrideAccess: true,
      depth: 2,
      data: {
        applications: nextApplications,
      },
    })

    return this.rebuildAllocationsForPayment(payload, paymentId)
  }
}
