import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)

    const fyResult = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
      sort: '-startDate',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    const allPeriodsResult = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      sort: 'periodNumber',
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })

    const periodsByFiscalYear: Record<string | number, unknown[]> = {}
    for (const p of allPeriodsResult.docs as unknown as Record<string, unknown>[]) {
      const fk = (p.fiscalYear as Record<string, unknown>)?.id ?? p.fiscalYear
      const key = String(fk)
      if (!periodsByFiscalYear[key]) periodsByFiscalYear[key] = []
      periodsByFiscalYear[key].push(p)
    }

    const fiscalYears = (fyResult.docs as unknown as Record<string, unknown>[]).map((fy) => {
      const periods = (periodsByFiscalYear[String(fy.id)] || []).map((p) => {
        const period = p as Record<string, unknown>
        return {
          id: period.id as number | string,
          periodNumber: period.periodNumber as number,
          label: (period.label as string) || '',
          status: (period.status as string) || 'draft',
          startDate: (period.startDate as string) || '',
          endDate: (period.endDate as string) || '',
          lockedFromDate: (period.lockedFromDate as string) || null,
          closedAt: (period.closedAt as string) || null,
        }
      })
      return {
        id: fy.id as number | string,
        code: (fy.code as string) || '',
        name: (fy.name as string) || '',
        status: (fy.status as string) || 'draft',
        closeMode: (fy.closeMode as string) || 'manual',
        lockedFromDate: (fy.lockedFromDate as string) || null,
        closedAt: (fy.closedAt as string) || null,
        startDate: (fy.startDate as string) || '',
        endDate: (fy.endDate as string) || '',
        periods,
      }
    })

    let openPeriods = 0
    let closedPeriods = 0
    let softLockedPeriods = 0
    let draftPeriods = 0
    let openFiscalYears = 0
    let closedFiscalYears = 0
    let draftFiscalYears = 0

    for (const fy of fyResult.docs as unknown as Record<string, unknown>[]) {
      const s = fy.status as string
      if (s === 'open') openFiscalYears++
      else if (s === 'closed') closedFiscalYears++
      else if (s === 'draft') draftFiscalYears++
    }

    for (const p of allPeriodsResult.docs as unknown as Record<string, unknown>[]) {
      const s = p.status as string
      if (s === 'open') openPeriods++
      else if (s === 'closed') closedPeriods++
      else if (s === 'soft_locked') softLockedPeriods++
      else if (s === 'draft') draftPeriods++
    }

    let lockedDatesSet = 0
    for (const fy of fyResult.docs as unknown as Record<string, unknown>[]) {
      if (fy.lockedFromDate) lockedDatesSet++
    }
    for (const p of allPeriodsResult.docs as unknown as Record<string, unknown>[]) {
      if (p.lockedFromDate) lockedDatesSet++
    }

    return NextResponse.json({
      fiscalYears,
      counts: {
        openPeriods,
        closedPeriods,
        softLockedPeriods,
        draftPeriods,
        openFiscalYears,
        closedFiscalYears,
        draftFiscalYears,
        lockedDatesSet,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
