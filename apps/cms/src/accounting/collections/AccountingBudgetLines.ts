import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields } from '../utils/phase4-collections'

export const AccountingBudgetLines: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.budgetLines,
  dbName: 'acct_budget_lines',
  admin: {
    useAsTitle: 'account',
    defaultColumns: ['budget', 'account', 'period', 'plannedAmount'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Line-level planned values for budget comparison against actual accounting outputs.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'budget', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.budgets, required: true, index: true },
    { name: 'account', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, required: true, index: true },
    { name: 'period', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.periods, index: true },
    { name: 'plannedAmount', type: 'number', required: true, defaultValue: 0 },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('budget'),
}
