import { ApprovalsPage, type ApprovalTab } from '../_components/ApprovalsPage';

const tabs: ApprovalTab[] = [
  {
    id: 'transactions',
    label: 'Transactions',
    description:
      'Review approval coverage for transaction entities that route through invoices, bills, expenses, and journal entries.',
    searchPlaceholder: 'Search transaction entity type, collection, approval status behavior, or workflow coverage',
    filters: ['Transactions', 'Financial Entries', 'Posting Sensitive', 'Active Workflow'],
    actions: [
      { label: 'Refresh Coverage', icon: 'refresh', variant: 'secondary' },
      { label: 'Request Approval', icon: 'plus', variant: 'primary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Transaction Types', value: '4', change: 'Entity types supported by approval service', trend: 'neutral' },
      { label: 'Collections Linked', value: '4', change: 'Mapped collections resolved by entity type', trend: 'up' },
      { label: 'Status Mutations', value: '0', change: 'Approvals do not directly mutate these transaction records', trend: 'neutral' },
      { label: 'Requestable Types', value: '4', change: 'All transaction types can create approval requests', trend: 'up' },
    ],
    tableTitle: 'Transaction Approval Coverage',
    tableDescription:
      'Entity-type coverage aligned to the approval service mapping for transaction collections and request creation support.',
    columns: ['Entity Type', 'Mapped Collection', 'Request Support', 'Approve Outcome', 'Reject Outcome', 'Workflow Needed'],
    rows: [
      {
        id: 'txn-1',
        cells: [
          { text: 'invoice', emphasis: true },
          'invoices',
          { text: 'Yes', tone: 'green' },
          'No direct entity mutation',
          'No direct entity mutation',
          { text: 'Required', tone: 'amber' },
        ],
      },
      {
        id: 'txn-2',
        cells: [
          { text: 'bill', emphasis: true },
          'bills',
          { text: 'Yes', tone: 'green' },
          'No direct entity mutation',
          'No direct entity mutation',
          { text: 'Required', tone: 'amber' },
        ],
      },
      {
        id: 'txn-3',
        cells: [
          { text: 'expense', emphasis: true },
          'expenses',
          { text: 'Yes', tone: 'green' },
          'No direct entity mutation',
          'No direct entity mutation',
          { text: 'Required', tone: 'amber' },
        ],
      },
      {
        id: 'txn-4',
        cells: [
          { text: 'journal', emphasis: true },
          'journalEntries',
          { text: 'Yes', tone: 'green' },
          'No direct entity mutation',
          'No direct entity mutation',
          { text: 'Required', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    description:
      'Review approval coverage for operational entities where approval outcomes can update status or trigger operational workflow transitions.',
    searchPlaceholder: 'Search operational entity type, collection, approval outcome, or workflow coverage',
    filters: ['Operations', 'Status Change', 'Service Trigger', 'Active Workflow'],
    actions: [
      { label: 'Refresh Coverage', icon: 'refresh', variant: 'secondary' },
      { label: 'Open Workflow', variant: 'primary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Operational Types', value: '4', change: 'Entity types supported by operational approval flows', trend: 'neutral' },
      { label: 'Status Updates', value: '3', change: 'Entity types with direct status mutation on outcome', trend: 'up' },
      { label: 'Service Hooks', value: '1', change: 'Timesheet flow delegates outcome to time tracking service', trend: 'up' },
      { label: 'Payroll Review State', value: '1', change: 'Payroll runs move to review on request and stay review on reject', trend: 'neutral' },
    ],
    tableTitle: 'Operational Approval Coverage',
    tableDescription:
      'Operational entity mapping aligned to approval outcome behavior in the approval service, including status updates and time-tracking hooks.',
    columns: ['Entity Type', 'Mapped Collection', 'Request Behavior', 'Approve Outcome', 'Reject Outcome', 'Workflow Needed'],
    rows: [
      {
        id: 'ops-1',
        cells: [
          { text: 'budget', emphasis: true },
          'budgets',
          'Creates approval request',
          'Sets status to approved',
          'Returns status to draft',
          { text: 'Required', tone: 'amber' },
        ],
      },
      {
        id: 'ops-2',
        cells: [
          { text: 'asset_disposal', emphasis: true },
          'assetDisposals',
          'Creates approval request',
          'Sets status to approved',
          'Returns status to draft',
          { text: 'Required', tone: 'amber' },
        ],
      },
      {
        id: 'ops-3',
        cells: [
          { text: 'timesheet', emphasis: true },
          'timesheets',
          'Submitting request also submits timesheet',
          'Calls timesheet approve service',
          'Calls timesheet reject service',
          { text: 'Required', tone: 'amber' },
        ],
      },
      {
        id: 'ops-4',
        cells: [
          { text: 'payroll_run', emphasis: true },
          'payrollRuns',
          'Request sets payroll run to review',
          'Sets status to approved',
          'Keeps status at review',
          { text: 'Required', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function EntityApprovalCoveragePage() {
  return (
    <ApprovalsPage
      eyebrow="Operations / Approvals"
      title="Entity Approval Coverage"
      description="Review the exact entity types, collection mappings, and approval outcomes currently supported by the accounting approval service."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Request Approval', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
