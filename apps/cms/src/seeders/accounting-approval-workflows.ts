import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import {
  ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS,
  ACCOUNTING_COLLECTION_SLUGS,
} from '../accounting/constants/accounting'

type UserDoc = {
  id: number | string
  role?: string | null
  isActive?: boolean | null
  username?: string | null
  firstName?: string | null
  lastName?: string | null
}

type EntityType =
  | 'invoice'
  | 'bill'
  | 'expense'
  | 'journal'
  | 'budget'
  | 'asset_disposal'
  | 'timesheet'
  | 'payroll_run'

type WorkflowDoc = {
  id: number | string
  workflowCode?: string | null
}

const SAMPLE_COUNT = 20
const entityTypes = ACCOUNTING_APPROVAL_ENTITY_TYPE_OPTIONS.map(
  (option) => option.value,
) as EntityType[]

const entityCodeMap: Record<EntityType, string> = {
  invoice: 'INV',
  bill: 'BILL',
  expense: 'EXP',
  journal: 'JRNL',
  budget: 'BUD',
  asset_disposal: 'AST',
  timesheet: 'TIME',
  payroll_run: 'PAY',
}

const entityNameMap: Record<EntityType, string> = {
  invoice: 'Invoice Revenue Review',
  bill: 'Bill Release Review',
  expense: 'Expense Approval Flow',
  journal: 'Journal Review Flow',
  budget: 'Budget Approval Chain',
  asset_disposal: 'Asset Disposal Review',
  timesheet: 'Timesheet Sign-Off',
  payroll_run: 'Payroll Run Approval',
}

const stepLabelGroups = [
  ['Initial Review', 'Controller Review', 'Final Approval'],
  ['Operations Review', 'Accounting Review', 'Executive Approval'],
  ['Compliance Review', 'Finance Review', 'Release Approval'],
] as const

const buildWorkflowCode = (entityType: EntityType, sequence: number) =>
  `WF-SEED-${entityCodeMap[entityType]}-2026-${String(sequence).padStart(3, '0')}`

const buildWorkflowName = (entityType: EntityType, sequence: number) =>
  `${entityNameMap[entityType]} ${String(sequence).padStart(2, '0')}`

const buildApproverRole = (stepIndex: number) =>
  ['Accounting Manager', 'Controller', 'Finance Director'][stepIndex] ||
  `Approval Step ${stepIndex + 1}`

async function seedApprovalWorkflows() {
  const payload = await getPayload({ config })

  const usersResult = await payload.find({
    collection: 'users',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const allUsers = usersResult.docs as UserDoc[]
  const approverPool =
    allUsers.filter(
      (user) => String(user.role || '') !== 'service' && user.isActive !== false,
    ) ||
    []
  const eligibleUsers = approverPool.length > 0 ? approverPool : allUsers

  if (eligibleUsers.length === 0) {
    throw new Error(
      'No users were found to assign as workflow approvers. Create users first, then rerun the approval workflow seeder.',
    )
  }

  const adminId =
    eligibleUsers.find((user) => String(user.role || '') === 'admin')?.id ??
    eligibleUsers[0]?.id ??
    null

  let createdCount = 0
  let updatedCount = 0

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const sequence = index + 1
    const entityType = entityTypes[index % entityTypes.length]
    const stepLabels = stepLabelGroups[index % stepLabelGroups.length]
    const workflowCode = buildWorkflowCode(entityType, sequence)
    const workflowName = buildWorkflowName(entityType, sequence)
    const noteSeedKey = `[seed:approval-workflow-${String(sequence).padStart(3, '0')}]`
    const steps = stepLabels.map((label, stepIndex) => ({
      stepNumber: stepIndex + 1,
      label,
      approverUser:
        eligibleUsers[(index + stepIndex) % eligibleUsers.length]?.id ?? eligibleUsers[0].id,
      approverRole: buildApproverRole(stepIndex),
    }))

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows as any,
      where: {
        workflowCode: {
          equals: workflowCode,
        },
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      workflowCode,
      name: workflowName,
      entityType,
      isActive: true,
      steps,
      notes: `${noteSeedKey} Sample active approval workflow seeded for workflow-management coverage.`,
      createdBy: adminId,
      updatedBy: adminId,
    } as never

    if (existing.docs[0]) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows as any,
        id: (existing.docs[0] as WorkflowDoc).id,
        overrideAccess: true,
        depth: 0,
        data,
      })
      updatedCount += 1
      console.log(`Updated active approval workflow ${workflowCode}`)
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.approvalWorkflows as any,
        overrideAccess: true,
        depth: 0,
        data,
      })
      createdCount += 1
      console.log(`Created active approval workflow ${workflowCode}`)
    }
  }

  console.log(
    `[seed] Active approval workflows ready. Created: ${createdCount}, Updated: ${updatedCount}`,
  )
}

seedApprovalWorkflows()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[seed] Fatal error while seeding approval workflows:', error)
    process.exit(1)
  })
