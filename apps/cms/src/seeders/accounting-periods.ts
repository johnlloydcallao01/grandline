import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedPeriod = {
  fiscalYearCode: string
  periodNumber: number
  label: string
  startDate: string
  endDate: string
  status: 'draft' | 'open' | 'soft_locked' | 'closed'
  lockedFromDate: string | null
  notes: string | null
}

const generateMonthlyPeriods = (
  fiscalYearCode: string,
  year: number,
  status: SeedPeriod['status'],
  lockedFromDate: string | null,
  notes: string | null,
): SeedPeriod[] => {
  const months = [
    { num: 1, label: 'January', days: 31 },
    { num: 2, label: 'February', days: year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28 },
    { num: 3, label: 'March', days: 31 },
    { num: 4, label: 'April', days: 30 },
    { num: 5, label: 'May', days: 31 },
    { num: 6, label: 'June', days: 30 },
    { num: 7, label: 'July', days: 31 },
    { num: 8, label: 'August', days: 31 },
    { num: 9, label: 'September', days: 30 },
    { num: 10, label: 'October', days: 31 },
    { num: 11, label: 'November', days: 30 },
    { num: 12, label: 'December', days: 31 },
  ]

  return months.map((month) => ({
    fiscalYearCode,
    periodNumber: month.num,
    label: `${month.label} ${year}`,
    startDate: `${year}-${String(month.num).padStart(2, '0')}-01`,
    endDate: `${year}-${String(month.num).padStart(2, '0')}-${String(month.days).padStart(2, '0')}`,
    status,
    lockedFromDate,
    notes,
  }))
}

const samplePeriods: SeedPeriod[] = [
  ...generateMonthlyPeriods('FY2024', 2024, 'closed', '2024-12-31', 'Legacy period. Closed and locked.'),
  ...generateMonthlyPeriods('FY2025', 2025, 'closed', '2025-12-31', 'Recently closed period. Retained for reporting.'),
  ...generateMonthlyPeriods('FY2026', 2026, 'open', null, 'Current active period.'),
]

async function seedPeriods(): Promise<void> {
  console.log('[seed] Connecting to Payload...')
  const payload = await getPayload({ config })
  console.log('[seed] Connected. Upserting periods...')

  const fiscalYears = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
    depth: 0,
    limit: 100,
    overrideAccess: true,
  })

  const fyMap = new Map<string, number>()
  for (const fy of fiscalYears.docs) {
    const fyRecord = fy as unknown as { id: number; code?: string | null }
    const code = typeof fyRecord.code === 'string' ? fyRecord.code : undefined
    if (code) {
      fyMap.set(code, fyRecord.id)
    }
  }

  console.log(`[seed] Found ${fiscalYears.docs.length} fiscal years. Map size: ${fyMap.size}`)

  let created = 0
  let updated = 0

  for (const period of samplePeriods) {
    const fyId = fyMap.get(period.fiscalYearCode)

    if (!fyId) {
      console.warn(`[seed] Skipping period "${period.label}" — fiscal year "${period.fiscalYearCode}" not found. Run accounting-fiscal-years seed first.`)
      continue
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods,
      where: {
        and: [
          {
            fiscalYear: { equals: fyId } as never,
          },
          {
            periodNumber: { equals: period.periodNumber } as never,
          },
        ],
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      fiscalYear: fyId,
      periodNumber: period.periodNumber,
      label: period.label,
      startDate: period.startDate,
      endDate: period.endDate,
      status: period.status,
      lockedFromDate: period.lockedFromDate,
      notes: period.notes,
    } as never

    if (existing.docs.length > 0) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.periods,
        id: existing.docs[0].id,
        overrideAccess: true,
        data,
      })
      updated++
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.periods,
        overrideAccess: true,
        data,
      })
      created++
    }
  }

  console.log(`[seed] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedPeriods().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
