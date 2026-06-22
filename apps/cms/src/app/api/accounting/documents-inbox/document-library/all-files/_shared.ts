import type { AccountingInboxDetail, AccountingInboxRow } from '../../document-intake/accounting-inbox/_shared'
import {
  buildAccountingInboxReferenceData,
  buildAccountingInboxRegister,
  findAccountingInboxDetailById,
  matchesAccountingInboxFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
} from '../../document-intake/accounting-inbox/_shared'

export type AllFilesCell =
  import('../../document-intake/accounting-inbox/_shared').AccountingInboxCell
export type AllFilesRow = AccountingInboxRow
export type AllFilesDetail = AccountingInboxDetail

export {
  buildAccountingInboxReferenceData,
  buildAccountingInboxRegister,
  findAccountingInboxDetailById,
  matchesAccountingInboxFilters,
  normalizeSearch,
  parseIntegerParam,
  parseListParam,
}

export const buildAllFilesMetrics = (rows: AllFilesRow[]) => [
  {
    id: 'document-library-total-files',
    label: 'Total Files',
    value: rows.length,
    change: 'Files currently visible in the accounting library',
    trend: 'up' as const,
  },
  {
    id: 'document-library-linked-records',
    label: 'Linked Records',
    value: rows.filter((row) => row.linkCount > 0).length,
    change: 'Files already linked to accounting records',
    trend: 'up' as const,
  },
  {
    id: 'document-library-primary-documents',
    label: 'Primary Documents',
    value: rows.filter((row) => row.hasPrimaryLink).length,
    change: 'Files flagged as the primary support document',
    trend: 'neutral' as const,
  },
  {
    id: 'document-library-multi-link-files',
    label: 'Multi-link Files',
    value: rows.filter((row) => row.isMultiLinked).length,
    change: 'Files referenced by more than one accounting record',
    trend: 'neutral' as const,
  },
]
