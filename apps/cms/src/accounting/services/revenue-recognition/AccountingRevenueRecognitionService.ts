import { APIError, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import type { AccountingRevenueRecognitionSchedule } from '@/payload-types'
import { getRelationshipId } from '../../utils/accounting-audit'
import { getRecognitionStatus } from '../../utils/lms'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import { AccountingEnrollmentBillingService } from '../enrollment-billing/AccountingEnrollmentBillingService'

const toIso = (value?: string | Date | null) => (value ? new Date(value).toISOString() : new Date().toISOString())

export class AccountingRevenueRecognitionService {
  static shouldRecognizeForTrigger({
    trigger,
    method,
  }: {
    trigger: 'activation' | 'completion' | 'certificate_issued'
    method: string
  }) {
    if (trigger === 'activation') return method === 'on_activation'
    if (trigger === 'completion') return method === 'completion_based'
    return method === 'certificate_based'
  }

  static buildScheduleData({
    method,
    startDate,
    endDate,
    amount,
  }: {
    method: string
    startDate: string
    endDate: string
    amount: number
  }) {
    const totalAmount = normalizeAmount(amount)

    if (method === 'straight_line') {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      const perDayAmount = roundCurrency(totalAmount / totalDays)

      return Array.from({ length: totalDays }, (_, index) => {
        const recognitionDate = new Date(start)
        recognitionDate.setDate(start.getDate() + index)
        return {
          milestone: `day_${index + 1}`,
          recognitionDate: recognitionDate.toISOString(),
          amount: index === totalDays - 1 ? roundCurrency(totalAmount - perDayAmount * (totalDays - 1)) : perDayAmount,
        }
      })
    }

    return [
      {
        milestone: method,
        recognitionDate: endDate,
        amount: totalAmount,
      },
    ]
  }

  static async ensureScheduleForEnrollment({
    payload,
    enrollmentId,
  }: {
    payload: Payload
    enrollmentId: number | string
  }) {
    const context = await AccountingEnrollmentBillingService.getFinanceContext(payload, enrollmentId)
    const summary = AccountingEnrollmentBillingService.buildFinanceSummaryFromContext(context)
    const invoiceRelationId =
      getRelationshipId(context.billingLink?.invoice) || getRelationshipId(context.invoice?.id)
    const billingLinkRelationId = getRelationshipId((context.billingLink as any)?.id ?? context.billingLink)
    const invoiceId =
      typeof invoiceRelationId === 'number' ? invoiceRelationId : invoiceRelationId ? Number(invoiceRelationId) : undefined
    const billingLinkId =
      typeof billingLinkRelationId === 'number'
        ? billingLinkRelationId
        : billingLinkRelationId
          ? Number(billingLinkRelationId)
          : undefined

    if (!invoiceId || !billingLinkId) {
      throw new APIError('Enrollment must be invoiced before revenue recognition can be scheduled.', 400)
    }

    const recognitionMethod = String(
      context.feeProfile?.defaultRecognitionMethod || 'on_activation',
    ) as AccountingRevenueRecognitionSchedule['recognitionMethod']
    const startDate = toIso(
      context.enrollment?.enrolledAt ||
        context.course?.courseStartDate ||
        context.course?.enrollmentStartDate,
    )
    const endDate = toIso(
      recognitionMethod === 'certificate_based'
        ? context.enrollment?.completedAt || context.course?.courseEndDate || startDate
        : context.course?.courseEndDate ||
            context.enrollment?.accessExpiresAt ||
            context.enrollment?.completedAt ||
            startDate,
    )

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      where: {
        enrollmentBillingLink: {
          equals: billingLinkId,
        },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const scheduleData = this.buildScheduleData({
      method: recognitionMethod,
      startDate,
      endDate,
      amount: summary.finalCharge,
    })
    const data: RequiredDataFromCollectionSlug<'accounting-revenue-recognition-schedules'> = {
      invoice: invoiceId,
      enrollmentBillingLink: billingLinkId,
      recognitionMethod,
      startDate,
      endDate,
      totalDeferredAmount: summary.finalCharge,
      recognizedAmount: normalizeAmount(existing.docs[0]?.recognizedAmount),
      remainingDeferredAmount: roundCurrency(
        Math.max(0, summary.finalCharge - normalizeAmount(existing.docs[0]?.recognizedAmount)),
      ),
      status: (
        existing.docs[0]?.id
          ? getRecognitionStatus({
              totalDeferredAmount: summary.finalCharge,
              recognizedAmount: normalizeAmount(existing.docs[0]?.recognizedAmount),
            })
          : 'scheduled'
      ) as AccountingRevenueRecognitionSchedule['status'],
      scheduleData,
      notes: context.billingLink?.notes || undefined,
    }

    return existing.docs[0]?.id
      ? payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
          id: existing.docs[0].id,
          overrideAccess: true,
          depth: 1,
          data,
        })
      : payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
          overrideAccess: true,
          depth: 1,
          data,
        })
  }

  static async recognizeRevenue({
    payload,
    scheduleId,
    amount,
  }: {
    payload: Payload
    scheduleId: number | string
    amount?: number | null
  }) {
    const schedule = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      id: scheduleId,
      depth: 1,
      overrideAccess: true,
    })

    if (!schedule) {
      throw new APIError('Revenue recognition schedule not found.', 404)
    }

    const recognitionAmount =
      normalizeAmount(amount) > 0
        ? normalizeAmount(amount)
        : normalizeAmount(schedule.remainingDeferredAmount)

    const recognizedAmount = roundCurrency(normalizeAmount(schedule.recognizedAmount) + recognitionAmount)
    const remainingDeferredAmount = roundCurrency(
      Math.max(0, normalizeAmount(schedule.totalDeferredAmount) - recognizedAmount),
    )

    const updated = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      id: scheduleId,
      overrideAccess: true,
      depth: 1,
      data: {
        recognizedAmount,
        remainingDeferredAmount,
        lastRecognitionAt: new Date().toISOString(),
        status: getRecognitionStatus({
          totalDeferredAmount: normalizeAmount(schedule.totalDeferredAmount),
          recognizedAmount,
        }),
      },
    })

    const billingLinkId = getRelationshipId(updated.enrollmentBillingLink)
    if (billingLinkId) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        id: billingLinkId,
        overrideAccess: true,
        depth: 1,
        data: {
          recognizedRevenueSnapshot: recognizedAmount,
        },
      })
    }

    return updated
  }

  static async processEnrollmentRecognitionTrigger({
    payload,
    enrollmentId,
    trigger,
  }: {
    payload: Payload
    enrollmentId: number | string
    trigger: 'activation' | 'completion' | 'certificate_issued'
  }) {
    const schedule = await this.ensureScheduleForEnrollment({
      payload,
      enrollmentId,
    })

    if (
      !this.shouldRecognizeForTrigger({
        trigger,
        method: String(schedule.recognitionMethod || ''),
      }) ||
      normalizeAmount(schedule.remainingDeferredAmount) <= 0
    ) {
      return schedule
    }

    return this.recognizeRevenue({
      payload,
      scheduleId: schedule.id,
      amount: schedule.remainingDeferredAmount,
    })
  }
}
