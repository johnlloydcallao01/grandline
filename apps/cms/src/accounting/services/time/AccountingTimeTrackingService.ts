import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { AccountingAuditService } from '../audit/AccountingAuditService'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'

export class AccountingTimeTrackingService {
  static toDecimalHours(entry: { hours?: unknown; minutes?: unknown }) {
    return roundCurrency(normalizeAmount(entry.hours) + normalizeAmount(entry.minutes) / 60)
  }

  static getEntryFinancials(entry: {
    hours?: unknown
    minutes?: unknown
    billingRate?: unknown
    costRate?: unknown
  }) {
    const decimalHours = this.toDecimalHours(entry)
    return {
      decimalHours,
      billableAmount: roundCurrency(decimalHours * normalizeAmount(entry.billingRate)),
      costAmount: roundCurrency(decimalHours * normalizeAmount(entry.costRate)),
    }
  }

  static async syncTimesheetTotalHours(payload: Payload, timesheetId: number | string) {
    const entries = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
      depth: 0,
      where: {
        and: [
          {
            timesheet: {
              equals: timesheetId,
            },
          },
          {
            status: {
              not_equals: 'rejected',
            },
          },
        ],
      },
    })

    const totalHours = roundCurrency(
      entries.reduce((sum, entry) => sum + this.toDecimalHours(entry), 0),
    )

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.timesheets,
      id: timesheetId,
      overrideAccess: true,
      depth: 1,
      data: {
        totalHours,
      },
    })
  }

  static async submitTimesheet({
    payload,
    timesheetId,
    userId,
  }: {
    payload: Payload
    timesheetId: number | string
    userId?: number | string | null
  }) {
    const timesheet = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.timesheets,
      id: timesheetId,
      depth: 0,
      overrideAccess: true,
    })

    if (!timesheet) {
      throw new APIError('Timesheet not found.', 404)
    }

    if (!['draft', 'rejected'].includes(String(timesheet.status || ''))) {
      return timesheet
    }

    await this.syncTimesheetTotalHours(payload, timesheetId)

    const entries = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
      depth: 0,
      where: {
        timesheet: {
          equals: timesheetId,
        },
      },
    })

    for (const entry of entries) {
      if (entry.status === 'draft' || entry.status === 'rejected') {
        await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
          id: entry.id,
          overrideAccess: true,
          depth: 0,
          data: {
            status: 'submitted',
          },
        })
      }
    }

    const updated = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.timesheets,
      id: timesheetId,
      overrideAccess: true,
      depth: 1,
      data: {
        status: 'submitted',
      },
    })

    await AccountingAuditService.logAction({
      payload,
      entityType: 'timesheet',
      entityId: timesheetId,
      actionType: 'submitted',
      performedBy: userId,
      beforeData: timesheet,
      afterData: updated,
    })

    return updated
  }

  static async approveTimesheet({
    payload,
    timesheetId,
    approverUserId,
  }: {
    payload: Payload
    timesheetId: number | string
    approverUserId?: number | string | null
  }) {
    const entries = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
      depth: 0,
      where: {
        timesheet: {
          equals: timesheetId,
        },
      },
    })

    for (const entry of entries) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
        id: entry.id,
        overrideAccess: true,
        depth: 0,
        data: {
          status: 'approved',
          approvedBy: typeof approverUserId === 'number' ? approverUserId : approverUserId ? Number(approverUserId) : undefined,
          approvedAt: new Date().toISOString(),
        },
      })
    }

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.timesheets,
      id: timesheetId,
      overrideAccess: true,
      depth: 1,
      data: {
        status: 'approved',
        approvedBy: typeof approverUserId === 'number' ? approverUserId : approverUserId ? Number(approverUserId) : undefined,
        approvedAt: new Date().toISOString(),
      },
    })
  }

  static async rejectTimesheet({
    payload,
    timesheetId,
  }: {
    payload: Payload
    timesheetId: number | string
  }) {
    const entries = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
      depth: 0,
      where: {
        timesheet: {
          equals: timesheetId,
        },
      },
    })

    for (const entry of entries) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
        id: entry.id,
        overrideAccess: true,
        depth: 0,
        data: {
          status: 'rejected',
        },
      })
    }

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.timesheets,
      id: timesheetId,
      overrideAccess: true,
      depth: 1,
      data: {
        status: 'rejected',
      },
    })
  }
}
