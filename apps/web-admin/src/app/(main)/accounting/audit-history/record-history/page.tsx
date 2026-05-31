import { AuditHistoryPage, type AuditHistoryTab } from '../_components/AuditHistoryPage';

const tabs: AuditHistoryTab[] = [
  {
    id: 'entity-history',
    label: 'Entity History',
    description: 'Review audit-log history by accounting entity using entity type, entity id, actor, action, and event time.',
    searchPlaceholder: 'Search entity type, entity id, action, user, or timestamp',
    filters: ['Invoices', 'Bills', 'Payments', 'Banking'],
    actions: [
      { label: 'Refresh History', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Entities Touched Today', value: '46', change: 'Distinct accounting records with audit activity', trend: 'up' },
      { label: 'Invoice History Events', value: '22', change: 'Invoice records updated or posted today', trend: 'up' },
      { label: 'Banking History Events', value: '14', change: 'Deposits, transfers, and reconciliations logged', trend: 'neutral' },
      { label: 'Voided Records', value: '3', change: 'Records with void activity visible in history', trend: 'down' },
    ],
    tableTitle: 'Entity Activity History',
    tableDescription: 'Entity-oriented audit history showing who changed which accounting record and when.',
    columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Source Field'],
    rows: [
      {
        id: 'entity-1',
        cells: [
          '2026-05-31 09:42',
          'invoice',
          { text: 'INV-2026-1452', emphasis: true },
          { text: 'posted', tone: 'green' },
          'finance.lead',
          'postedJournalEntry',
        ],
      },
      {
        id: 'entity-2',
        cells: [
          '2026-05-31 09:18',
          'bill',
          { text: 'BILL-2026-1184', emphasis: true },
          { text: 'updated', tone: 'blue' },
          'ap.processor',
          'updatedBy',
        ],
      },
      {
        id: 'entity-3',
        cells: [
          '2026-05-31 08:56',
          'payment_made',
          { text: 'PM-2026-083', emphasis: true },
          { text: 'approved', tone: 'blue' },
          'ap.manager',
          'applications',
        ],
      },
      {
        id: 'entity-4',
        cells: [
          '2026-05-30 05:44',
          'bank_reconciliation',
          { text: 'REC-2026-05-BDO', emphasis: true },
          { text: 'completed', tone: 'green' },
          'treasury.lead',
          'completedAt',
        ],
      },
    ],
  },
  {
    id: 'before-after-history',
    label: 'Before / After History',
    description: 'Inspect before-data and after-data snapshots stored in the finance audit trail for sensitive record changes.',
    searchPlaceholder: 'Search entity id, changed field, actor, reason, or snapshot key',
    filters: ['With Before Data', 'With After Data', 'Sensitive Changes', 'Recent'],
    actions: [
      { label: 'Refresh Snapshots', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Snapshot Events', value: '31', change: 'Audit logs carrying before/after payloads', trend: 'up' },
      { label: 'Field Changes Logged', value: '94', change: 'Tracked through beforeData and afterData', trend: 'up' },
      { label: 'Records With Reasons', value: '18', change: 'Change reasons captured in audit entries', trend: 'neutral' },
      { label: 'Sensitive Updates', value: '9', change: 'High-review changes in finance records', trend: 'down' },
    ],
    tableTitle: 'Before / After Snapshot History',
    tableDescription: 'History of audit-log entries that preserve prior and resulting data for finance record changes.',
    columns: ['Performed At', 'Entity ID', 'Action', 'Before Data', 'After Data', 'Reason'],
    rows: [
      {
        id: 'snap-1',
        cells: [
          '2026-05-31 09:18',
          { text: 'BILL-2026-1184', emphasis: true },
          { text: 'updated', tone: 'blue' },
          'status=draft',
          'status=approved',
          'Vendor support validated',
        ],
      },
      {
        id: 'snap-2',
        cells: [
          '2026-05-31 08:56',
          { text: 'PM-2026-083', emphasis: true },
          { text: 'approved', tone: 'blue' },
          'applications=1',
          'applications=2',
          'Added second bill allocation',
        ],
      },
      {
        id: 'snap-3',
        cells: [
          '2026-05-30 04:40',
          { text: 'INV-2026-1433', emphasis: true },
          { text: 'voided', tone: 'red' },
          'balanceDue=314600',
          'status=voided',
          'Duplicate invoice correction',
        ],
      },
      {
        id: 'snap-4',
        cells: [
          '2026-05-30 03:52',
          { text: 'REC-2026-05-BDO', emphasis: true },
          { text: 'completed', tone: 'green' },
          'status=in_progress',
          'status=completed',
          'Difference cleared to zero',
        ],
      },
    ],
  },
];

export default function RecordHistoryPage() {
  return (
    <AuditHistoryPage
      eyebrow="Core / Audit & History"
      title="Record History"
      description="Inspect entity activity and before/after snapshots to understand how finance records changed over time."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Download History', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
