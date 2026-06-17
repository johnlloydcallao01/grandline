import { normalizeAmount } from '@/accounting/utils/amounts'
import {
  buildBillRow,
  buildBillsReferenceData,
  formatDate,
  type BillDoc,
  type BillRegisterRow,
  type BillsCell,
} from '../bills/_shared'

export type DueDateQueueRow = BillRegisterRow & {
  daysUntilDue: number
  daysUntilDueLabel: string
  dueState: 'overdue' | 'due_today' | 'due_this_week' | 'due_later'
  dueStateLabel: string
  isOverdue: boolean
  isDueToday: boolean
  isDueThisWeek: boolean
  isDueLater: boolean
  isPartiallyPaid: boolean
  isApprovedUnposted: boolean
  isMutable: boolean
  cells: BillsCell[]
}

const OPEN_QUEUE_STATUSES = new Set(['draft', 'approved', 'posted', 'partially_paid'])

const startOfToday = () => {
  const value = new Date()
  value.setHours(0, 0, 0, 0)
  return value
}

export const computeDaysUntilDue = (dueDate: string | null | undefined) => {
  if (!dueDate) return 0
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return 0
  due.setHours(0, 0, 0, 0)
  const today = startOfToday()
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export const buildDueState = (daysUntilDue: number) => {
  if (daysUntilDue < 0) {
    return { value: 'overdue' as const, label: 'Overdue' }
  }

  if (daysUntilDue === 0) {
    return { value: 'due_today' as const, label: 'Due Today' }
  }

  if (daysUntilDue <= 7) {
    return { value: 'due_this_week' as const, label: 'Due This Week' }
  }

  return { value: 'due_later' as const, label: 'Due Later' }
}

export const isOpenDueDateQueueBill = (bill: BillDoc) =>
  OPEN_QUEUE_STATUSES.has(String(bill.status || '')) && normalizeAmount(bill.balanceDue) > 0

export const buildDueDateQueueRow = (bill: BillDoc): DueDateQueueRow => {
  const baseRow = buildBillRow(bill)
  const daysUntilDue = computeDaysUntilDue(bill.dueDate)
  const dueState = buildDueState(daysUntilDue)
  const isOverdue = dueState.value === 'overdue'
  const isDueToday = dueState.value === 'due_today'
  const isDueThisWeek = dueState.value === 'due_this_week'
  const isDueLater = dueState.value === 'due_later'
  const isPartiallyPaid = baseRow.status === 'partially_paid'
  const isApprovedUnposted = baseRow.status === 'approved' && baseRow.postingStatus !== 'posted'
  const isMutable = ['draft', 'approved'].includes(baseRow.status)

  return {
    ...baseRow,
    daysUntilDue,
    daysUntilDueLabel: String(daysUntilDue),
    dueState: dueState.value,
    dueStateLabel: dueState.label,
    isOverdue,
    isDueToday,
    isDueThisWeek,
    isDueLater,
    isPartiallyPaid,
    isApprovedUnposted,
    isMutable,
    cells: [
      { text: baseRow.billNumber, emphasis: true },
      baseRow.vendorLabel,
      baseRow.billDateLabel,
      formatDate(bill.dueDate),
      { text: baseRow.balanceDueLabel, emphasis: true, align: 'right' },
      { text: baseRow.statusLabel, tone: baseRow.statusTone },
    ],
  }
}

export const matchesDueDateQueueQuickFilter = (
  row: DueDateQueueRow,
  quickFilter: string,
) => {
  const [group, value] = quickFilter.split(':')

  if (group === 'due') {
    return row.dueState === value
  }

  if (group === 'status') {
    return row.status === value
  }

  if (group === 'queue' && value === 'approved_unposted') {
    return row.isApprovedUnposted
  }

  return false
}

export const matchesSelectedDueDateQueueFilters = (
  row: DueDateQueueRow,
  filters: {
    statuses: string[]
    vendorIds: string[]
    dueStates: string[]
    quickFilters: string[]
  },
) => {
  const predicates = [
    ...filters.statuses.map((status) => row.status === status),
    ...filters.vendorIds.map((vendorId) => row.vendorId === vendorId),
    ...filters.dueStates.map((dueState) => row.dueState === dueState),
    ...filters.quickFilters.map((quickFilter) => matchesDueDateQueueQuickFilter(row, quickFilter)),
  ]

  if (predicates.length === 0) {
    return true
  }

  return predicates.some(Boolean)
}

export const buildDueDateQueueMetrics = (rows: DueDateQueueRow[]) => {
  const dueTodayCount = rows.filter((row) => row.isDueToday).length
  const dueInSevenDaysCount = rows.filter((row) => row.daysUntilDue >= 1 && row.daysUntilDue <= 7).length
  const partiallyPaidCount = rows.filter((row) => row.isPartiallyPaid).length
  const approvedUnpostedCount = rows.filter((row) => row.isApprovedUnposted).length

  return [
    {
      id: 'due-today',
      label: 'Due Today',
      value: dueTodayCount,
      change: 'Immediate settlement review needed',
      trend: 'neutral' as const,
    },
    {
      id: 'due-in-7-days',
      label: 'Due In 7 Days',
      value: dueInSevenDaysCount,
      change: 'Near-term disbursement planning window',
      trend: 'up' as const,
    },
    {
      id: 'partially-paid-bills',
      label: 'Partially Paid Bills',
      value: partiallyPaidCount,
      change: 'Bills with remaining open balances',
      trend: 'neutral' as const,
    },
    {
      id: 'approved-unposted',
      label: 'Approved Unposted',
      value: approvedUnpostedCount,
      change: 'Ready for posting workflow',
      trend: 'up' as const,
    },
  ]
}

export { buildBillsReferenceData }
export type { BillDoc }
