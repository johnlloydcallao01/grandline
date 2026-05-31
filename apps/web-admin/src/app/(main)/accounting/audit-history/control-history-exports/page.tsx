import { AuditHistoryPage, type AuditHistoryTab } from '../_components/AuditHistoryPage';

const tabs: AuditHistoryTab[] = [
  {
    id: 'period-close-history',
    label: 'Period & Fiscal History',
    description: 'Review fiscal-year and period control history using status, close dates, lock dates, and responsible users.',
    searchPlaceholder: 'Search fiscal year, period label, status, closed by, or lock date',
    filters: ['Closed', 'Open', 'Soft Locked', 'Draft'],
    actions: [
      { label: 'Refresh Controls', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Closed Periods', value: '14', change: 'Periods with closedAt and closedBy recorded', trend: 'up' },
      { label: 'Open Periods', value: '2', change: 'Available for active posting', trend: 'neutral' },
      { label: 'Closed Fiscal Years', value: '1', change: 'Historical year-end control preserved', trend: 'neutral' },
      { label: 'Locked From Dates', value: '6', change: 'Periods or years with lock-date enforcement', trend: 'up' },
    ],
    tableTitle: 'Period & Fiscal Control History',
    tableDescription: 'Control history for fiscal years and accounting periods using close status, lock dates, and recorded operators.',
    columns: ['Control', 'Range', 'Status', 'Locked From', 'Closed At', 'Closed By'],
    rows: [
      {
        id: 'control-1',
        cells: [
          { text: 'FY2025', emphasis: true },
          '2025-01-01 to 2025-12-31',
          { text: 'Closed', tone: 'green' },
          '2025-12-31',
          '2026-01-03 18:20',
          'finance.controller',
        ],
      },
      {
        id: 'control-2',
        cells: [
          { text: '2026 P04', emphasis: true },
          '2026-04-01 to 2026-04-30',
          { text: 'Closed', tone: 'green' },
          '2026-04-30',
          '2026-05-03 09:12',
          'gl.manager',
        ],
      },
      {
        id: 'control-3',
        cells: [
          { text: '2026 P05', emphasis: true },
          '2026-05-01 to 2026-05-31',
          { text: 'Open', tone: 'blue' },
          '2026-05-25',
          '-',
          '-',
        ],
      },
      {
        id: 'control-4',
        cells: [
          { text: '2026 P03', emphasis: true },
          '2026-03-01 to 2026-03-31',
          { text: 'Soft Locked', tone: 'amber' },
          '2026-03-31',
          '-',
          '-',
        ],
      },
    ],
  },
  {
    id: 'reconciliation-history',
    label: 'Reconciliation History',
    description: 'Track bank reconciliation sessions with statement balances, book balances, differences, status, and completion fields.',
    searchPlaceholder: 'Search bank account, statement end date, status, completed by, or difference',
    filters: ['Draft', 'In Progress', 'Completed', 'Locked'],
    actions: [
      { label: 'Open Reconciliation', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Sessions', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Completed Sessions', value: '11', change: 'Reconciliations marked complete this month', trend: 'up' },
      { label: 'Locked Sessions', value: '7', change: 'Protected reconciliation history', trend: 'up' },
      { label: 'Open Sessions', value: '3', change: 'Still in draft or in-progress state', trend: 'neutral' },
      { label: 'Difference Items', value: 'PHP 21,450', change: 'Remaining unresolved session differences', trend: 'down' },
    ],
    tableTitle: 'Bank Reconciliation History',
    tableDescription: 'Reconciliation history using statement dates, closing balances, difference amounts, and completion records.',
    columns: ['Session', 'Bank Account', 'Statement End', 'Difference', 'Status', 'Completed By'],
    rows: [
      {
        id: 'rec-1',
        cells: [
          { text: 'REC-2026-05-BDO', emphasis: true },
          'BDO Operations',
          '2026-05-31',
          { text: 'PHP 0', emphasis: true, align: 'right' },
          { text: 'Completed', tone: 'green' },
          'treasury.lead',
        ],
      },
      {
        id: 'rec-2',
        cells: [
          { text: 'REC-2026-05-MB', emphasis: true },
          'Metrobank Main',
          '2026-05-31',
          { text: 'PHP 8,450', emphasis: true, align: 'right' },
          { text: 'In Progress', tone: 'blue' },
          '-',
        ],
      },
      {
        id: 'rec-3',
        cells: [
          { text: 'REC-2026-04-RCBC', emphasis: true },
          'RCBC Reserve',
          '2026-04-30',
          { text: 'PHP 0', emphasis: true, align: 'right' },
          { text: 'Locked', tone: 'green' },
          'finance.controller',
        ],
      },
      {
        id: 'rec-4',
        cells: [
          { text: 'REC-2026-05-UB', emphasis: true },
          'UnionBank Payroll',
          '2026-05-31',
          { text: 'PHP 13,000', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'amber' },
          '-',
        ],
      },
    ],
  },
  {
    id: 'export-history',
    label: 'Export History',
    description: 'Review exported actions captured in the finance audit log for outbound accounting reports and snapshots.',
    searchPlaceholder: 'Search exported action, report name, entity type, user, or metadata',
    filters: ['Exported', 'Reports', 'Reconciliation Snapshots', 'Registers'],
    actions: [
      { label: 'Refresh Exports', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Export Events', value: '12', change: 'Exported actions recorded in audit logs', trend: 'up' },
      { label: 'Register Downloads', value: '7', change: 'Bill, invoice, and payment register extracts', trend: 'up' },
      { label: 'Snapshot Exports', value: '2', change: 'Bank reconciliation snapshots generated', trend: 'neutral' },
      { label: 'Export Actors', value: '4', change: 'Users creating outbound accounting outputs', trend: 'neutral' },
    ],
    tableTitle: 'Control Export History',
    tableDescription: 'Export history based on finance audit-log entries marked as exported.',
    columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Metadata'],
    rows: [
      {
        id: 'exp-1',
        cells: [
          '2026-05-31 10:02',
          'invoice',
          { text: 'invoice-register', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'ar.lead',
          'PDF register export',
        ],
      },
      {
        id: 'exp-2',
        cells: [
          '2026-05-31 09:36',
          'bill',
          { text: 'bill-register', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'ap.manager',
          'XLSX register export',
        ],
      },
      {
        id: 'exp-3',
        cells: [
          '2026-05-30 04:55',
          'bank_reconciliation',
          { text: 'REC-2026-05-BDO', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'treasury.lead',
          'Snapshot package export',
        ],
      },
      {
        id: 'exp-4',
        cells: [
          '2026-05-30 03:11',
          'payment_made',
          { text: 'payments-made-register', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'finance.controller',
          'Register export for month-end review',
        ],
      },
    ],
  },
];

export default function ControlHistoryExportsPage() {
  return (
    <AuditHistoryPage
      eyebrow="Core / Audit & History"
      title="Control History & Exports"
      description="Review control history for periods, fiscal years, reconciliations, and exported audit events."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Download Control View', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
