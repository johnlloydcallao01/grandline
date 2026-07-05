import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedTimeEntry = {
  entryDate: string
  hours: number
  minutes: number
  billable: boolean
  billingRate: number
  costRate: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'posted'
  sourceType: 'manual' | 'timer' | 'course_delivery' | 'project_work' | 'support' | 'other'
  startedAt: string | null
  endedAt: string | null
  notes: string | null
  projectIndex: number
  userIndex: number
  taskIndex: number | null
}

const entries: SeedTimeEntry[] = [
  { entryDate: '2026-01-22', hours: 6, minutes: 30, billable: true, billingRate: 2500, costRate: 1200, status: 'approved', sourceType: 'course_delivery', startedAt: '2026-01-22T08:00', endedAt: '2026-01-22T14:30', notes: 'Conducted maritime theory sessions for Batch 7.', projectIndex: 0, userIndex: 0, taskIndex: 0 },
  { entryDate: '2026-03-10', hours: 4, minutes: 15, billable: false, billingRate: 0, costRate: 900, status: 'submitted', sourceType: 'manual', startedAt: null, endedAt: null, notes: 'Updated training syllabus per new IMO compliance requirements.', projectIndex: 1, userIndex: 1, taskIndex: 1 },
  { entryDate: '2026-04-15', hours: 3, minutes: 0, billable: true, billingRate: 2200, costRate: 1100, status: 'approved', sourceType: 'timer', startedAt: '2026-04-15T13:00', endedAt: '2026-04-15T16:00', notes: 'Simulator dry run validation session.', projectIndex: 2, userIndex: 2, taskIndex: 2 },
  { entryDate: '2026-05-03', hours: 2, minutes: 45, billable: true, billingRate: 2000, costRate: 1000, status: 'posted', sourceType: 'project_work', startedAt: null, endedAt: null, notes: 'Prepared billing summary for corporate cadet program.', projectIndex: 3, userIndex: 3, taskIndex: 3 },
  { entryDate: '2026-06-05', hours: 8, minutes: 0, billable: false, billingRate: 0, costRate: 800, status: 'draft', sourceType: 'manual', startedAt: null, endedAt: null, notes: 'Export and validation of legacy course catalog data.', projectIndex: 4, userIndex: 4, taskIndex: 4 },
  { entryDate: '2026-02-20', hours: 4, minutes: 0, billable: false, billingRate: 0, costRate: 950, status: 'submitted', sourceType: 'project_work', startedAt: null, endedAt: null, notes: 'Vendor proposal evaluation and scoring.', projectIndex: 5, userIndex: 5, taskIndex: 5 },
  { entryDate: '2026-05-20', hours: 5, minutes: 30, billable: true, billingRate: 2800, costRate: 1300, status: 'approved', sourceType: 'course_delivery', startedAt: '2026-05-20T09:00', endedAt: '2026-05-20T14:30', notes: 'Drafted safety certification exam questions and rubrics.', projectIndex: 6, userIndex: 0, taskIndex: 6 },
  { entryDate: '2026-07-10', hours: 3, minutes: 15, billable: false, billingRate: 0, costRate: 850, status: 'draft', sourceType: 'manual', startedAt: null, endedAt: null, notes: 'Reviewed API integration service agreements with legal team.', projectIndex: 7, userIndex: 1, taskIndex: 7 },
  { entryDate: '2026-03-15', hours: 7, minutes: 0, billable: true, billingRate: 2400, costRate: 1150, status: 'approved', sourceType: 'timer', startedAt: '2026-03-15T07:00', endedAt: '2026-03-15T14:00', notes: 'Equipment delivery coordination and room setup in Cebu.', projectIndex: 1, userIndex: 2, taskIndex: 8 },
  { entryDate: '2026-01-15', hours: 2, minutes: 0, billable: false, billingRate: 0, costRate: 700, status: 'rejected', sourceType: 'support', startedAt: null, endedAt: null, notes: 'Attempted archive of IT docs — rejected by lead due to overlap with infra team.', projectIndex: 4, userIndex: 3, taskIndex: 9 },
]

async function seedTimeEntries(): Promise<void> {
  console.log('[seed:time-entries] Connecting...')
  const payload = await getPayload({ config })
  console.log('[seed:time-entries] Connected. Loading refs...')

  const [projectResult, userResult, taskResult] = await Promise.all([
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, limit: 20, depth: 0, overrideAccess: true, sort: 'projectCode' }),
    payload.find({ collection: 'users', limit: 20, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, limit: 20, depth: 0, overrideAccess: true, sort: 'taskCode' }),
  ])

  const projects = projectResult.docs
  const users = userResult.docs.filter((u: any) => u.role !== 'service' && u.isActive !== false)
  const tasks = taskResult.docs

  if (!projects.length || !users.length) {
    console.error('[seed:time-entries] Requires projects and users. Run those seeders first.')
    process.exit(1)
  }

  console.log(`[seed:time-entries] ${projects.length} projects, ${users.length} users, ${tasks.length} tasks`)

  let created = 0
  let updated = 0

  for (const e of entries) {
    const project = projects[e.projectIndex % projects.length]
    const user = users[e.userIndex % users.length]
    const task = e.taskIndex != null ? tasks[e.taskIndex % tasks.length] || null : null

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
      where: { and: [{ entryDate: { equals: e.entryDate } as any }, { user: { equals: user.id } as any }, { project: { equals: project.id } as any }] },
      limit: 1, depth: 0, overrideAccess: true,
    })

    const data = {
      entryDate: e.entryDate, user: user.id, project: project.id,
      projectTask: task ? task.id : undefined,
      hours: e.hours, minutes: e.minutes, billable: e.billable,
      billingRate: e.billingRate, costRate: e.costRate,
      status: e.status, sourceType: e.sourceType,
      startedAt: e.startedAt, endedAt: e.endedAt,
      notes: e.notes,
    } as never

    if (existing.docs.length > 0) {
      await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, id: existing.docs[0].id, overrideAccess: true, data })
      updated++
      console.log(`  UPDATED ${e.entryDate} (${e.hours}h${e.minutes}m)`)
    } else {
      await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries, overrideAccess: true, data })
      created++
      console.log(`  CREATED ${e.entryDate} (${e.hours}h${e.minutes}m) → ${(project as any).projectCode || project.id}`)
    }
  }

  console.log(`[seed:time-entries] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedTimeEntries().catch((e) => { console.error('[seed:time-entries] Fatal:', e); process.exit(1) })
