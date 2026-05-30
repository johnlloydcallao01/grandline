import { APIError, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import { getSingleDoc } from '../../utils/lms'
import { AccountingEnrollmentBillingService } from '../enrollment-billing/AccountingEnrollmentBillingService'

export class AccountingCorporateBillingService {
  static async linkEnrollmentToCorporateAccount({
    payload,
    enrollmentId,
    corporateAccountId,
    coverageType = 'full_company_pay',
    coveredAmount,
    traineeShareAmount,
    notes,
  }: {
    payload: Payload
    enrollmentId: number | string
    corporateAccountId: number | string
    coverageType?: 'full_company_pay' | 'shared_pay' | 'credit_terms'
    coveredAmount?: number | null
    traineeShareAmount?: number | null
    notes?: string | null
  }) {
    const billingLink = await AccountingEnrollmentBillingService.ensureBillingLink({
      payload,
      enrollmentId,
    })
    const billingLinkRelationId = getRelationshipId((billingLink as any)?.id ?? billingLink)
    const invoiceRelationId = getRelationshipId((billingLink as any)?.invoice)
    const normalizedCorporateAccountId =
      typeof corporateAccountId === 'number'
        ? corporateAccountId
        : corporateAccountId
          ? Number(corporateAccountId)
          : undefined
    const billingLinkId =
      typeof billingLinkRelationId === 'number'
        ? billingLinkRelationId
        : billingLinkRelationId
          ? Number(billingLinkRelationId)
          : undefined
    const invoiceId =
      typeof invoiceRelationId === 'number' ? invoiceRelationId : invoiceRelationId ? Number(invoiceRelationId) : undefined
    const financeSummary = await AccountingEnrollmentBillingService.getEnrollmentFinanceSummary(payload, enrollmentId)

    if (!billingLinkId || !normalizedCorporateAccountId) {
      throw new APIError('Enrollment billing link is required before corporate coverage can be assigned.', 400)
    }

    const companyCoveredAmount =
      normalizeAmount(coveredAmount) > 0
        ? normalizeAmount(coveredAmount)
        : coverageType === 'shared_pay'
          ? roundCurrency(financeSummary.finalCharge / 2)
          : financeSummary.finalCharge
    const traineeAmount =
      normalizeAmount(traineeShareAmount) > 0
        ? normalizeAmount(traineeShareAmount)
        : Math.max(0, financeSummary.finalCharge - companyCoveredAmount)

    const existingLink = await getSingleDoc<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
      where: {
        and: [
          { corporateAccount: { equals: corporateAccountId } },
          { enrollmentBillingLink: { equals: billingLinkId } },
          { status: { equals: 'active' } },
        ],
      },
      depth: 0,
    })

    const data: RequiredDataFromCollectionSlug<'accounting-corporate-billing-links'> = {
      corporateAccount: normalizedCorporateAccountId,
      enrollmentBillingLink: billingLinkId,
      invoice: invoiceId || undefined,
      coverageType,
      coveredAmount: companyCoveredAmount,
      traineeShareAmount: traineeAmount,
      status: 'active' as const,
      notes: notes || undefined,
    }

    const record = existingLink?.id
      ? await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
          id: existingLink.id,
          overrideAccess: true,
          depth: 1,
          data,
        })
      : await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
          overrideAccess: true,
          depth: 1,
          data,
        })

    await AccountingEnrollmentBillingService.ensureBillingLink({
      payload,
      enrollmentId,
    })

    return record
  }

  static async ensureCorporateCustomer({
    payload,
    corporateAccountId,
  }: {
    payload: Payload
    corporateAccountId: number | string
  }) {
    const account = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      id: corporateAccountId,
      depth: 1,
      overrideAccess: true,
    })

    if (!account) {
      throw new APIError('Corporate account not found.', 404)
    }

    const customerId = getRelationshipId(account.customer)
    if (!customerId) {
      throw new APIError('Corporate account must be linked to an accounting customer.', 400)
    }

    return payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      id: customerId,
      depth: 1,
      overrideAccess: true,
    })
  }
}
