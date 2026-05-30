import type { Payload } from 'payload'
import { APIError } from 'payload'
import { getRelationshipId } from './accounting-audit'
import { normalizeAmount, roundCurrency } from './amounts'
import { normalizeCode, normalizeOptionalText, normalizeText } from './commercial'

export const LMS_CURRENCY = 'PHP'

export const getSingleDoc = async <T = Record<string, unknown>>({
  payload,
  collection,
  where,
  depth = 0,
}: {
  payload: Payload
  collection: string
  where: any
  depth?: number
}) => {
  const result = await payload.find({
    collection: collection as any,
    where,
    limit: 1,
    depth,
    overrideAccess: true,
  })

  return (result.docs[0] as T | undefined) || null
}

export const ensureDoc = <T>(value: T | null | undefined, message: string): T => {
  if (!value) {
    throw new APIError(message, 404)
  }

  return value
}

export const buildUserDisplayName = (user: any) => {
  const firstName = normalizeOptionalText(user?.firstName)
  const lastName = normalizeOptionalText(user?.lastName)
  const name = normalizeText([firstName, lastName].filter(Boolean).join(' ').trim() || user?.email || 'Unknown User')
  return name
}

export const getCourseBasePrice = (course: any) => normalizeAmount(course?.price)

export const getCourseSalePrice = (course: any) => {
  const basePrice = getCourseBasePrice(course)
  const discountedPrice = normalizeAmount(course?.discountedPrice)
  return discountedPrice > 0 && discountedPrice < basePrice ? discountedPrice : basePrice
}

export const normalizeReferenceId = (value: unknown) => {
  const relationshipId = getRelationshipId(value)
  return relationshipId == null ? null : String(relationshipId)
}

export const getRecognitionStatus = ({
  totalDeferredAmount,
  recognizedAmount,
}: {
  totalDeferredAmount: number
  recognizedAmount: number
}) => {
  if (recognizedAmount <= 0) return 'scheduled'
  if (recognizedAmount >= totalDeferredAmount) return 'recognized'
  return 'partially_recognized'
}

export const getLmsBillingStatus = ({
  invoiceStatus,
  refundStatus,
}: {
  invoiceStatus?: string | null
  refundStatus?: string | null
}) => {
  if (refundStatus === 'processed') return 'refunded'
  switch (String(invoiceStatus || '')) {
    case 'paid':
      return 'paid'
    case 'partially_paid':
      return 'partially_paid'
    case 'posted':
      return 'invoiced'
    case 'voided':
      return 'cancelled'
    case 'draft':
      return 'drafted'
    default:
      return 'not_started'
  }
}

export const buildLmsChargeBreakdown = ({
  listPrice,
  salePrice,
  couponDiscount,
  scholarshipDiscount,
  corporateCoverage,
  adjustmentsNet,
}: {
  listPrice: number
  salePrice: number
  couponDiscount: number
  scholarshipDiscount: number
  corporateCoverage: number
  adjustmentsNet: number
}) => {
  const finalCharge = roundCurrency(
    Math.max(
      0,
      normalizeAmount(salePrice) -
        normalizeAmount(couponDiscount) -
        normalizeAmount(scholarshipDiscount) -
        normalizeAmount(corporateCoverage) +
        normalizeAmount(adjustmentsNet),
    ),
  )

  return {
    listPrice: roundCurrency(listPrice),
    salePrice: roundCurrency(salePrice),
    couponDiscount: roundCurrency(couponDiscount),
    scholarshipDiscount: roundCurrency(scholarshipDiscount),
    corporateCoverage: roundCurrency(corporateCoverage),
    adjustmentsNet: roundCurrency(adjustmentsNet),
    finalCharge,
  }
}

export const getEnrollmentUserId = async (payload: Payload, traineeValue: unknown) => {
  const traineeId = getRelationshipId(traineeValue)
  if (!traineeId) return null

  const trainee = await payload.findByID({
    collection: 'trainees',
    id: traineeId,
    depth: 1,
    overrideAccess: true,
  })

  return getRelationshipId(trainee?.user)
}

export const getInvoiceBalanceDue = (invoice: any) => roundCurrency(normalizeAmount(invoice?.balanceDue))

export const normalizeFinanceNotes = (value: unknown) => normalizeOptionalText(value)

export const normalizeFinanceCode = (value: unknown) => normalizeCode(value)
