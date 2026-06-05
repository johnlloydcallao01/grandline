import { APIError, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import { getSingleDoc } from '../../utils/lms'
import { AccountingCustomerService } from '../customers/AccountingCustomerService'
import { AccountingEnrollmentBillingService } from '../enrollment-billing/AccountingEnrollmentBillingService'

export class AccountingScholarshipService {
  static async applyScholarshipAward({
    payload,
    enrollmentId,
    sponsorId,
    awardType,
    awardAmount,
    awardPercent,
    notes,
  }: {
    payload: Payload
    enrollmentId: number | string
    sponsorId: number | string
    awardType: 'full' | 'partial' | 'contra_revenue' | 'third_party_billed'
    awardAmount?: number | null
    awardPercent?: number | null
    notes?: string | null
  }) {
    const billingLink = await AccountingEnrollmentBillingService.ensureBillingLink({
      payload,
      enrollmentId,
    })
    const billingLinkRelationId = getRelationshipId((billingLink as any)?.id ?? billingLink)
    const traineeRelationId = getRelationshipId((billingLink as any)?.trainee)
    const billingLinkId =
      typeof billingLinkRelationId === 'number'
        ? billingLinkRelationId
        : billingLinkRelationId
          ? Number(billingLinkRelationId)
          : undefined
    const traineeId =
      typeof traineeRelationId === 'number' ? traineeRelationId : traineeRelationId ? Number(traineeRelationId) : undefined
    const normalizedSponsorId =
      typeof sponsorId === 'number' ? sponsorId : sponsorId ? Number(sponsorId) : undefined
    const financeSummary = await AccountingEnrollmentBillingService.getEnrollmentFinanceSummary(payload, enrollmentId)

    if (!billingLinkId || !traineeId || !normalizedSponsorId) {
      throw new APIError('Enrollment billing link is missing required trainee linkage.', 400)
    }

    const computedAwardAmount =
      normalizeAmount(awardAmount) > 0
        ? normalizeAmount(awardAmount)
        : roundCurrency(financeSummary.salePrice * (normalizeAmount(awardPercent) / 100))

    if (computedAwardAmount <= 0) {
      throw new APIError('Scholarship awards require a positive amount or percentage.', 400)
    }

    const existingAward = await getSingleDoc<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
      where: {
        and: [
          { enrollmentBillingLink: { equals: billingLinkId } },
          { scholarshipSponsor: { equals: sponsorId } },
          { status: { equals: 'active' } },
        ],
      },
      depth: 0,
    })

    const data: RequiredDataFromCollectionSlug<'accounting-scholarship-awards'> = {
      enrollmentBillingLink: billingLinkId,
      scholarshipSponsor: normalizedSponsorId,
      trainee: traineeId,
      awardType,
      awardAmount: computedAwardAmount,
      awardPercent: normalizeAmount(awardPercent) || undefined,
      traineeShareAmount: Math.max(0, financeSummary.salePrice - computedAwardAmount),
      effectiveDate: new Date().toISOString(),
      status: 'active' as const,
      notes: notes || undefined,
    }

    const award = existingAward?.id
      ? await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
          id: existingAward.id,
          overrideAccess: true,
          depth: 1,
          data,
        })
      : await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
          overrideAccess: true,
          depth: 1,
          data,
        })

    await AccountingEnrollmentBillingService.ensureBillingLink({
      payload,
      enrollmentId,
    })

    return award
  }

  static async ensureSponsorCustomer({
    payload,
    sponsorId,
  }: {
    payload: Payload
    sponsorId: number | string
  }) {
    const sponsor = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
      id: sponsorId,
      depth: 1,
      overrideAccess: true,
    })

    if (!sponsor) {
      throw new APIError('Scholarship sponsor not found.', 404)
    }

    if (getRelationshipId(sponsor.defaultCustomer)) {
      return sponsor.defaultCustomer
    }

    const customerCode = await AccountingCustomerService.generateCustomerCode(payload)
    const [currencyReference, paymentTermReference] = await Promise.all([
      AccountingCustomerService.getRequiredCurrencyReference(payload, 'PHP'),
      AccountingCustomerService.getRequiredPaymentTermReference(payload, { name: 'Due on receipt', code: 'CASH' }),
    ])
    const customer = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      overrideAccess: true,
      depth: 1,
      data: {
        customerCode,
        displayName: sponsor.name,
        legalName: sponsor.name,
        customerType: 'sponsor',
        email: sponsor.email || undefined,
        phone: sponsor.phone || undefined,
        billingAddress: sponsor.billingAddress || undefined,
        paymentTermReference,
        currencyReference,
        status: 'active',
      },
    })

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipSponsors,
      id: sponsor.id,
      overrideAccess: true,
      depth: 1,
      data: {
        defaultCustomer: customer.id,
      },
    })

    return customer
  }
}
