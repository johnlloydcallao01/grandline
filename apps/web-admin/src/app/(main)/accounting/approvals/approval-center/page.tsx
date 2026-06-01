import { ApprovalsPage, type ApprovalTab } from '../_components/ApprovalsPage';

const tabs: ApprovalTab[] = [
  {
    id: 'approval-queue',
    label: 'Approval Queue',
    description:
      'Review pending approval items returned by the approval queue flow, including workflow, entity type, requester, current approver, and requested timestamp.',
    searchPlaceholder: 'Search workflow, entity type, entity id, requester, approver, or queue status',
    filters: ['Pending Queue', 'Assigned', 'Transactions', 'Operations'],
    actions: [
      { label: 'Refresh Queue', icon: 'refresh', variant: 'secondary' },
      { label: 'Approve Request', variant: 'primary' },
      { label: 'Reject Request', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Pending Queue', value: '12', change: 'Requests currently returned by queue review', trend: 'neutral' },
      { label: 'Assigned To Approvers', value: '12', change: 'Pending items with a current approver', trend: 'up' },
      { label: 'Transaction Items', value: '7', change: 'Invoice, bill, expense, and journal requests', trend: 'up' },
      { label: 'Operational Items', value: '5', change: 'Budget, asset, timesheet, and payroll requests', trend: 'neutral' },
    ],
    tableTitle: 'Pending Approval Queue',
    tableDescription:
      'Queue view aligned to the approval-request collection and the approval queue endpoint that filters pending items by current approver.',
    columns: ['Requested At', 'Workflow', 'Entity Type', 'Entity ID', 'Current Approver', 'Status'],
    rows: [
      {
        id: 'queue-1',
        cells: [
          '2026-06-01 09:15',
          { text: 'WF-INV-001', emphasis: true },
          'invoice',
          { text: 'INV-2026-0418', emphasis: true },
          'finance.manager',
          { text: 'Pending', tone: 'amber' },
        ],
      },
      {
        id: 'queue-2',
        cells: [
          '2026-06-01 08:42',
          { text: 'WF-EXP-001', emphasis: true },
          'expense',
          { text: 'EXP-2026-0194', emphasis: true },
          'controller',
          { text: 'Pending', tone: 'amber' },
        ],
      },
      {
        id: 'queue-3',
        cells: [
          '2026-05-31 16:28',
          { text: 'WF-TS-001', emphasis: true },
          'timesheet',
          { text: 'TS-2026-0227', emphasis: true },
          'ops.director',
          { text: 'Pending', tone: 'amber' },
        ],
      },
      {
        id: 'queue-4',
        cells: [
          '2026-05-31 15:03',
          { text: 'WF-PR-001', emphasis: true },
          'payroll_run',
          { text: 'PR-2026-05B', emphasis: true },
          'hr.finance.lead',
          { text: 'Pending', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'approval-requests',
    label: 'Approval Requests',
    description:
      'Review approval-request records across pending, approved, and rejected states using workflow, entity type, requester, approver, and resolution fields.',
    searchPlaceholder: 'Search entity type, entity id, workflow, requested by, current approver, or status',
    filters: ['All Requests', 'Pending', 'Approved', 'Rejected'],
    actions: [
      { label: 'Request Approval', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Requests', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Open Requests', value: '12', change: 'Requests still awaiting resolution', trend: 'neutral' },
      { label: 'Approved', value: '28', change: 'Resolved approval requests with approval outcome', trend: 'up' },
      { label: 'Rejected', value: '6', change: 'Requests declined or returned', trend: 'down' },
      { label: 'Workflow Linked', value: '46', change: 'Requests carrying an approval workflow relation', trend: 'up' },
    ],
    tableTitle: 'Approval Request Register',
    tableDescription:
      'Approval-request register aligned to `approvalRequests`, including workflow relationship, request state, requester, and current approver.',
    columns: ['Workflow', 'Entity Type', 'Entity ID', 'Requested By', 'Current Approver', 'Status'],
    rows: [
      {
        id: 'request-1',
        cells: [
          { text: 'Invoice Revenue Review', emphasis: true },
          'invoice',
          'INV-2026-0418',
          'ar.processor',
          'finance.manager',
          { text: 'Pending', tone: 'amber' },
        ],
      },
      {
        id: 'request-2',
        cells: [
          { text: 'Expense Approval Flow', emphasis: true },
          'expense',
          'EXP-2026-0194',
          'expense.ops',
          'controller',
          { text: 'Pending', tone: 'amber' },
        ],
      },
      {
        id: 'request-3',
        cells: [
          { text: 'Budget Revision Workflow', emphasis: true },
          'budget',
          'BUD-2026-Q3-02',
          'budget.owner',
          'finance.director',
          { text: 'Approved', tone: 'green' },
        ],
      },
      {
        id: 'request-4',
        cells: [
          { text: 'Asset Disposal Review', emphasis: true },
          'asset_disposal',
          'AD-2026-0007',
          'asset.custodian',
          'controller',
          { text: 'Rejected', tone: 'red' },
        ],
      },
    ],
  },
  {
    id: 'resolution-trail',
    label: 'Resolution Trail',
    description:
      'Trace approval-trail decisions by step number, approver, decision, notes, and action timestamp captured inside each approval request.',
    searchPlaceholder: 'Search request id, step number, approver, decision, notes, or acted date',
    filters: ['Latest Trail', 'Approved Steps', 'Rejected Steps', 'With Notes'],
    actions: [
      { label: 'Refresh Trail', icon: 'refresh', variant: 'secondary' },
      { label: 'Download Trail', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Trail Entries', value: '94', change: 'Recorded workflow decisions across requests', trend: 'up' },
      { label: 'Approved Steps', value: '76', change: 'Trail rows with approved decisions', trend: 'up' },
      { label: 'Rejected Steps', value: '8', change: 'Trail rows with rejected decisions', trend: 'down' },
      { label: 'Notes Captured', value: '41', change: 'Decision rows carrying written notes', trend: 'neutral' },
    ],
    tableTitle: 'Approval Resolution Trail',
    tableDescription:
      'Decision-level history aligned to the `approvalTrail` array stored on approval requests, including step numbers, notes, and acted timestamps.',
    columns: ['Request ID', 'Step', 'Approver', 'Decision', 'Acted At', 'Notes'],
    rows: [
      {
        id: 'trail-1',
        cells: [
          { text: 'APR-0046', emphasis: true },
          { text: '1', align: 'right' },
          'finance.manager',
          { text: 'approved', tone: 'green' },
          '2026-06-01 09:22',
          'Validated invoice and customer credit terms.',
        ],
      },
      {
        id: 'trail-2',
        cells: [
          { text: 'APR-0044', emphasis: true },
          { text: '2', align: 'right' },
          'controller',
          { text: 'approved', tone: 'green' },
          '2026-05-31 17:04',
          'Expense coding and receipt attachment confirmed.',
        ],
      },
      {
        id: 'trail-3',
        cells: [
          { text: 'APR-0041', emphasis: true },
          { text: '1', align: 'right' },
          'finance.director',
          { text: 'rejected', tone: 'red' },
          '2026-05-31 11:38',
          'Budget revision exceeds approved quarterly cap.',
        ],
      },
      {
        id: 'trail-4',
        cells: [
          { text: 'APR-0038', emphasis: true },
          { text: '1', align: 'right' },
          'ops.director',
          { text: 'approved', tone: 'green' },
          '2026-05-30 18:11',
          'Timesheet hours verified against submitted logs.',
        ],
      },
    ],
  },
];

export default function ApprovalCenterPage() {
  return (
    <ApprovalsPage
      eyebrow="Operations / Approvals"
      title="Approval Center"
      description="Review the live approval queue, request register, and resolution trail supported by the accounting approval service and approval-request records."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Request Approval', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
