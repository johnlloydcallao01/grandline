import { APIError, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import type { AccountingEnrollmentFinanceSummary } from '../../types/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { findAllDocs } from '../../utils/findAllDocs'
import {
  buildLmsChargeBreakdown,
  buildUserDisplayName,
  ensureDoc,
  getCourseBasePrice,
  getCourseSalePrice,
  getEnrollmentUserId,
  getInvoiceBalanceDue,
  getLmsBillingStatus,
  getSingleDoc,
  LMS_CURRENCY,
} from '../../utils/lms'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import { AccountingCustomerService } from '../customers/AccountingCustomerService'

type EnrollmentFinanceContext = {
  enrollment: any
  course: any
  trainee: any
  user: any
  billingLink: any
  invoice: any
  customer: any
  feeProfile: any
  scholarshipAwards: any[]
  corporateLinks: any[]
  adjustments: any[]
  allocations: any[]
  refund: any
}

export class AccountingEnrollmentBillingService {
  static async findBillingLinkByEnrollment(payload: Payload, enrollmentId: number | string, depth = 2) {
    return getSingleDoc({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      where: {
        enrollment: {
          equals: enrollmentId,
        },
      },
      depth,
    })
  }

  static async ensureCustomerForEnrollment({
    payload,
    trainee,
    user,
  }: {
    payload: Payload
    trainee: any
    user: any
  }) {
    const email = String(user?.email || '').trim().toLowerCase()

    if (email) {
      const existingCustomer = await getSingleDoc({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.customers,
        where: {
          email: {
            equals: email,
          },
        },
      })

      if (existingCustomer) {
        return existingCustomer
      }
    }

    const customerCode = await AccountingCustomerService.generateCustomerCode(payload)
    const [currencyReference, paymentTermReference] = await Promise.all([
      AccountingCustomerService.getRequiredCurrencyReference(payload, LMS_CURRENCY),
      AccountingCustomerService.getRequiredPaymentTermReference(payload, { name: 'Due on receipt', code: 'CASH' }),
    ])
    const createdCustomer = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      overrideAccess: true,
      depth: 1,
      data: {
        customerCode,
        displayName: buildUserDisplayName(user),
        legalName: buildUserDisplayName(user),
        customerType: 'individual',
        email: email || undefined,
        phone: user?.phone || undefined,
        billingAddress: user?.completeAddress || undefined,
        currencyReference,
        paymentTermReference,
        status: 'active',
        notes: trainee?.srn ? `Auto-created from trainee ${trainee.srn}` : 'Auto-created from LMS enrollment',
      },
    })

    return createdCustomer
  }

  static async getFinanceContext(payload: Payload, enrollmentId: number | string): Promise<EnrollmentFinanceContext> {
    const enrollment = ensureDoc(
      await payload.findByID({
        collection: 'course-enrollments',
        id: enrollmentId,
        depth: 2,
        overrideAccess: true,
      }),
      'Enrollment not found.',
    )
    const courseId = getRelationshipId(enrollment.course)
    const traineeId = getRelationshipId(enrollment.student)

    if (!courseId || !traineeId) {
      throw new APIError('Enrollment is missing required course or trainee relationships.', 400)
    }

    const [course, trainee, billingLink, feeProfile] = await Promise.all([
      typeof enrollment.course === 'object'
        ? enrollment.course
        : payload.findByID({ collection: 'courses', id: courseId, depth: 1, overrideAccess: true }),
      typeof enrollment.student === 'object'
        ? enrollment.student
        : payload.findByID({ collection: 'trainees', id: traineeId, depth: 1, overrideAccess: true }),
      this.findBillingLinkByEnrollment(payload, enrollmentId, 2),
      getSingleDoc({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
        where: {
          course: {
            equals: courseId,
          },
        },
        depth: 1,
      }),
    ])

    const userId = getRelationshipId(trainee?.user) || (await getEnrollmentUserId(payload, traineeId))
    const user =
      typeof trainee?.user === 'object'
        ? trainee.user
        : userId
          ? await payload.findByID({ collection: 'users', id: userId, depth: 0, overrideAccess: true })
          : null

    const [invoice, customer, scholarshipAwards, corporateLinks, adjustments, allocations, refund] =
      await Promise.all([
        getRelationshipId(billingLink?.invoice)
          ? payload.findByID({
              collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
              id: getRelationshipId(billingLink?.invoice)!,
              depth: 1,
              overrideAccess: true,
            })
          : null,
        getRelationshipId(billingLink?.customer)
          ? payload.findByID({
              collection: ACCOUNTING_COLLECTION_SLUGS.customers,
              id: getRelationshipId(billingLink?.customer)!,
              depth: 0,
              overrideAccess: true,
            })
          : null,
        billingLink?.id
          ? findAllDocs<any>({
              payload,
              collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
              where: {
                and: [
                  { enrollmentBillingLink: { equals: billingLink.id } },
                  { status: { equals: 'active' } },
                ],
              },
              depth: 1,
            })
          : [],
        billingLink?.id
          ? findAllDocs<any>({
              payload,
              collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
              where: {
                and: [
                  { enrollmentBillingLink: { equals: billingLink.id } },
                  { status: { equals: 'active' } },
                ],
              },
              depth: 1,
            })
          : [],
        billingLink?.id
          ? findAllDocs<any>({
              payload,
              collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
              where: {
                enrollmentBillingLink: {
                  equals: billingLink.id,
                },
              },
              depth: 0,
            })
          : [],
        billingLink?.id
          ? findAllDocs<any>({
              payload,
              collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
              where: {
                enrollmentBillingLink: {
                  equals: billingLink.id,
                },
              },
              depth: 0,
            })
          : [],
        billingLink?.id
          ? getSingleDoc({
              payload,
              collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
              where: {
                and: [
                  { enrollmentBillingLink: { equals: billingLink.id } },
                  { status: { not_equals: 'voided' } },
                ],
              },
              depth: 0,
            })
          : null,
      ])

    return {
      enrollment,
      course,
      trainee,
      user,
      billingLink,
      invoice,
      customer,
      feeProfile,
      scholarshipAwards,
      corporateLinks,
      adjustments,
      allocations,
      refund,
    }
  }

  static buildFinanceSummaryFromContext(context: EnrollmentFinanceContext): AccountingEnrollmentFinanceSummary {
    const { enrollment, course, billingLink, invoice, customer, scholarshipAwards, corporateLinks, adjustments, allocations, refund } = context

    const listPrice = normalizeAmount(enrollment?.listPriceSnapshot ?? getCourseBasePrice(course))
    const enrollmentFinal = normalizeAmount(enrollment?.finalPriceSnapshot)
    const couponDiscount = normalizeAmount(enrollment?.couponDiscountAmount)
    const salePrice = roundCurrency(
      enrollmentFinal > 0
        ? enrollmentFinal + couponDiscount
        : getCourseSalePrice(course),
    )

    const scholarshipDiscount = roundCurrency(
      scholarshipAwards.reduce((total, award) => {
        return String(award?.awardType || '') === 'third_party_billed'
          ? total
          : total + normalizeAmount(award?.awardAmount)
      }, 0),
    )
    const sponsorCoverage = roundCurrency(
      scholarshipAwards.reduce((total, award) => {
        return String(award?.awardType || '') === 'third_party_billed'
          ? total + normalizeAmount(award?.awardAmount)
          : total
      }, 0),
    )
    const corporateCoverage = roundCurrency(
      sponsorCoverage +
        corporateLinks.reduce((total, link) => total + normalizeAmount(link?.coveredAmount), 0),
    )
    const adjustmentsNet = roundCurrency(
      adjustments.reduce((total, adjustment) => {
        const amount = normalizeAmount(adjustment?.amount)
        return String(adjustment?.direction || 'increase') === 'decrease'
          ? total - amount
          : total + amount
      }, 0),
    )
    const chargeBreakdown = buildLmsChargeBreakdown({
      listPrice,
      salePrice,
      couponDiscount,
      scholarshipDiscount,
      corporateCoverage,
      adjustmentsNet,
    })

    const amountAllocated = roundCurrency(
      allocations.reduce((total, allocation) => total + normalizeAmount(allocation?.allocatedAmount), 0),
    )
    const balanceDue = invoice ? getInvoiceBalanceDue(invoice) : Math.max(0, chargeBreakdown.finalCharge - amountAllocated)
    const amountPaid = roundCurrency(Math.max(0, chargeBreakdown.finalCharge - balanceDue))

    return {
      enrollmentId: enrollment.id,
      billingLinkId: billingLink?.id || null,
      invoiceId: invoice?.id || null,
      invoiceNumber: invoice?.invoiceNumber || null,
      customerId: customer?.id || null,
      customerName: customer?.displayName || null,
      enrollmentType: enrollment?.enrollmentType || null,
      billingStatus: getLmsBillingStatus({
        invoiceStatus: invoice?.status || billingLink?.billingStatus,
        refundStatus: refund?.status || null,
      }) as AccountingEnrollmentFinanceSummary['billingStatus'],
      listPrice: chargeBreakdown.listPrice,
      salePrice: chargeBreakdown.salePrice,
      couponDiscount: chargeBreakdown.couponDiscount,
      scholarshipDiscount: chargeBreakdown.scholarshipDiscount,
      corporateCoverage: chargeBreakdown.corporateCoverage,
      adjustmentsNet: chargeBreakdown.adjustmentsNet,
      finalCharge: chargeBreakdown.finalCharge,
      amountAllocated,
      amountPaid,
      balanceDue: roundCurrency(balanceDue),
      currency: String(billingLink?.currency || invoice?.currency || LMS_CURRENCY),
    }
  }

  static async getEnrollmentFinanceSummary(payload: Payload, enrollmentId: number | string) {
    const context = await this.getFinanceContext(payload, enrollmentId)
    return this.buildFinanceSummaryFromContext(context)
  }

  static async ensureBillingLink({
    payload,
    enrollmentId,
  }: {
    payload: Payload
    enrollmentId: number | string
  }) {
    const context = await this.getFinanceContext(payload, enrollmentId)
    const customer = context.customer || (await this.ensureCustomerForEnrollment({
      payload,
      trainee: context.trainee,
      user: context.user,
    }))
    const summary = this.buildFinanceSummaryFromContext({
      ...context,
      customer,
    })
    const courseRelationId = getRelationshipId(context.course?.id) || context.course?.id
    const traineeRelationId = getRelationshipId(context.trainee?.id) || context.trainee?.id
    const userRelationId = getRelationshipId(context.user?.id) || getRelationshipId(context.trainee?.user)
    const invoiceRelationId =
      getRelationshipId(context.billingLink?.invoice) || getRelationshipId(context.invoice?.id)
    const courseId =
      typeof courseRelationId === 'number' ? courseRelationId : courseRelationId ? Number(courseRelationId) : undefined
    const traineeId =
      typeof traineeRelationId === 'number' ? traineeRelationId : traineeRelationId ? Number(traineeRelationId) : undefined
    const userId =
      typeof userRelationId === 'number' ? userRelationId : userRelationId ? Number(userRelationId) : undefined
    const invoiceId =
      typeof invoiceRelationId === 'number' ? invoiceRelationId : invoiceRelationId ? Number(invoiceRelationId) : undefined

    const data: RequiredDataFromCollectionSlug<'accounting-enrollment-billing-links'> = {
      enrollment: context.enrollment.id,
      course: courseId ?? context.enrollment.course,
      trainee: traineeId ?? context.enrollment.trainee,
      user: userId,
      invoice: invoiceId,
      customer: customer.id,
      billingStatus: summary.billingStatus,
      sourceType: 'enrollment',
      sourceReference: `ENR-${context.enrollment.id}`,
      listPriceSnapshot: summary.listPrice,
      salePriceSnapshot: summary.salePrice,
      couponDiscountSnapshot: summary.couponDiscount,
      scholarshipDiscountSnapshot: summary.scholarshipDiscount,
      corporateCoverageSnapshot: summary.corporateCoverage,
      adjustmentsNetSnapshot: summary.adjustmentsNet,
      finalChargeSnapshot: summary.finalCharge,
      recognizedRevenueSnapshot: normalizeAmount(context.billingLink?.recognizedRevenueSnapshot),
      currency: summary.currency,
      metadata: {
        enrollmentStatus: context.enrollment?.status || null,
        paymentStatus: context.enrollment?.paymentStatus || null,
        couponCode: context.enrollment?.couponCode || null,
        pricingBreakdown: context.enrollment?.pricingBreakdown || null,
      },
    }

    if (context.billingLink?.id) {
      return payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        id: context.billingLink.id,
        overrideAccess: true,
        depth: 2,
        data,
      })
    }

    return payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      overrideAccess: true,
      depth: 2,
      data,
    })
  }

  static async syncEnrollmentOperationalPaymentState(payload: Payload, enrollmentId: number | string) {
    const summary = await this.getEnrollmentFinanceSummary(payload, enrollmentId)
    const paymentStatus =
      summary.finalCharge <= 0
        ? 'not_required'
        : summary.billingStatus === 'refunded'
          ? 'refunded'
          : summary.amountPaid >= summary.finalCharge
            ? 'completed'
            : 'pending'

    const current = await payload.findByID({
      collection: 'course-enrollments',
      id: enrollmentId,
      depth: 0,
      overrideAccess: true,
    })

    const currentPaymentStatus = typeof current.paymentStatus === 'string' ? current.paymentStatus : ''
    const currentAmountPaid = Number(current.amountPaid ?? 0)

    if (currentPaymentStatus === paymentStatus && currentAmountPaid === summary.amountPaid) {
      return
    }

    return payload.update({
      collection: 'course-enrollments',
      id: enrollmentId,
      overrideAccess: true,
      depth: 1,
      data: {
        amountPaid: summary.amountPaid,
        paymentStatus,
        metadata: {
          accountingSummary: summary,
        },
      },
    })
  }
}
