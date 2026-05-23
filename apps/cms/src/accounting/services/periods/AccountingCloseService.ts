import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'

type CloseTarget = 'fiscalYear' | 'period'

export class AccountingCloseService {
  static normalizeUserId(value: unknown) {
    const relationshipId = getRelationshipId(value)

    if (relationshipId === null) {
      return undefined
    }

    const numericId = Number(relationshipId)

    if (!Number.isFinite(numericId)) {
      throw new APIError('Accounting close workflows require numeric user ids.', 400)
    }

    return numericId
  }

  static async closePeriod({
    payload,
    periodId,
    userId,
    lockedFromDate,
  }: {
    payload: Payload
    periodId: number | string
    userId?: number | string | null
    lockedFromDate?: string | null
  }) {
    const period = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      id: periodId,
      depth: 0,
      overrideAccess: true,
    })

    if (!period) {
      throw new APIError('Accounting period not found.', 404)
    }

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      id: periodId,
      overrideAccess: true,
      data: {
        status: 'closed',
        lockedFromDate: lockedFromDate || period.lockedFromDate || period.endDate,
        updatedBy: this.normalizeUserId(userId || period.updatedBy),
      },
      depth: 1,
    })
  }

  static async reopenPeriod({
    payload,
    periodId,
    userId,
    clearLockDate = false,
  }: {
    payload: Payload
    periodId: number | string
    userId?: number | string | null
    clearLockDate?: boolean
  }) {
    const period = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      id: periodId,
      depth: 0,
      overrideAccess: true,
    })

    if (!period) {
      throw new APIError('Accounting period not found.', 404)
    }

    const fiscalYearId =
      typeof period.fiscalYear === 'object' && period.fiscalYear !== null ? period.fiscalYear.id : period.fiscalYear

    if (fiscalYearId) {
      const fiscalYear = await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
        id: fiscalYearId,
        depth: 0,
        overrideAccess: true,
      })

      if (fiscalYear?.status !== 'open') {
        throw new APIError('A period can only be reopened while its fiscal year is open.', 400)
      }
    }

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      id: periodId,
      overrideAccess: true,
      data: {
        status: 'open',
        lockedFromDate: clearLockDate ? null : period.lockedFromDate,
        closedAt: null,
        closedBy: null,
        updatedBy: this.normalizeUserId(userId || period.updatedBy),
      },
      depth: 1,
    })
  }

  static async closeFiscalYear({
    payload,
    fiscalYearId,
    userId,
    lockedFromDate,
  }: {
    payload: Payload
    fiscalYearId: number | string
    userId?: number | string | null
    lockedFromDate?: string | null
  }) {
    const fiscalYear = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      id: fiscalYearId,
      depth: 0,
      overrideAccess: true,
    })

    if (!fiscalYear) {
      throw new APIError('Fiscal year not found.', 404)
    }

    const periods = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      depth: 0,
      limit: 100,
      overrideAccess: true,
      where: {
        and: [
          {
            fiscalYear: {
              equals: fiscalYearId,
            },
          },
          {
            status: {
              not_equals: 'closed',
            },
          },
        ],
      },
    })

    if (periods.totalDocs > 0) {
      throw new APIError('All accounting periods in the fiscal year must be closed first.', 400)
    }

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      id: fiscalYearId,
      overrideAccess: true,
      data: {
        status: 'closed',
        lockedFromDate: lockedFromDate || fiscalYear.lockedFromDate || fiscalYear.endDate,
        updatedBy: this.normalizeUserId(userId || fiscalYear.updatedBy),
      },
      depth: 1,
    })
  }

  static async reopenFiscalYear({
    payload,
    fiscalYearId,
    userId,
    clearLockDate = false,
  }: {
    payload: Payload
    fiscalYearId: number | string
    userId?: number | string | null
    clearLockDate?: boolean
  }) {
    const fiscalYear = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      id: fiscalYearId,
      depth: 0,
      overrideAccess: true,
    })

    if (!fiscalYear) {
      throw new APIError('Fiscal year not found.', 404)
    }

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      id: fiscalYearId,
      overrideAccess: true,
      data: {
        status: 'open',
        lockedFromDate: clearLockDate ? null : fiscalYear.lockedFromDate,
        closedAt: null,
        closedBy: null,
        updatedBy: this.normalizeUserId(userId || fiscalYear.updatedBy),
      },
      depth: 1,
    })
  }

  static parseCloseTarget(value: unknown): CloseTarget {
    if (value === 'fiscalYear' || value === 'period') {
      return value
    }

    throw new APIError('target must be either "fiscalYear" or "period".', 400)
  }
}
