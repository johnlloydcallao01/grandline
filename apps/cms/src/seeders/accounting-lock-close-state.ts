import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type UserDoc = {
  id: number | string
  role?: string | null
  isActive?: boolean | null
}

type SeedFiscalYear = {
  code: string
  name: string
  startDate: string
  endDate: string
  status: 'draft' | 'open' | 'closed'
  closeMode: 'manual' | 'hard_lock'
  lockedFromDate: string | null
  notes: string
}

type SeedPeriod = {
  fiscalYearCode: string
  periodNumber: number
  label: string
  startDate: string
  endDate: string
  status: 'draft' | 'open' | 'soft_locked' | 'closed'
  lockedFromDate: string | null
  notes: string
}

type FiscalYearDoc = {
  id: number | string
  code?: string | null
  closedAt?: string | null
}

type PeriodDoc = {
  id: number | string
  fiscalYear?: number | string | { id?: number | string | null } | null
  periodNumber?: number | null
  closedAt?: string | null
}

const SEED_FISCAL_YEARS: SeedFiscalYear[] = [
  {
    code: 'FYSEED2040',
    name: 'Seed Fiscal Year 2040',
    startDate: '2040-01-01',
    endDate: '2040-12-31',
    status: 'closed',
    closeMode: 'hard_lock',
    lockedFromDate: '2040-12-31',
    notes: '[seed:lock-close-fy-2040] Fully closed archival control year for lock-close-state coverage.',
  },
  {
    code: 'FYSEED2041',
    name: 'Seed Fiscal Year 2041',
    startDate: '2041-01-01',
    endDate: '2041-12-31',
    status: 'closed',
    closeMode: 'manual',
    lockedFromDate: '2041-12-15',
    notes: '[seed:lock-close-fy-2041] Closed control year retained for comparative reporting coverage.',
  },
  {
    code: 'FYSEED2042',
    name: 'Seed Fiscal Year 2042',
    startDate: '2042-01-01',
    endDate: '2042-12-31',
    status: 'open',
    closeMode: 'manual',
    lockedFromDate: '2042-09-01',
    notes: '[seed:lock-close-fy-2042] Open control year with forward lock date for readiness coverage.',
  },
  {
    code: 'FYSEED2043',
    name: 'Seed Fiscal Year 2043',
    startDate: '2043-01-01',
    endDate: '2043-12-31',
    status: 'draft',
    closeMode: 'manual',
    lockedFromDate: null,
    notes: '[seed:lock-close-fy-2043] Draft control year prepared for future close planning coverage.',
  },
]

const SEED_PERIODS: SeedPeriod[] = [
  {
    fiscalYearCode: 'FYSEED2040',
    periodNumber: 1,
    label: 'Seed Q1 2040',
    startDate: '2040-01-01',
    endDate: '2040-03-31',
    status: 'closed',
    lockedFromDate: '2040-03-31',
    notes: '[seed:lock-close-period-001] Closed quarter for archival lock-close-state coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2040',
    periodNumber: 2,
    label: 'Seed Q2 2040',
    startDate: '2040-04-01',
    endDate: '2040-06-30',
    status: 'closed',
    lockedFromDate: '2040-06-30',
    notes: '[seed:lock-close-period-002] Closed quarter for archival lock-close-state coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2040',
    periodNumber: 3,
    label: 'Seed Q3 2040',
    startDate: '2040-07-01',
    endDate: '2040-09-30',
    status: 'closed',
    lockedFromDate: '2040-09-30',
    notes: '[seed:lock-close-period-003] Closed quarter for archival lock-close-state coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2040',
    periodNumber: 4,
    label: 'Seed Q4 2040',
    startDate: '2040-10-01',
    endDate: '2040-12-31',
    status: 'closed',
    lockedFromDate: '2040-12-31',
    notes: '[seed:lock-close-period-004] Closed quarter for archival lock-close-state coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2041',
    periodNumber: 1,
    label: 'Seed Q1 2041',
    startDate: '2041-01-01',
    endDate: '2041-03-31',
    status: 'closed',
    lockedFromDate: '2041-03-31',
    notes: '[seed:lock-close-period-005] Closed quarter retained for comparative control coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2041',
    periodNumber: 2,
    label: 'Seed Q2 2041',
    startDate: '2041-04-01',
    endDate: '2041-06-30',
    status: 'closed',
    lockedFromDate: '2041-06-30',
    notes: '[seed:lock-close-period-006] Closed quarter retained for comparative control coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2041',
    periodNumber: 3,
    label: 'Seed Q3 2041',
    startDate: '2041-07-01',
    endDate: '2041-09-30',
    status: 'closed',
    lockedFromDate: '2041-09-30',
    notes: '[seed:lock-close-period-007] Closed quarter retained for comparative control coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2041',
    periodNumber: 4,
    label: 'Seed Q4 2041',
    startDate: '2041-10-01',
    endDate: '2041-12-31',
    status: 'closed',
    lockedFromDate: '2041-12-15',
    notes: '[seed:lock-close-period-008] Closed quarter retained for comparative control coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2042',
    periodNumber: 1,
    label: 'Seed Q1 2042',
    startDate: '2042-01-01',
    endDate: '2042-03-31',
    status: 'closed',
    lockedFromDate: '2042-03-31',
    notes: '[seed:lock-close-period-009] Closed quarter inside an open fiscal year for mixed-state coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2042',
    periodNumber: 2,
    label: 'Seed Q2 2042',
    startDate: '2042-04-01',
    endDate: '2042-06-30',
    status: 'closed',
    lockedFromDate: '2042-06-30',
    notes: '[seed:lock-close-period-010] Closed quarter inside an open fiscal year for mixed-state coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2042',
    periodNumber: 3,
    label: 'Seed Q3 2042',
    startDate: '2042-07-01',
    endDate: '2042-09-30',
    status: 'soft_locked',
    lockedFromDate: '2042-09-01',
    notes: '[seed:lock-close-period-011] Soft-locked quarter for forward posting protection coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2042',
    periodNumber: 4,
    label: 'Seed Q4 2042',
    startDate: '2042-10-01',
    endDate: '2042-12-31',
    status: 'open',
    lockedFromDate: null,
    notes: '[seed:lock-close-period-012] Open quarter for future posting coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2043',
    periodNumber: 1,
    label: 'Seed Q1 2043',
    startDate: '2043-01-01',
    endDate: '2043-03-31',
    status: 'draft',
    lockedFromDate: null,
    notes: '[seed:lock-close-period-013] Draft quarter for close planning coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2043',
    periodNumber: 2,
    label: 'Seed Q2 2043',
    startDate: '2043-04-01',
    endDate: '2043-06-30',
    status: 'draft',
    lockedFromDate: null,
    notes: '[seed:lock-close-period-014] Draft quarter for close planning coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2043',
    periodNumber: 3,
    label: 'Seed Q3 2043',
    startDate: '2043-07-01',
    endDate: '2043-09-30',
    status: 'draft',
    lockedFromDate: null,
    notes: '[seed:lock-close-period-015] Draft quarter for close planning coverage.',
  },
  {
    fiscalYearCode: 'FYSEED2043',
    periodNumber: 4,
    label: 'Seed Q4 2043',
    startDate: '2043-10-01',
    endDate: '2043-12-31',
    status: 'draft',
    lockedFromDate: null,
    notes: '[seed:lock-close-period-016] Draft quarter for close planning coverage.',
  },
]

const upsertClosedAtMetadata = async ({
  payload,
  collection,
  id,
  adminId,
  closedAt,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  collection: string
  id: number | string
  adminId: number | string | null
  closedAt: string
}) => {
  if (!adminId) return

  await payload.update({
    collection: collection as any,
    id,
    overrideAccess: true,
    depth: 0,
    data: {
      closedAt,
      closedBy: adminId,
      updatedBy: adminId,
    } as never,
  })
}

async function seedLockCloseState() {
  const payload = await getPayload({ config })
  const usersResult = await payload.find({
    collection: 'users',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const eligibleUsers = (usersResult.docs as UserDoc[]).filter(
    (user) => String(user.role || '') !== 'service' && user.isActive !== false,
  )
  const adminId =
    eligibleUsers.find((user) => String(user.role || '') === 'admin')?.id ??
    eligibleUsers[0]?.id ??
    null

  const fiscalYearIdByCode = new Map<string, number | string>()
  let createdFiscalYears = 0
  let updatedFiscalYears = 0
  let createdPeriods = 0
  let updatedPeriods = 0

  for (const fiscalYear of SEED_FISCAL_YEARS) {
    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears as any,
      where: {
        code: {
          equals: fiscalYear.code,
        },
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      code: fiscalYear.code,
      name: fiscalYear.name,
      startDate: fiscalYear.startDate,
      endDate: fiscalYear.endDate,
      status: fiscalYear.status,
      closeMode: fiscalYear.closeMode,
      lockedFromDate: fiscalYear.lockedFromDate,
      notes: fiscalYear.notes,
      createdBy: adminId,
      updatedBy: adminId,
    } as never

    let recordId: number | string
    let existingClosedAt: string | null | undefined

    if (existing.docs[0]) {
      const existingDoc = existing.docs[0] as FiscalYearDoc
      recordId = existingDoc.id
      existingClosedAt = existingDoc.closedAt
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears as any,
        id: recordId,
        overrideAccess: true,
        depth: 0,
        data,
      })
      updatedFiscalYears += 1
      console.log(`Updated lock-close fiscal year ${fiscalYear.code}`)
    } else {
      const created = (await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears as any,
        overrideAccess: true,
        depth: 0,
        data,
      })) as FiscalYearDoc
      recordId = created.id
      existingClosedAt = created.closedAt
      createdFiscalYears += 1
      console.log(`Created lock-close fiscal year ${fiscalYear.code}`)
    }

    fiscalYearIdByCode.set(fiscalYear.code, recordId)

    if (fiscalYear.status === 'closed' && !existingClosedAt) {
      await upsertClosedAtMetadata({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
        id: recordId,
        adminId,
        closedAt: `${fiscalYear.endDate}T17:00:00.000Z`,
      })
    }
  }

  for (const period of SEED_PERIODS) {
    const fiscalYearId = fiscalYearIdByCode.get(period.fiscalYearCode)
    if (!fiscalYearId) {
      throw new Error(`Missing fiscal year ${period.fiscalYearCode} while seeding lock-close periods.`)
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.periods as any,
      where: {
        and: [
          {
            fiscalYear: {
              equals: fiscalYearId,
            },
          },
          {
            periodNumber: {
              equals: period.periodNumber,
            },
          },
        ],
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      fiscalYear: fiscalYearId,
      periodNumber: period.periodNumber,
      label: period.label,
      startDate: period.startDate,
      endDate: period.endDate,
      status: period.status,
      lockedFromDate: period.lockedFromDate,
      notes: period.notes,
      createdBy: adminId,
      updatedBy: adminId,
    } as never

    let recordId: number | string
    let existingClosedAt: string | null | undefined

    if (existing.docs[0]) {
      const existingDoc = existing.docs[0] as PeriodDoc
      recordId = existingDoc.id
      existingClosedAt = existingDoc.closedAt
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.periods as any,
        id: recordId,
        overrideAccess: true,
        depth: 0,
        data,
      })
      updatedPeriods += 1
      console.log(`Updated lock-close period ${period.label}`)
    } else {
      const created = (await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.periods as any,
        overrideAccess: true,
        depth: 0,
        data,
      })) as PeriodDoc
      recordId = created.id
      existingClosedAt = created.closedAt
      createdPeriods += 1
      console.log(`Created lock-close period ${period.label}`)
    }

    if (period.status === 'closed' && !existingClosedAt) {
      await upsertClosedAtMetadata({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.periods,
        id: recordId,
        adminId,
        closedAt: `${period.endDate}T17:00:00.000Z`,
      })
    }
  }

  console.log(
    `[seed] Lock-close state ready. Fiscal years created: ${createdFiscalYears}, updated: ${updatedFiscalYears}. Periods created: ${createdPeriods}, updated: ${updatedPeriods}.`,
  )
}

seedLockCloseState()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[seed] Fatal error while seeding lock-close state:', error)
    process.exit(1)
  })
