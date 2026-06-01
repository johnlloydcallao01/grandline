import { ApprovalsPage, type ApprovalTab } from '../_components/ApprovalsPage';

const tabs: ApprovalTab[] = [
  {
    id: 'workflow-directory',
    label: 'Workflow Directory',
    description:
      'Review reusable approval workflow definitions by workflow code, name, entity type, active state, and step count.',
    searchPlaceholder: 'Search workflow code, workflow name, entity type, step count, or active state',
    filters: ['All Workflows', 'Active', 'Transactions', 'Operations'],
    actions: [
      { label: 'New Workflow', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Workflows', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Workflow Templates', value: '8', change: 'Configured approval workflows', trend: 'up' },
      { label: 'Active Workflows', value: '7', change: 'Templates currently enabled for request creation', trend: 'up' },
      { label: 'Transaction Coverage', value: '4', change: 'Entity types for invoice, bill, expense, and journal', trend: 'neutral' },
      { label: 'Operational Coverage', value: '4', change: 'Entity types for budget, asset, time, and payroll', trend: 'neutral' },
    ],
    tableTitle: 'Approval Workflow Directory',
    tableDescription:
      'Workflow register aligned to `approvalWorkflows`, showing workflow code, entity type, active state, and configured step count.',
    columns: ['Workflow Code', 'Name', 'Entity Type', 'Active', 'Step Count', 'Notes'],
    rows: [
      {
        id: 'workflow-1',
        cells: [
          { text: 'WF-INV-001', emphasis: true },
          'Invoice Revenue Review',
          'invoice',
          { text: 'Yes', tone: 'green' },
          { text: '2', align: 'right' },
          'Sales invoices above manager review threshold.',
        ],
      },
      {
        id: 'workflow-2',
        cells: [
          { text: 'WF-BILL-001', emphasis: true },
          'Bill Release Review',
          'bill',
          { text: 'Yes', tone: 'green' },
          { text: '2', align: 'right' },
          'Vendor bill approvals before posting.',
        ],
      },
      {
        id: 'workflow-3',
        cells: [
          { text: 'WF-TS-001', emphasis: true },
          'Timesheet Sign-Off',
          'timesheet',
          { text: 'Yes', tone: 'green' },
          { text: '1', align: 'right' },
          'Operational sign-off before service approval.',
        ],
      },
      {
        id: 'workflow-4',
        cells: [
          { text: 'WF-AD-001', emphasis: true },
          'Asset Disposal Review',
          'asset_disposal',
          { text: 'No', tone: 'gray' },
          { text: '2', align: 'right' },
          'Inactive while disposal policy revision is pending.',
        ],
      },
    ],
  },
  {
    id: 'workflow-steps',
    label: 'Workflow Steps',
    description:
      'Review per-step configuration using step number, step label, approver user, and approver role captured inside workflow step arrays.',
    searchPlaceholder: 'Search workflow code, entity type, step number, approver user, approver role, or label',
    filters: ['Step Register', 'With User', 'With Role', 'Multi-Step'],
    actions: [
      { label: 'Add Step', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Steps', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Configured Steps', value: '15', change: 'Workflow steps recorded across templates', trend: 'up' },
      { label: 'User-Assignee Steps', value: '11', change: 'Steps mapped to a specific approver user', trend: 'up' },
      { label: 'Role-Assignee Steps', value: '9', change: 'Steps carrying an approver role label', trend: 'neutral' },
      { label: 'Single-Step Flows', value: '3', change: 'Workflows resolved by one decision step', trend: 'neutral' },
    ],
    tableTitle: 'Workflow Step Register',
    tableDescription:
      'Step-level approval configuration aligned to the `steps` array in approval workflows, including assignee user and role fields.',
    columns: ['Workflow Code', 'Entity Type', 'Step', 'Label', 'Approver User', 'Approver Role'],
    rows: [
      {
        id: 'step-1',
        cells: [
          { text: 'WF-INV-001', emphasis: true },
          'invoice',
          { text: '1', align: 'right' },
          'Commercial Review',
          'finance.manager',
          'Accounting Manager',
        ],
      },
      {
        id: 'step-2',
        cells: [
          { text: 'WF-INV-001', emphasis: true },
          'invoice',
          { text: '2', align: 'right' },
          'Final Revenue Approval',
          'controller',
          'Controller',
        ],
      },
      {
        id: 'step-3',
        cells: [
          { text: 'WF-TS-001', emphasis: true },
          'timesheet',
          { text: '1', align: 'right' },
          'Operations Review',
          'ops.director',
          'Operations Director',
        ],
      },
      {
        id: 'step-4',
        cells: [
          { text: 'WF-PR-001', emphasis: true },
          'payroll_run',
          { text: '1', align: 'right' },
          'Payroll Finance Review',
          'hr.finance.lead',
          'HR Finance Lead',
        ],
      },
    ],
  },
  {
    id: 'active-workflows',
    label: 'Active Workflows',
    description:
      'Focus on enabled workflow records that can be discovered when a request is submitted without an explicit workflow id.',
    searchPlaceholder: 'Search active workflow code, entity type, first approver, or current step count',
    filters: ['Active Only', 'Transactions', 'Operations', 'Multi-Step'],
    actions: [
      { label: 'Refresh Active List', icon: 'refresh', variant: 'secondary' },
      { label: 'Open Workflow', variant: 'primary' },
    ],
    metrics: [
      { label: 'Eligible For Requests', value: '7', change: 'Active workflows discoverable by entity type', trend: 'up' },
      { label: 'Multi-Step Active', value: '4', change: 'Enabled workflows with more than one step', trend: 'up' },
      { label: 'First Approvers Set', value: '7', change: 'Active workflows carrying a first approver user', trend: 'up' },
      { label: 'Inactive Gaps', value: '1', change: 'Entity type currently missing active workflow coverage', trend: 'down' },
    ],
    tableTitle: 'Active Approval Coverage',
    tableDescription:
      'Active workflow coverage aligned to the workflow lookup behavior that finds the first active workflow for a requested entity type.',
    columns: ['Entity Type', 'Workflow Code', 'Workflow Name', 'First Approver', 'Step Count', 'Status'],
    rows: [
      {
        id: 'active-1',
        cells: [
          'invoice',
          { text: 'WF-INV-001', emphasis: true },
          'Invoice Revenue Review',
          'finance.manager',
          { text: '2', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'active-2',
        cells: [
          'expense',
          { text: 'WF-EXP-001', emphasis: true },
          'Expense Approval Flow',
          'controller',
          { text: '2', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'active-3',
        cells: [
          'timesheet',
          { text: 'WF-TS-001', emphasis: true },
          'Timesheet Sign-Off',
          'ops.director',
          { text: '1', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'active-4',
        cells: [
          'asset_disposal',
          { text: 'WF-AD-001', emphasis: true },
          'Asset Disposal Review',
          'controller',
          { text: '2', align: 'right' },
          { text: 'Inactive', tone: 'gray' },
        ],
      },
    ],
  },
];

export default function WorkflowManagementPage() {
  return (
    <ApprovalsPage
      eyebrow="Operations / Approvals"
      title="Workflow Management"
      description="Review approval workflow templates, step assignments, and active workflow coverage used by the accounting approval service."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Workflow', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
