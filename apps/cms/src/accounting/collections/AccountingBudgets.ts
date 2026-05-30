import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import {
  ACCOUNTING_ADMIN_GROUP,
  ACCOUNTING_BUDGET_STATUS_OPTIONS,
  ACCOUNTING_BUDGET_TYPE_OPTIONS,
  ACCOUNTING_COLLECTION_SLUGS,
} from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields, buildDimensionFields } from '../utils/phase4-collections'

export const AccountingBudgets: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.budgets,
  dbName: 'acct_budgets',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['budgetCode', 'name', 'fiscalYear', 'status', 'budgetType'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Finance planning records used for budget vs actual reporting and approvals.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'budgetCode', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'fiscalYear', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.fiscalYears, required: true, index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_BUDGET_STATUS_OPTIONS] },
    { name: 'budgetType', type: 'select', required: true, defaultValue: 'annual', options: [...ACCOUNTING_BUDGET_TYPE_OPTIONS] },
    ...buildDimensionFields({ branch: true, department: true, location: true }),
    { name: 'project', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.projects, index: true },
    { name: 'courseCategory', type: 'relationship', relationTo: 'course-categories', index: true },
    { name: 'scenario', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.forecastScenarios, index: true },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('budget'),
}
