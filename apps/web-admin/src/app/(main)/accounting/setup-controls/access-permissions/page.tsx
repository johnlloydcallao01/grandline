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
];

export default function AccessPermissionsPage() {
  return (
    <SetupControlsPage
      eyebrow="Core / Setup & Controls"
      title="Access & Permissions"
      description="Review the real access-related records available today in apps/cms: user roles and user accounts. Workflow assignee operations now live in the dedicated Approvals area."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Access Record', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
