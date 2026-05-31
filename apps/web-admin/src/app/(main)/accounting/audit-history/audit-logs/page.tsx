import { AuditHistoryPage, type AuditHistoryTab } from '../_components/AuditHistoryPage';

const tabs: AuditHistoryTab[] = [
  {
    id: 'finance-audit-log',
    label: 'Finance Audit Log',
    description: 'Review finance audit events captured with entity type, entity id, action type, performer, timestamps, and audit payloads.',
    searchPlaceholder: 'Search entity type, entity id, action, user, or reason',
    filters: ['Posted', 'Voided', 'Approved', 'Rejected'],
    actions: [
      { label: 'Refresh Audit Log', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Audit Events Today', value: '84', change: 'Finance actions logged across accounting entities', trend: 'up' },
      { label: 'Posting Actions', value: '29', change: 'Posted and completed finance actions', trend: 'up' },
      { label: 'Void / Reverse Actions', value: '6', change: 'Sensitive history requiring review visibility', trend: 'down' },
      { label: 'Actors Logged', value: '11', change: 'Users represented in audit history today', trend: 'neutral' },
    ],
    tableTitle: 'Finance Audit Trail',
    tableDescription: 'Dedicated audit-log entries with entity references, finance action types, performers, and timestamps.',
    columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Reason'],
    rows: [
      {
        id: 'audit-1',
        cells: [
          '2026-05-31 09:42',
          'invoice',
          { text: 'INV-2026-1452', emphasis: true },
          { text: 'posted', tone: 'green' },
          'finance.lead',
          'Initial invoice posting',
        ],
      },
      {
        id: 'audit-2',
        cells: [
          '2026-05-31 09:18',
          'payment_received',
          { text: 'RCT-2026-1184', emphasis: true },
          { text: 'approved', tone: 'blue' },
          'cashier.supervisor',
          'Receipt approved before posting',
        ],
      },
      {
        id: 'audit-3',
        cells: [
          '2026-05-31 08:56',
          'bill',
          { text: 'BILL-2026-1184', emphasis: true },
          { text: 'rejected', tone: 'amber' },
          'ap.manager',
          'Returned for vendor support correction',
        ],
      },
      {
        id: 'audit-4',
        cells: [
          '2026-05-30 05:44',
          'receipt',
          { text: 'OR-2026-081', emphasis: true },
          { text: 'voided', tone: 'red' },
          'finance.controller',
          'Receipt voided after duplicate issuance',
        ],
      },
    ],
  },
  {
    id: 'export-activity',
    label: 'Export Activity',
    description: 'Review export actions captured in the finance audit log for report generation and outbound accounting extracts.',
    searchPlaceholder: 'Search exported action, entity type, user, report, or metadata',
    filters: ['Exported', 'Reports', 'Registers', 'Recent'],
    actions: [
      { label: 'Refresh Exports', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Exports Today', value: '12', change: 'Audit events marked as exported', trend: 'up' },
      { label: 'Register Exports', value: '7', change: 'Invoice, bill, and payment register downloads', trend: 'up' },
      { label: 'Report Exports', value: '5', change: 'Aging, dashboard, and tax summary pulls', trend: 'neutral' },
      { label: 'Export Actors', value: '4', change: 'Users initiating outbound data actions', trend: 'neutral' },
    ],
    tableTitle: 'Export Audit Events',
    tableDescription: 'Audit-log entries for exported actions so outbound accounting data access remains visible.',
    columns: ['Performed At', 'Entity Type', 'Entity ID', 'Action', 'Performed By', 'Metadata'],
    rows: [
      {
        id: 'export-1',
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
        id: 'export-2',
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
        id: 'export-3',
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
        id: 'export-4',
        cells: [
          '2026-05-30 03:11',
          'payment_received',
          { text: 'payments-received-register', emphasis: true },
          { text: 'exported', tone: 'blue' },
          'cashier.supervisor',
          'Collections register export',
        ],
      },
    ],
  },
];

export default function AuditLogsPage() {
  return (
    <AuditHistoryPage
      eyebrow="Core / Audit & History"
      title="Audit Logs"
      description="Review finance audit events and export activity for traceability, control evidence, and outbound data visibility."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Download Audit View', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
