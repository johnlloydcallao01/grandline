import type { Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_GLOBAL_SLUGS,
  DEFAULT_ACCOUNTING_SETTINGS,
} from '../../constants/accounting'
import type { AccountingResolvedPostingWindow } from '../../types/accounting'

const toIso = (value: string | Date) => new Date(value).toISOString()
const isLockedForPosting = (postingIsoDate: string, lockedFromDate?: string | null) =>
  Boolean(lockedFromDate) && new Date(postingIsoDate).getTime() <= new Date(String(lockedFromDate)).getTime()

export class AccountingPeriodService {
  static async getSettings(payload: Payload) {
    try {
      return await payload.findGlobal({
        slug: ACCOUNTING_GLOBAL_SLUGS.settings,
        overrideAccess: true,
      })
    } catch (_error) {
      return DEFAULT_ACCOUNTING_SETTINGS
    }
  }

  static async resolvePostingWindow(
    payload: Payload,
    postingDate: string | Date
  ): Promise<AccountingResolvedPostingWindow> {
    const isoDate = toIso(postingDate)

    const fiscalYears = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          {
            startDate: {
              less_than_equal: isoDate,
            },
          },
          {
            endDate: {
              greater_than_equal: isoDate,
            },
          },
        ],
      },
    })

    const fiscalYear = fiscalYears.docs[0]

    if (!fiscalYear) {
      throw new Error('No fiscal year exists for the requested posting date.')
    }

    const periods = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          {
            fiscalYear: {
              equals: fiscalYear.id,
            },
          },
          {
            startDate: {
              less_than_equal: isoDate,
            },
          },
          {
            endDate: {
              greater_than_equal: isoDate,
            },
          },
        ],
      },
    })

    const period = periods.docs[0]

    if (!period) {
      throw new Error('No accounting period exists for the requested posting date.')
    }

    return {
      fiscalYear: {
        id: fiscalYear.id,
        status: fiscalYear.status,
        closeMode: fiscalYear.closeMode,
        startDate: fiscalYear.startDate,
        endDate: fiscalYear.endDate,
        lockedFromDate: fiscalYear.lockedFromDate,
      },
      period: {
        id: period.id,
        status: period.status,
        startDate: period.startDate,
        endDate: period.endDate,
        lockedFromDate: period.lockedFromDate,
      },
    }
  }

  static async ensurePostingAllowed(payload: Payload, postingDate: string | Date) {
    const resolvedWindow = await this.resolvePostingWindow(payload, postingDate)
    const settings = await this.getSettings(payload)
    const postingIsoDate = toIso(postingDate)

    if (resolvedWindow.fiscalYear.status !== 'open') {
      throw new Error('Posting is only allowed in an open fiscal year.')
    }

    if (resolvedWindow.period.status === 'closed' || resolvedWindow.period.status === 'draft') {
      throw new Error('Posting is not allowed in a closed or draft accounting period.')
    }

    if (
      resolvedWindow.period.status === 'soft_locked' &&
      !settings?.allowBackdatedPosting
    ) {
      throw new Error('Posting is not allowed in a soft-locked accounting period.')
    }

    if (isLockedForPosting(postingIsoDate, resolvedWindow.period.lockedFromDate)) {
      throw new Error('Posting date falls inside a locked accounting period window.')
    }

    if (isLockedForPosting(postingIsoDate, resolvedWindow.fiscalYear.lockedFromDate)) {
      if (resolvedWindow.fiscalYear.closeMode === 'hard_lock') {
        throw new Error('Posting date falls inside a hard-locked fiscal year window.')
      }

      throw new Error('Posting date falls inside a locked fiscal year window.')
    }

    return {
      ...resolvedWindow,
      settings,
    }
  }
}
