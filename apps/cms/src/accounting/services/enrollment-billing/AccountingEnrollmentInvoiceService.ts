import { APIError, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { LMS_CURRENCY } from '../../utils/lms'
import { AccountingInvoiceService } from '../invoices/AccountingInvoiceService'
import { AccountingEnrollmentBillingService } from './AccountingEnrollmentBillingService'

const addDays = (value: string | Date | null | undefined, days: number) => {
  const date = new Date(value || new Date().toISOString())
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export class AccountingEnrollmentInvoiceService {
  static getRecognitionMethod(feeProfile: any) {
    return String(feeProfile?.defaultRecognitionMethod || 'on_activation')
  }

  static async resolveEnrollmentRevenueAccount(payload: Payload, feeProfile: any) {
    const recognitionMethod = this.getRecognitionMethod(feeProfile)
    const deferredAccountId = getRelationshipId(feeProfile?.deferredRevenueAccount)
    const courseRevenueAccountId =
      getRelationshipId(feeProfile?.courseRevenueAccount) ||
      getRelationshipId(feeProfile?.certificateRevenueAccount)

    if (
      ['straight_line', 'completion_based', 'certificate_based'].includes(recognitionMethod) &&
      deferredAccountId
    ) {
      return deferredAccountId
    }

    if (courseRevenueAccountId) {
      return courseRevenueAccountId
    }

    const revenueAccount = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      where: {
        accountType: {
          equals: 'revenue',
        },
      },
      sort: 'accountCode',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const accountId = revenueAccount.docs[0]?.id
    if (!accountId) {
      throw new APIError('A revenue account must exist before enrollment invoices can be created.', 400)
    }

    return accountId
  }

  static isInvoiceMutable(invoice: any) {
    try {
      AccountingCommercialService.assertMutableStatus(invoice?.status, 'Invoice')
      return true
    } catch (_error) {
      return false
    }
  }

  static buildEnrollmentInvoiceLineData({
    invoiceId,
    enrollmentId,
    courseTitle,
    amount,
    incomeAccount,
    summary,
    recognitionMethod,
  }: {
    invoiceId: number | string
    enrollmentId: number | string
    courseTitle?: string | null
    amount: number
    incomeAccount: number
    summary: unknown
    recognitionMethod: string
  }): RequiredDataFromCollectionSlug<'accounting-invoice-line-items'> {
    const normalizedInvoiceId =
      typeof invoiceId === 'number' ? invoiceId : invoiceId ? Number(invoiceId) : undefined

    if (!normalizedInvoiceId) {
      throw new APIError('Enrollment invoice lines require a numeric invoice id.', 400)
    }

    return {
      invoice: normalizedInvoiceId,
      lineNumber: 1,
      description: `${courseTitle || 'Course'} enrollment charge`,
      itemType: 'service',
      quantity: 1,
      unitPrice: normalizeAmount(amount),
      discountAmount: 0,
      incomeAccount,
      referenceEntityType: 'enrollment',
      referenceEntityId: String(enrollmentId),
      metadata: {
        enrollmentId: String(enrollmentId),
        pricingSummary: summary,
        recognitionMethod,
      },
    }
  }

  static async upsertEnrollmentInvoiceLine({
    payload,
    invoiceId,
    enrollmentId,
    courseTitle,
    amount,
    incomeAccount,
    summary,
    recognitionMethod,
  }: {
    payload: Payload
    invoiceId: number | string
    enrollmentId: number | string
    courseTitle?: string | null
    amount: number
    incomeAccount: number
    summary: unknown
    recognitionMethod: string
  }) {
    const existingLines = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
      where: {
        and: [
          {
            invoice: {
              equals: invoiceId,
            },
          },
          {
            referenceEntityType: {
              equals: 'enrollment',
            },
          },
          {
            referenceEntityId: {
              equals: String(enrollmentId),
            },
          },
        ],
      },
      sort: 'lineNumber',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const lineData = this.buildEnrollmentInvoiceLineData({
      invoiceId,
      enrollmentId,
      courseTitle,
      amount,
      incomeAccount,
      summary,
      recognitionMethod,
    })

    if (existingLines.docs[0]?.id) {
      return payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
        id: existingLines.docs[0].id,
        overrideAccess: true,
        depth: 1,
        data: {
          ...lineData,
          lineNumber: existingLines.docs[0].lineNumber || 1,
        },
      })
    }

    return payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
      overrideAccess: true,
      depth: 1,
      data: lineData,
    })
  }

  static async ensureInvoiceForEnrollment({
    payload,
    enrollmentId,
    userId,
    createZeroValueInvoice = true,
    autoPost = false,
  }: {
    payload: Payload
    enrollmentId: number | string
    userId?: number | string | null
    createZeroValueInvoice?: boolean
    autoPost?: boolean
  }) {
    const billingLink = await AccountingEnrollmentBillingService.ensureBillingLink({
      payload,
      enrollmentId,
    })
    const billingLinkInvoiceRelationId = getRelationshipId((billingLink as any)?.invoice)
    const billingLinkCustomerRelationId = getRelationshipId((billingLink as any)?.customer)
    const billingLinkInvoiceId =
      typeof billingLinkInvoiceRelationId === 'number'
        ? billingLinkInvoiceRelationId
        : billingLinkInvoiceRelationId
          ? Number(billingLinkInvoiceRelationId)
          : undefined
    const billingLinkCustomerId =
      typeof billingLinkCustomerRelationId === 'number'
        ? billingLinkCustomerRelationId
        : billingLinkCustomerRelationId
          ? Number(billingLinkCustomerRelationId)
          : undefined
    const summary = await AccountingEnrollmentBillingService.getEnrollmentFinanceSummary(payload, enrollmentId)
    const context = await AccountingEnrollmentBillingService.getFinanceContext(payload, enrollmentId)

    const recognitionMethod = this.getRecognitionMethod(context.feeProfile)
    const resolvedIncomeAccount = await this.resolveEnrollmentRevenueAccount(payload, context.feeProfile)
    const incomeAccount =
      typeof resolvedIncomeAccount === 'number'
        ? resolvedIncomeAccount
        : resolvedIncomeAccount
          ? Number(resolvedIncomeAccount)
          : undefined

    if (!billingLinkCustomerId) {
      throw new APIError('Enrollment billing link must have an accounting customer before invoicing.', 400)
    }
    if (!incomeAccount) {
      throw new APIError('Enrollment invoicing requires a valid revenue account.', 400)
    }

    if (billingLinkInvoiceId) {
      const existingInvoice = await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        id: billingLinkInvoiceId,
        depth: 2,
        overrideAccess: true,
      })

      if (this.isInvoiceMutable(existingInvoice)) {
        await this.upsertEnrollmentInvoiceLine({
          payload,
          invoiceId: billingLinkInvoiceId,
          enrollmentId,
          courseTitle: context.course?.title,
          amount: summary.finalCharge,
          incomeAccount,
          summary,
          recognitionMethod,
        })

        await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
          id: getRelationshipId((billingLink as any)?.id ?? billingLink)!,
          overrideAccess: true,
          depth: 1,
          data: {
            customer: billingLinkCustomerId,
            billingStatus: (normalizeAmount(summary.finalCharge) > 0 ? 'drafted' : 'paid') as
              | 'drafted'
              | 'paid',
          },
        })

        return payload.findByID({
          collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
          id: billingLinkInvoiceId,
          depth: 2,
          overrideAccess: true,
        })
      }

      return existingInvoice
    }

    if (summary.finalCharge <= 0 && !createZeroValueInvoice) {
      return null
    }

    const invoiceDate = context.enrollment?.enrolledAt || new Date().toISOString()
    const dueDate = addDays(invoiceDate, context.enrollment?.enrollmentType === 'corporate' ? 30 : 7)

    const invoiceNumber = await AccountingInvoiceService.generateInvoiceNumber(payload)

    const invoiceData: RequiredDataFromCollectionSlug<'accounting-invoices'> = {
      customer: billingLinkCustomerId,
      invoiceNumber,
      invoiceDate,
      postingDate: invoiceDate,
      dueDate,
      currency: summary.currency || LMS_CURRENCY,
      exchangeRate: 1,
      status: 'draft' as const,
      postingStatus: 'unposted',
      sourceType: 'lms_enrollment' as const,
      sourceReference: `ENR-${enrollmentId}`,
      memo: `${context.course?.title || 'Course'} enrollment billing`,
    }

    const invoice = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      overrideAccess: true,
      depth: 2,
      data: invoiceData,
    })

    await this.upsertEnrollmentInvoiceLine({
      payload,
      invoiceId: invoice.id,
      enrollmentId,
      courseTitle: context.course?.title,
      amount: summary.finalCharge,
      incomeAccount,
      summary,
      recognitionMethod,
    })

    const refreshedInvoice = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoice.id,
      depth: 2,
      overrideAccess: true,
    })

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      id: getRelationshipId((billingLink as any)?.id ?? billingLink)!,
      overrideAccess: true,
      depth: 2,
      data: {
        invoice: invoice.id,
        customer: billingLinkCustomerId,
        billingStatus: (summary.finalCharge > 0 ? 'drafted' : 'paid') as 'drafted' | 'paid',
      },
    })

    if (autoPost && normalizeAmount(summary.finalCharge) > 0) {
      return AccountingInvoiceService.postInvoice({
        payload,
        invoiceId: invoice.id,
        userId,
      })
    }

    return refreshedInvoice
  }
}
