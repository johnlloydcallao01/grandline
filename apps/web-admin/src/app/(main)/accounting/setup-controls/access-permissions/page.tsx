import { SetupControlsPage, type SetupControlsTab } from '../_components/SetupControlsPage';

const tabs: SetupControlsTab[] = [
  {
    id: 'user-roles',
    label: 'User Roles',
    description: 'Review the real user-role model available in apps/cms for access control and account management.',
    searchPlaceholder: 'Search role, user email, active status, or login activity',
    filters: ['Admin', 'Instructor', 'Trainee', 'Service'],
    actions: [
      { label: 'Create User', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Roles', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Admin Users', value: '7', change: 'Users with top-level admin access', trend: 'neutral' },
      { label: 'Instructor Users', value: '54', change: 'Operational users under instructor role', trend: 'up' },
      { label: 'Trainee Users', value: '684', change: 'Learner accounts in the user collection', trend: 'up' },
      { label: 'Service Accounts', value: '3', change: 'API-key capable service users', trend: 'neutral' },
    ],
    tableTitle: 'Role Access Register',
    tableDescription: 'User-role records based on the actual `users.role` values available in apps/cms.',
    columns: ['Email', 'Name', 'Role', 'Active', 'Last Login', 'API Key'],
    rows: [
      {
        id: 'role-1',
        cells: [
          { text: 'finance.admin@grandline.com', emphasis: true },
          'Lea Garcia',
          { text: 'admin', tone: 'blue' },
          { text: 'Yes', tone: 'green' },
          '2026-05-31 09:44',
          'Enabled',
        ],
      },
      {
        id: 'role-2',
        cells: [
          { text: 'ops.instructor@grandline.com', emphasis: true },
          'Paolo Cruz',
          { text: 'instructor', tone: 'green' },
          { text: 'Yes', tone: 'green' },
          '2026-05-31 07:12',
          'Disabled',
        ],
      },
      {
        id: 'role-3',
        cells: [
          { text: 'integration.bot@grandline.com', emphasis: true },
          'Finance Integration',
          { text: 'service', tone: 'amber' },
          { text: 'Yes', tone: 'green' },
          '2026-05-31 03:51',
          'Enabled',
        ],
      },
      {
        id: 'role-4',
        cells: [
          { text: 'trainee.one@grandline.com', emphasis: true },
          'Juan Santos',
          { text: 'trainee', tone: 'gray' },
          { text: 'No', tone: 'red' },
          '2026-05-20 18:02',
          'Disabled',
        ],
      },
    ],
  },
  {
    id: 'user-directory',
    label: 'User Directory',
    description: 'Review user account status, contact data, and recent activity fields that currently exist in the user collection.',
    searchPlaceholder: 'Search email, first name, last name, phone, or active status',
    filters: ['Active', 'Inactive', 'With Phone', 'Security Alerts On'],
    actions: [
      { label: 'Open User', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Users', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Users', value: '728', change: 'User accounts allowed to sign in', trend: 'up' },
      { label: 'Inactive Users', value: '20', change: 'Accounts blocked from sign-in', trend: 'down' },
      { label: 'Security Alerts On', value: '703', change: 'Users receiving password-change alerts', trend: 'up' },
      { label: 'Logged In Today', value: '116', change: 'Users with updated last-login values', trend: 'neutral' },
    ],
    tableTitle: 'User Directory',
    tableDescription: 'User records using contact fields, active state, security-alert preference, and last-login data.',
    columns: ['Email', 'Name', 'Phone', 'Security Alerts', 'Last Login', 'Status'],
    rows: [
      {
        id: 'user-1',
        cells: [
          { text: 'finance.admin@grandline.com', emphasis: true },
          'Lea Garcia',
          '+63 917 555 0142',
          'Enabled',
          '2026-05-31 09:44',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'user-2',
        cells: [
          { text: 'controller@grandline.com', emphasis: true },
          'Marco Dela Cruz',
          '+63 917 555 0181',
          'Enabled',
          '2026-05-31 08:15',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'user-3',
        cells: [
          { text: 'ops.instructor@grandline.com', emphasis: true },
          'Paolo Cruz',
          '+63 917 555 0221',
          'Enabled',
          '2026-05-31 07:12',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'user-4',
        cells: [
          { text: 'trainee.one@grandline.com', emphasis: true },
          'Juan Santos',
          '-',
          'Disabled',
          '2026-05-20 18:02',
          { text: 'Inactive', tone: 'red' },
        ],
      },
    ],
  },
  {
    id: 'approval-assignees',
    label: 'Approval Assignees',
    description: 'Review approver users and approver-role text configured inside approval workflow steps.',
    searchPlaceholder: 'Search workflow code, entity type, approver user, approver role, or active state',
    filters: ['Active Workflows', 'With Approver User', 'With Approver Role', 'Expense'],
    actions: [
      { label: 'Create Workflow', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Assignees', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Workflows', value: '8', change: 'Approval workflows currently enabled', trend: 'up' },
      { label: 'Configured Steps', value: '21', change: 'Workflow steps carrying assignee info', trend: 'up' },
      { label: 'Approver Users Set', value: '12', change: 'Steps mapped to a specific user', trend: 'neutral' },
      { label: 'Approver Roles Set', value: '9', change: 'Steps mapped to an approver-role text', trend: 'neutral' },
    ],
    tableTitle: 'Approval Assignee Register',
    tableDescription: 'Workflow-step assignees using workflow code, entity type, step number, approver user, and approver role.',
    columns: ['Workflow Code', 'Entity Type', 'Step', 'Label', 'Approver User', 'Approver Role'],
    rows: [
      {
        id: 'assignee-1',
        cells: [
          { text: 'WF-EXP-001', emphasis: true },
          'expense',
          '1',
          'Finance Review',
          'finance.admin@grandline.com',
          'Finance Admin',
        ],
      },
      {
        id: 'assignee-2',
        cells: [
          { text: 'WF-JE-001', emphasis: true },
          'journal_entry',
          '2',
          'Controller Approval',
          'controller@grandline.com',
          'Controller',
        ],
      },
      {
        id: 'assignee-3',
        cells: [
          { text: 'WF-PERIOD-001', emphasis: true },
          'period_close',
          '1',
          'Close Owner Review',
          '-',
          'Finance Lead',
        ],
      },
    ],
  },
];

export default function AccessPermissionsPage() {
  return (
    <SetupControlsPage
      eyebrow="Core / Setup & Controls"
      title="Access & Permissions"
      description="Review the real access-related records available today in apps/cms: user roles, user accounts, and approval assignee configuration."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Access Record', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
