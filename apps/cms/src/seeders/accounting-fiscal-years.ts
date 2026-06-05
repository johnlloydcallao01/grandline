import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedFiscalYear = {
    code: string
    name: string
    startDate: string
    endDate: string
    status: 'draft' | 'open' | 'closed'
    closeMode: 'manual' | 'hard_lock'
    lockedFromDate: string | null
    notes: string | null
}

const sampleFiscalYears: SeedFiscalYear[] = [
    {
        code: 'FY2016',
        name: 'Fiscal Year 2016',
        startDate: '2016-01-01',
        endDate: '2016-12-31',
        status: 'closed',
        closeMode: 'hard_lock',
        lockedFromDate: '2016-12-31',
        notes: 'Legacy fiscal year. Hard-locked to prevent any retroactive changes.',
    },
    {
        code: 'FY2017',
        name: 'Fiscal Year 2017',
        startDate: '2017-01-01',
        endDate: '2017-12-31',
        status: 'closed',
        closeMode: 'hard_lock',
        lockedFromDate: '2017-12-31',
        notes: 'Legacy fiscal year. Hard-locked after annual audit closure.',
    },
    {
        code: 'FY2018',
        name: 'Fiscal Year 2018',
        startDate: '2018-01-01',
        endDate: '2018-12-31',
        status: 'closed',
        closeMode: 'hard_lock',
        lockedFromDate: '2018-12-31',
        notes: null,
    },
    {
        code: 'FY2019',
        name: 'Fiscal Year 2019',
        startDate: '2019-01-01',
        endDate: '2019-12-31',
        status: 'closed',
        closeMode: 'hard_lock',
        lockedFromDate: '2019-12-31',
        notes: null,
    },
    {
        code: 'FY2020',
        name: 'Fiscal Year 2020',
        startDate: '2020-01-01',
        endDate: '2020-12-31',
        status: 'closed',
        closeMode: 'hard_lock',
        lockedFromDate: '2020-12-31',
        notes: 'Transition year for remote training operations.',
    },
    {
        code: 'FY2021',
        name: 'Fiscal Year 2021',
        startDate: '2021-01-01',
        endDate: '2021-12-31',
        status: 'closed',
        closeMode: 'manual',
        lockedFromDate: '2021-12-15',
        notes: null,
    },
    {
        code: 'FY2022',
        name: 'Fiscal Year 2022',
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        status: 'closed',
        closeMode: 'manual',
        lockedFromDate: '2022-12-20',
        notes: null,
    },
    {
        code: 'FY2023',
        name: 'Fiscal Year 2023',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        status: 'closed',
        closeMode: 'manual',
        lockedFromDate: '2023-12-15',
        notes: 'Closed after Q4 audit. All periods finalized.',
    },
    {
        code: 'FY2024',
        name: 'Fiscal Year 2024',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'closed',
        closeMode: 'manual',
        lockedFromDate: '2024-12-20',
        notes: null,
    },
    {
        code: 'FY2025',
        name: 'Fiscal Year 2025',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        status: 'closed',
        closeMode: 'manual',
        lockedFromDate: '2025-12-31',
        notes: 'Recently closed. Retained for comparative reporting.',
    },
    {
        code: 'FY2026',
        name: 'Fiscal Year 2026',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'open',
        closeMode: 'manual',
        lockedFromDate: '2026-06-01',
        notes: 'Current active fiscal year. Locked from June 2026 onwards.',
    },
    {
        code: 'FY2027',
        name: 'Fiscal Year 2027',
        startDate: '2027-01-01',
        endDate: '2027-12-31',
        status: 'open',
        closeMode: 'manual',
        lockedFromDate: null,
        notes: 'Upcoming year. Opened early for advance enrollment posting.',
    },
    {
        code: 'FY2028',
        name: 'Fiscal Year 2028',
        startDate: '2028-01-01',
        endDate: '2028-12-31',
        status: 'open',
        closeMode: 'manual',
        lockedFromDate: null,
        notes: null,
    },
    {
        code: 'FY2029',
        name: 'Fiscal Year 2029',
        startDate: '2029-01-01',
        endDate: '2029-12-31',
        status: 'draft',
        closeMode: 'manual',
        lockedFromDate: null,
        notes: 'Preliminary draft for next planning cycle.',
    },
    {
        code: 'FY2030',
        name: 'Fiscal Year 2030',
        startDate: '2030-01-01',
        endDate: '2030-12-31',
        status: 'draft',
        closeMode: 'manual',
        lockedFromDate: null,
        notes: null,
    },
    {
        code: 'FY2031',
        name: 'Fiscal Year 2031',
        startDate: '2031-01-01',
        endDate: '2031-12-31',
        status: 'draft',
        closeMode: 'manual',
        lockedFromDate: null,
        notes: 'Long-range planning draft.',
    },
    {
        code: 'FY2032',
        name: 'Fiscal Year 2032',
        startDate: '2032-01-01',
        endDate: '2032-12-31',
        status: 'draft',
        closeMode: 'manual',
        lockedFromDate: null,
        notes: null,
    },
    {
        code: 'FY2033',
        name: 'Fiscal Year 2033',
        startDate: '2033-01-01',
        endDate: '2033-12-31',
        status: 'draft',
        closeMode: 'manual',
        lockedFromDate: null,
        notes: null,
    },
    {
        code: 'FY2034',
        name: 'Fiscal Year 2034',
        startDate: '2034-01-01',
        endDate: '2034-12-31',
        status: 'draft',
        closeMode: 'manual',
        lockedFromDate: null,
        notes: null,
    },
    {
        code: 'FY2035',
        name: 'Fiscal Year 2035',
        startDate: '2035-01-01',
        endDate: '2035-12-31',
        status: 'draft',
        closeMode: 'manual',
        lockedFromDate: null,
        notes: null,
    },
]

async function seedFiscalYears(): Promise<void> {
    console.log('[seed] Connecting to Payload...')
    const payload = await getPayload({ config })
    console.log('[seed] Connected. Upserting fiscal years...')

    let created = 0
    let updated = 0

    for (const fy of sampleFiscalYears) {
        const existing = await payload.find({
            collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
            where: {
                code: { equals: fy.code } as never,
            },
            limit: 1,
            depth: 0,
            overrideAccess: true,
        })

        if (existing.docs.length > 0) {
            await payload.update({
                collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
                id: existing.docs[0].id,
                overrideAccess: true,
                data: {
                    name: fy.name,
                    startDate: fy.startDate,
                    endDate: fy.endDate,
                    status: fy.status,
                    closeMode: fy.closeMode,
                    lockedFromDate: fy.lockedFromDate,
                    notes: fy.notes,
                } as never,
            })
            updated++
        } else {
            await payload.create({
                collection: ACCOUNTING_COLLECTION_SLUGS.fiscalYears,
                overrideAccess: true,
                data: {
                    code: fy.code,
                    name: fy.name,
                    startDate: fy.startDate,
                    endDate: fy.endDate,
                    status: fy.status,
                    closeMode: fy.closeMode,
                    lockedFromDate: fy.lockedFromDate,
                    notes: fy.notes,
                } as never,
            })
            created++
        }
    }

    console.log(`[seed] Done. Created: ${created}, Updated: ${updated}`)
    process.exit(0)
}

seedFiscalYears().catch((error) => {
    console.error('[seed] Fatal error:', error)
    process.exit(1)
})
