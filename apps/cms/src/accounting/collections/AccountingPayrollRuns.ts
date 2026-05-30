import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access'
import { ACCOUNTING_ADMIN_GROUP, ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_PAYROLL_RUN_STATUS_OPTIONS } from '../constants/accounting'
import { buildAuditedHooks, buildCreatedUpdatedByFields, buildDimensionFields } from '../utils/phase4-collections'

export const AccountingPayrollRuns: CollectionConfig = {
  slug: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
  dbName: 'acct_payroll_runs',
  admin: {
    useAsTitle: 'payrollCode',
    defaultColumns: ['payrollCode', 'periodStart', 'periodEnd', 'paymentDate', 'status'],
    group: ACCOUNTING_ADMIN_GROUP,
    description: 'Finance-oriented payroll grouping for salary, contractor, reimbursement, and adjustment postings.',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'payrollCode', type: 'text', required: true, unique: true, index: true },
    { name: 'periodStart', type: 'date', required: true, index: true },
    { name: 'periodEnd', type: 'date', required: true, index: true },
    { name: 'paymentDate', type: 'date', required: true, index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...ACCOUNTING_PAYROLL_RUN_STATUS_OPTIONS] },
    ...buildDimensionFields({ branch: true, department: true }),
    { name: 'approvalRequest', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.approvalRequests },
    { name: 'postedJournalEntry', type: 'relationship', relationTo: ACCOUNTING_COLLECTION_SLUGS.journalEntries },
    { name: 'notes', type: 'textarea' },
    ...buildCreatedUpdatedByFields(),
  ],
  hooks: buildAuditedHooks('payroll_run'),
}
