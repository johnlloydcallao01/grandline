import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedTimer = {
  entryDate: string
  hours: number
  minutes: number
  billable: boolean
  billingRate: number
  costRate: number
  status: string
  startedAt: string | null
  endedAt: string | null
  notes: string | null
  projectIdx: number
  userIdx: number
}

const entries: SeedTimer[] = [
  { entryDate: '2026-01-24', hours: 6, minutes: 30, billable: true, billingRate: 2500, costRate: 1200, status: 'approved', startedAt: '2026-01-24T08:00', endedAt: '2026-01-24T14:30', notes: 'Conducted maritime theory sessions for Batch 7.', projectIdx: 0, userIdx: 0 },
  { entryDate: '2026-04-15', hours: 3, minutes: 0, billable: true, billingRate: 2200, costRate: 1100, status: 'approved', startedAt: '2026-04-15T13:00', endedAt: '2026-04-15T16:00', notes: 'Simulator dry run validation.', projectIdx: 2, userIdx: 2 },
  { entryDate: '2026-03-15', hours: 7, minutes: 0, billable: true, billingRate: 2400, costRate: 1150, status: 'approved', startedAt: '2026-03-15T07:00', endedAt: '2026-03-15T14:00', notes: 'Equipment delivery coordination and room setup in Cebu.', projectIdx: 1, userIdx: 1 },
  { entryDate: '2026-02-10', hours: 5, minutes: 0, billable: true, billingRate: 2600, costRate: 1250, status: 'submitted', startedAt: '2026-02-10T09:00', endedAt: '2026-02-10T14:00', notes: 'Harbor operations training module development.', projectIdx: 1, userIdx: 3 },
  { entryDate: '2026-05-08', hours: 8, minutes: 0, billable: false, billingRate: 0, costRate: 900, status: 'approved', startedAt: '2026-05-08T07:00', endedAt: '2026-05-08T15:00', notes: 'Server maintenance and LMS platform migration prep.', projectIdx: 5, userIdx: 4 },
  { entryDate: '2026-06-14', hours: 4, minutes: 30, billable: true, billingRate: 2800, costRate: 1300, status: 'draft', startedAt: '2026-06-14T10:00', endedAt: '2026-06-14T14:30', notes: 'Draft safety certification exam and rubric review.', projectIdx: 6, userIdx: 0 },
  { entryDate: '2026-07-05', hours: 2, minutes: 15, billable: true, billingRate: 2000, costRate: 950, status: 'submitted', startedAt: '2026-07-05T15:00', endedAt: '2026-07-05T17:15', notes: 'API integration contract review follow-up with legal.', projectIdx: 7, userIdx: 5 },
  { entryDate: '2026-01-30', hours: 1, minutes: 45, billable: false, billingRate: 0, costRate: 800, status: 'rejected', startedAt: '2026-01-30T08:00', endedAt: '2026-01-30T09:45', notes: 'Archive attempt rejected — duplicate work by infra team.', projectIdx: 4, userIdx: 3 },
  { entryDate: '2026-03-28', hours: 3, minutes: 30, billable: true, billingRate: 2300, costRate: 1000, status: 'approved', startedAt: '2026-03-28T13:00', endedAt: '2026-03-28T16:30', notes: 'Cadet billing reconciliation with corporate sponsor.', projectIdx: 3, userIdx: 2 },
  { entryDate: '2026-04-02', hours: 2, minutes: 0, billable: false, billingRate: 0, costRate: 750, status: 'submitted', startedAt: '2026-04-02T11:00', endedAt: '2026-04-02T13:00', notes: 'Simulator hardware vendor assessment.', projectIdx: 5, userIdx: 1 },
]

async function seedTimerEntries(): Promise<void> {
  console.log('[seed:timer-entries] Connecting...')
  const payload = await getPayload({ config })
  console.log('[seed:timer-entries] Connected. Loading refs...')

  const [projectResult, userResult] = await Promise.all([
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, limit: 20, depth: 0, overrideAccess: true, sort: 'projectCode' }),
    payload.find({ collection: 'users', limit: 20, depth: 0, overrideAccess: true }),
  ])

  const projects = projectResult.docs
  const users = userResult.docs.filter((u: any) => u.role !== 'service' && u.isActive !== false)
  if (!projects.length || !users.length) { console.error('[seed:timer-entries] Need projects and users.'); process.exit(1) }
  console.log(`[seed:timer-entries] ${projects.length} projects, ${users.length} users`)

  let created = 0; let updated = 0
  for (const e of entries) {
    const project = projects[e.projectIdx % projects.length]
    const user = users[e.userIdx % users.length]

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
      where: { and: [{ entryDate: { equals: e.entryDate } as any }, { user: { equals: user.id } as any }, { project: { equals: project.id } as any }] },
      limit: 1, depth: 0, overrideAccess: true,
    })

    const data = { entryDate: e.entryDate, user: user.id, project: project.id, hours: e.hours, minutes: e.minutes, billable: e.billable, billingRate: e.billingRate, costRate: e.costRate, status: e.status, sourceType: 'timer', startedAt: e.startedAt, endedAt: e.endedAt, notes: e.notes } as never

    if (existing.docs.length > 0) {
      await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, id: existing.docs[0].id, overrideAccess: true, data })
      updated++
      console.log(`  UPDATED ${e.entryDate} (${e.hours}h${e.minutes}m)`)
    } else {
      await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, overrideAccess: true, data })
      created++
      console.log(`  CREATED ${e.entryDate} → ${(project as any).projectCode || project.id}`)
    }
  }
  console.log(`[seed:timer-entries] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedTimerEntries().catch((e) => { console.error('[seed:timer-entries] Fatal:', e); process.exit(1) })
