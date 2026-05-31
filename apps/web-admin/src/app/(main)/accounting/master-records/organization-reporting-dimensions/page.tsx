import { MasterRecordsPage, type MasterRecordsTab } from '../_components/MasterRecordsPage';

const tabs: MasterRecordsTab[] = [
  {
    id: 'branches',
    label: 'Branches',
    description: 'Maintain branch master records with branch code, name, status, address, and audit fields.',
    searchPlaceholder: 'Search branch code, branch name, status, or address',
    filters: ['Active', 'Inactive', 'With Address', 'Recent'],
    actions: [
      { label: 'Create Branch', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Branches', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Branches', value: '7', change: 'Branches available in finance selectors', trend: 'up' },
      { label: 'Inactive Branches', value: '1', change: 'Retained for historical reporting', trend: 'down' },
      { label: 'With Address', value: '6', change: 'Branches carrying full address data', trend: 'neutral' },
      { label: 'Audited Changes', value: '14', change: 'Branch updates tracked by audited hooks', trend: 'up' },
    ],
    tableTitle: 'Branch Register',
    tableDescription: 'Branch master records using branch code, name, address, and status.',
    columns: ['Branch Code', 'Name', 'Address', 'Created By', 'Updated By', 'Status'],
    rows: [
      {
        id: 'branch-1',
        cells: [
          { text: 'BR-MNL', emphasis: true },
          'Manila Main',
          'Malate, Manila',
          'finance.admin',
          'finance.admin',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'branch-2',
        cells: [
          { text: 'BR-CEB', emphasis: true },
          'Cebu Branch',
          'Cebu City',
          'finance.admin',
          'ops.finance',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'branch-3',
        cells: [
          { text: 'BR-DVO', emphasis: true },
          'Davao Branch',
          'Davao City',
          'finance.admin',
          'ops.finance',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'departments',
    label: 'Departments',
    description: 'Maintain department records with department code, name, optional branch link, status, and notes.',
    searchPlaceholder: 'Search department code, name, branch, status, or notes',
    filters: ['Active', 'By Branch', 'Without Branch', 'Inactive'],
    actions: [
      { label: 'Create Department', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Departments', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Departments', value: '14', change: 'Departments available for segmentation', trend: 'up' },
      { label: 'Branch Linked', value: '11', change: 'Departments tied to a branch', trend: 'up' },
      { label: 'Inactive Departments', value: '2', change: 'Retained for historical analysis', trend: 'down' },
      { label: 'Audited Changes', value: '22', change: 'Department updates captured by audit hooks', trend: 'up' },
    ],
    tableTitle: 'Department Register',
    tableDescription: 'Department master records using code, name, branch relationship, and status.',
    columns: ['Department Code', 'Name', 'Branch', 'Created By', 'Updated By', 'Status'],
    rows: [
      {
        id: 'dept-1',
        cells: [
          { text: 'DEP-FIN', emphasis: true },
          'Finance',
          'BR-MNL',
          'finance.admin',
          'gl.manager',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'dept-2',
        cells: [
          { text: 'DEP-OPS', emphasis: true },
          'Operations',
          'BR-CEB',
          'finance.admin',
          'ops.finance',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'dept-3',
        cells: [
          { text: 'DEP-ADM', emphasis: true },
          'Administration',
          'BR-MNL',
          'finance.admin',
          'ops.finance',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'locations',
    label: 'Locations',
    description: 'Maintain location records with location code, name, optional branch link, status, and notes.',
    searchPlaceholder: 'Search location code, name, branch, status, or notes',
    filters: ['Active', 'By Branch', 'Without Branch', 'Inactive'],
    actions: [
      { label: 'Create Location', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Locations', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Locations', value: '16', change: 'Locations available for assets and reporting', trend: 'up' },
      { label: 'Branch Linked', value: '12', change: 'Locations tied to a branch record', trend: 'up' },
      { label: 'Inactive Locations', value: '3', change: 'Retained for historical reporting', trend: 'down' },
      { label: 'Audited Changes', value: '19', change: 'Location updates captured by audit hooks', trend: 'up' },
    ],
    tableTitle: 'Location Register',
    tableDescription: 'Location master records using code, name, branch relationship, and status.',
    columns: ['Location Code', 'Name', 'Branch', 'Created By', 'Updated By', 'Status'],
    rows: [
      {
        id: 'loc-1',
        cells: [
          { text: 'LOC-MNL-01', emphasis: true },
          'Manila Training Center',
          'BR-MNL',
          'finance.admin',
          'asset.admin',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'loc-2',
        cells: [
          { text: 'LOC-CEB-01', emphasis: true },
          'Cebu Assessment Hub',
          'BR-CEB',
          'finance.admin',
          'ops.finance',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'loc-3',
        cells: [
          { text: 'LOC-DVO-01', emphasis: true },
          'Davao Satellite Office',
          'BR-DVO',
          'finance.admin',
          'ops.finance',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function OrganizationReportingDimensionsPage() {
  return (
    <MasterRecordsPage
      eyebrow="Core / Master Records"
      title="Organization & Reporting Dimensions"
      description="Maintain branches, departments, and locations used to segment records and drive accounting reporting filters."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Dimension', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
