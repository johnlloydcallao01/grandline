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
    id: 'approval-readiness',
    label: 'Approval Readiness',
    description:
      'Review approval-control readiness using active workflow coverage, first approver assignment, and entity-type support before users work the live approval queue.',
    searchPlaceholder: 'Search entity type, workflow code, readiness state, first approver, or control gap',
    filters: ['Ready', 'Needs Workflow', 'Transactions', 'Operations'],
    actions: [
      { label: 'Open Control', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Readiness', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Supported Types', value: '8', change: 'Entity types recognized by approval constants and service mapping', trend: 'neutral' },
      { label: 'Ready Controls', value: '7', change: 'Types with an active workflow and first approver path', trend: 'up' },
      { label: 'Control Gaps', value: '1', change: 'Supported type currently missing active workflow readiness', trend: 'down' },
      { label: 'First Approvers Set', value: '7', change: 'Active control paths with a current first approver', trend: 'up' },
    ],
    tableTitle: 'Approval Control Readiness Register',
    tableDescription:
      'Control-oriented approval readiness aligned to active workflow lookup and first-approver assignment, without duplicating the operational approval workspace.',
    columns: ['Entity Type', 'Workflow Code', 'Active Workflow', 'First Approver', 'Step Count', 'Control State'],
    rows: [
      {
        id: 'readiness-1',
        cells: [
          'expense',
          { text: 'WF-EXP-001', emphasis: true },
          { text: 'Yes', tone: 'green' },
          'controller',
          { text: '2', align: 'right' },
          { text: 'Ready', tone: 'green' },
        ],
      },
      {
        id: 'readiness-2',
        cells: [
          'journal',
          { text: 'WF-JRNL-001', emphasis: true },
          { text: 'Yes', tone: 'green' },
          'finance.manager',
          { text: '2', align: 'right' },
          { text: 'Ready', tone: 'green' },
        ],
      },
      {
        id: 'readiness-3',
        cells: [
          'payroll_run',
          { text: 'WF-PR-001', emphasis: true },
          { text: 'Yes', tone: 'green' },
          'hr.finance.lead',
          { text: '1', align: 'right' },
          { text: 'Ready', tone: 'green' },
        ],
      },
      {
        id: 'readiness-4',
        cells: [
          'asset_disposal',
          '-',
          { text: 'No', tone: 'gray' },
          '-',
          { text: '0', align: 'right' },
          { text: 'Needs Workflow', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'reopen-safeguards',
    label: 'Reopen Safeguards',
    description:
      'Review reopen and posting-protection safeguards using fiscal-year and period state, lock dates, and downstream operations that require approved records before proceeding.',
    searchPlaceholder: 'Search control area, reopen rule, lock condition, approval requirement, or protected action',
    filters: ['Reopen Rules', 'Posting Guards', 'Closed State', 'Approval Required'],
    actions: [
      { label: 'Open Safeguard', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Safeguards', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Reopen Rules', value: '4', change: 'Close-service safeguards protecting period and fiscal-year reopen behavior', trend: 'neutral' },
      { label: 'Posting Guards', value: '3', change: 'Lock-date and soft-lock checks enforced before posting', trend: 'up' },
      { label: 'Approval Gates', value: '2', change: 'Operations that require approved workflow outcome before execution', trend: 'up' },
      { label: 'Close-State Dependencies', value: '2', change: 'Reopen flows tied to fiscal-year and period open state', trend: 'neutral' },
    ],
    tableTitle: 'Close And Approval Safeguards',
    tableDescription:
      'Control register aligned to close services, posting-window enforcement, and approval gates used by protected downstream accounting operations.',
    columns: ['Control Area', 'Protected Action', 'Condition', 'Behavior', 'Source', 'State'],
    rows: [
      {
        id: 'guard-1',
        cells: [
          { text: 'Accounting Period', emphasis: true },
          'Reopen Period',
          'Fiscal year must still be open',
          'Rejects reopen when fiscal year is not open',
          'AccountingCloseService',
          { text: 'Enforced', tone: 'green' },
        ],
      },
      {
        id: 'guard-2',
        cells: [
          { text: 'Accounting Period', emphasis: true },
          'Post Transaction',
          'Posting date falls inside locked period window',
          'Blocks posting inside locked period range',
          'AccountingPeriodService',
          { text: 'Enforced', tone: 'green' },
        ],
      },
      {
        id: 'guard-3',
        cells: [
          { text: 'Fiscal Year', emphasis: true },
          'Post Transaction',
          'Posting date falls inside locked fiscal-year window',
          'Blocks posting and respects hard-lock mode',
          'AccountingPeriodService',
          { text: 'Enforced', tone: 'green' },
        ],
      },
      {
        id: 'guard-4',
        cells: [
          { text: 'Approval Gate', emphasis: true },
          'Post Payroll Run',
          'Approved approval-request record must exist',
          'Prevents payroll posting until workflow is approved',
          'AccountingApprovalService + PayrollService',
          { text: 'Enforced', tone: 'green' },
        ],
      },
      {
        id: 'guard-5',
        cells: [
          { text: 'Approval Gate', emphasis: true },
          'Dispose Asset',
          'Approved approval-request record must exist',
          'Prevents disposal processing until workflow is approved',
          'AccountingApprovalService + DepreciationService',
          { text: 'Enforced', tone: 'green' },
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
      description="Review the real close and approval control records available today: fiscal-year and period close state, approval readiness, and reopen or posting safeguards."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Control Record', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
