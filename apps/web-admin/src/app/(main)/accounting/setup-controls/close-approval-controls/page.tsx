import { SetupControlsPage, type SetupControlsTab } from '../_components/SetupControlsPage';

const tabs: SetupControlsTab[] = [
  {
    id: 'lock-close-state',
    label: 'Lock & Close State',
    description: 'Review lock dates and close status from fiscal-year and accounting-period records currently protecting the ledger.',
    searchPlaceholder: 'Search fiscal year, period label, lock date, closed by, or status',
    filters: ['Closed', 'Open', 'Draft', 'Locked'],
    actions: [
      { label: 'Open Control Record', icon: 'plus', variant: 'primary' },
      { label: 'Refresh States', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Closed Periods', value: '14', change: 'Periods no longer open for normal posting', trend: 'up' },
      { label: 'Open Periods', value: '2', change: 'Periods available for current posting', trend: 'neutral' },
      { label: 'Closed Fiscal Years', value: '1', change: 'Year-level close already recorded', trend: 'neutral' },
      { label: 'Locked Dates Set', value: '9', change: 'Combined fiscal-year and period lock dates', trend: 'up' },
    ],
    tableTitle: 'Lock And Close Control Register',
    tableDescription: 'Close-control records using fiscal years and accounting periods with lock-date and close-state fields.',
    columns: ['Control', 'Range', 'Locked From', 'Closed At', 'Closed By', 'Status'],
    rows: [
      {
        id: 'close-1',
        cells: [
          { text: 'FY2025', emphasis: true },
          '2025-01-01 to 2025-12-31',
          '2025-12-31',
          '2026-01-03 18:20',
          'finance.controller',
          { text: 'Closed', tone: 'green' },
        ],
      },
      {
        id: 'close-2',
        cells: [
          { text: '2026 P04', emphasis: true },
          '2026-04-01 to 2026-04-30',
          '2026-04-30',
          '2026-05-03 09:12',
          'gl.manager',
          { text: 'Closed', tone: 'green' },
        ],
      },
      {
        id: 'close-3',
        cells: [
          { text: '2026 P05', emphasis: true },
          '2026-05-01 to 2026-05-31',
          '2026-05-25',
          '-',
          '-',
          { text: 'Open', tone: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'approval-workflows',
    label: 'Approval Workflows',
    description: 'Review reusable approval workflow templates using workflow code, entity type, active status, and configured steps.',
    searchPlaceholder: 'Search workflow code, name, entity type, step label, or active state',
    filters: ['Active', 'Expense', 'Journal Entry', 'Period Close'],
    actions: [
      { label: 'Create Workflow', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Workflows', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Workflow Templates', value: '8', change: 'Approval templates available in settings', trend: 'up' },
      { label: 'Active Workflows', value: '6', change: 'Templates currently enabled', trend: 'up' },
      { label: 'Configured Steps', value: '21', change: 'Workflow steps carrying assignees', trend: 'up' },
      { label: 'Entity Types Covered', value: '5', change: 'Finance workflow entity types configured', trend: 'neutral' },
    ],
    tableTitle: 'Approval Workflow Templates',
    tableDescription: 'Workflow templates showing workflow code, entity type, active state, and step count.',
    columns: ['Workflow Code', 'Name', 'Entity Type', 'Active', 'Step Count', 'Created By'],
    rows: [
      {
        id: 'wf-1',
        cells: [
          { text: 'WF-EXP-001', emphasis: true },
          'Expense Approval Flow',
          'expense',
          { text: 'Yes', tone: 'green' },
          '2',
          'finance.admin',
        ],
      },
      {
        id: 'wf-2',
        cells: [
          { text: 'WF-JE-001', emphasis: true },
          'Journal Entry Review',
          'journal_entry',
          { text: 'Yes', tone: 'green' },
          '2',
          'finance.admin',
        ],
      },
      {
        id: 'wf-3',
        cells: [
          { text: 'WF-PERIOD-001', emphasis: true },
          'Period Close Approval',
          'period_close',
          { text: 'Yes', tone: 'green' },
          '3',
          'controller',
        ],
      },
      {
        id: 'wf-4',
        cells: [
          { text: 'WF-REOPEN-001', emphasis: true },
          'Reopen Review',
          'reopen_request',
          { text: 'No', tone: 'amber' },
          '2',
          'controller',
        ],
      },
    ],
  },
  {
    id: 'approval-requests',
    label: 'Approval Requests',
    description: 'Review live approval-request records using workflow, entity type, entity id, status, requester, and current approver.',
    searchPlaceholder: 'Search entity type, entity id, workflow, requester, approver, or status',
    filters: ['Pending', 'Approved', 'Rejected', 'Journal Entry'],
    actions: [
      { label: 'Open Request', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Requests', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Pending Requests', value: '6', change: 'Approval items waiting for action', trend: 'neutral' },
      { label: 'Approved Requests', value: '14', change: 'Requests already resolved positively', trend: 'up' },
      { label: 'Rejected Requests', value: '3', change: 'Requests returned or declined', trend: 'down' },
      { label: 'With Current Approver', value: '6', change: 'Pending requests assigned to an approver', trend: 'neutral' },
    ],
    tableTitle: 'Approval Request Queue',
    tableDescription: 'Approval-request records showing workflow, entity, requester, approver, and current status.',
    columns: ['Workflow', 'Entity Type', 'Entity ID', 'Requested By', 'Current Approver', 'Status'],
    rows: [
      {
        id: 'req-1',
        cells: [
          { text: 'WF-JE-001', emphasis: true },
          'journal_entry',
          'JE-2026-0908',
          'finance.admin',
          'controller',
          { text: 'Pending', tone: 'amber' },
        ],
      },
      {
        id: 'req-2',
        cells: [
          { text: 'WF-EXP-001', emphasis: true },
          'expense',
          'EXP-2026-1181',
          'ap.processor',
          'finance.admin',
          { text: 'Pending', tone: 'amber' },
        ],
      },
      {
        id: 'req-3',
        cells: [
          { text: 'WF-PERIOD-001', emphasis: true },
          'period_close',
          '2026-P05',
          'gl.manager',
          'controller',
          { text: 'Approved', tone: 'green' },
        ],
      },
      {
        id: 'req-4',
        cells: [
          { text: 'WF-REOPEN-001', emphasis: true },
          'reopen_request',
          '2026-P04',
          'gl.manager',
          'controller',
          { text: 'Rejected', tone: 'red' },
        ],
      },
    ],
  },
];

export default function CloseApprovalControlsPage() {
  return (
    <SetupControlsPage
      eyebrow="Core / Setup & Controls"
      title="Close & Approval Controls"
      description="Review the real close and approval control records available today: fiscal-year and period close state, workflow templates, and approval requests."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Control Record', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
