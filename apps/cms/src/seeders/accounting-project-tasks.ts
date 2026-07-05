import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedTask = {
  taskCode: string
  name: string
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'
  billable: boolean
  startDate: string | null
  dueDate: string | null
  notes: string | null
}

const sampleTasks: SeedTask[] = [
  { taskCode: 'TASK-0001', name: 'Onboard new trainee cohort', status: 'in_progress', billable: true, startDate: '2026-01-20', dueDate: '2026-02-15', notes: 'Coordinate intake paperwork, assessments, and orientation for Batch 7.' },
  { taskCode: 'TASK-0002', name: 'Update training syllabus v4.2', status: 'completed', billable: false, startDate: '2026-03-01', dueDate: '2026-03-20', notes: 'Revise maritime safety module per latest IMO standards.' },
  { taskCode: 'TASK-0003', name: 'Conduct simulator dry run', status: 'open', billable: true, startDate: '2026-04-10', dueDate: '2026-04-25', notes: 'Run full simulation scenario with instructor panel before go-live.' },
  { taskCode: 'TASK-0004', name: 'Prepare monthly billing report', status: 'in_progress', billable: true, startDate: '2026-05-01', dueDate: '2026-05-10', notes: 'Compile hours, expenses, and revenue for corporate cadet program.' },
  { taskCode: 'TASK-0005', name: 'Migrate legacy course catalog', status: 'draft', billable: false, startDate: '2026-06-01', dueDate: '2026-06-30', notes: 'Export course records from legacy system and validate in LMS platform.' },
  { taskCode: 'TASK-0006', name: 'Vendor hardware assessment', status: 'open', billable: false, startDate: '2026-02-15', dueDate: '2026-03-05', notes: 'Evaluate vendor proposals for simulator server rack upgrade.' },
  { taskCode: 'TASK-0007', name: 'Draft safety certification exam', status: 'in_progress', billable: true, startDate: '2026-05-15', dueDate: '2026-06-15', notes: 'Create question bank and practical assessment rubrics for certification.' },
  { taskCode: 'TASK-0008', name: 'Review third-party API contracts', status: 'draft', billable: false, startDate: '2026-07-01', dueDate: '2026-07-20', notes: 'Legal and finance review of payroll and banking API service agreements.' },
  { taskCode: 'TASK-0009', name: 'Setup Cebu training facility', status: 'completed', billable: true, startDate: '2026-03-01', dueDate: '2026-03-30', notes: 'Coordinate equipment delivery, room setup, and instructor scheduling.' },
  { taskCode: 'TASK-0010', name: 'Archive completed IT refresh docs', status: 'cancelled', billable: false, startDate: '2026-01-10', dueDate: '2026-01-31', notes: 'Cancelled — documentation is already archived by the infrastructure team.' },
]

const projectIndices = [0, 1, 2, 3, 4, 5, 6, 7, 1, 4]

async function seedProjectTasks(): Promise<void> {
  console.log('[seed:project-tasks] Connecting to Payload...')
  const payload = await getPayload({ config })
  console.log('[seed:project-tasks] Connected. Loading reference data...')

  const [projectResult, userResult] = await Promise.all([
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, limit: 20, depth: 0, overrideAccess: true, sort: 'projectCode' }),
    payload.find({ collection: 'users', limit: 20, depth: 0, overrideAccess: true }),
  ])

  const projects = projectResult.docs
  const users = userResult.docs.filter((u: any) => u.role !== 'service' && u.isActive !== false)

  if (projects.length === 0) {
    console.error('[seed:project-tasks] No projects found. Run accounting-projects seeder first.')
    process.exit(1)
  }

  console.log(`[seed:project-tasks] Found ${projects.length} projects, ${users.length} active users`)

  let created = 0
  let updated = 0

  for (let i = 0; i < sampleTasks.length; i++) {
    const task = sampleTasks[i]
    const project = projects[projectIndices[i] % projects.length]
    const user = users[i % users.length] || null

    if (!project) {
      console.log(`  SKIP "${task.taskCode}" — no project at index ${projectIndices[i]}`)
      continue
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks,
      where: { taskCode: { equals: task.taskCode } as never },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      project: project.id,
      name: task.name,
      status: task.status,
      billable: task.billable,
      assignedTo: user ? user.id : undefined,
      startDate: task.startDate,
      dueDate: task.dueDate,
      notes: task.notes,
    } as never

    if (existing.docs.length > 0) {
      await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, id: existing.docs[0].id, overrideAccess: true, data })
      updated++
      console.log(`  UPDATED "${task.taskCode}" → ${(project as any).projectCode || project.id}`)
    } else {
      await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.projectTasks, overrideAccess: true, data: { taskCode: task.taskCode, project: project.id, name: task.name, status: task.status, billable: task.billable, assignedTo: user ? user.id : undefined, startDate: task.startDate, dueDate: task.dueDate, notes: task.notes } as never })
      created++
      console.log(`  CREATED "${task.taskCode}" → ${(project as any).projectCode || project.id}`)
    }
  }

  console.log(`[seed:project-tasks] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedProjectTasks().catch((error) => { console.error('[seed:project-tasks] Fatal error:', error); process.exit(1) })
