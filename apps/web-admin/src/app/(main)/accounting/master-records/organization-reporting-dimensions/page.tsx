import { getBranchesRegister, getDepartmentsRegister, getLocationsRegister } from './actions';
import { OrganizationReportingDimensionsClient, type StaticOrgDimensionTab } from './OrganizationReportingDimensionsClient';

const staticTabs: StaticOrgDimensionTab[] = [
  {
    id: 'branches',
    label: 'Branches',
    description: 'Maintain branch master records with branch code, name, status, address, and audit fields.',
    searchPlaceholder: 'Search branch code, branch name, status, or address',
    filters: ['Active', 'Inactive', 'With Address'],
    actions: [
      { label: 'Create Branch', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Branches', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Branches', value: '0', change: 'Branches available in finance selectors', trend: 'up' },
      { label: 'Inactive Branches', value: '0', change: 'Retained for historical reporting', trend: 'down' },
      { label: 'With Address', value: '0', change: 'Branches carrying full address data', trend: 'neutral' },
      { label: 'Total Branches', value: '0', change: 'Branch master records on file', trend: 'neutral' },
    ],
    tableTitle: 'Branch Register',
    tableDescription: 'Branch master records using branch code, name, address, and status.',
    columns: ['Branch Code', 'Name', 'Address', 'Created By', 'Updated By', 'Status'],
    rows: [],
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
      { label: 'Active Departments', value: '0', change: 'Departments available for segmentation', trend: 'up' },
      { label: 'Branch Linked', value: '0', change: 'Departments tied to a branch', trend: 'up' },
      { label: 'Inactive Departments', value: '0', change: 'Retained for historical analysis', trend: 'down' },
      { label: 'Total Departments', value: '0', change: 'Department records on file', trend: 'neutral' },
    ],
    tableTitle: 'Department Register',
    tableDescription: 'Department master records using code, name, branch relationship, and status.',
    columns: ['Department Code', 'Name', 'Branch', 'Created By', 'Updated By', 'Status'],
    rows: [],
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
      { label: 'Active Locations', value: '0', change: 'Locations available for assets and reporting', trend: 'up' },
      { label: 'Branch Linked', value: '0', change: 'Locations tied to a branch record', trend: 'up' },
      { label: 'Inactive Locations', value: '0', change: 'Retained for historical reporting', trend: 'down' },
      { label: 'Total Locations', value: '0', change: 'Location master records on file', trend: 'neutral' },
    ],
    tableTitle: 'Location Register',
    tableDescription: 'Location master records using code, name, branch relationship, and status.',
    columns: ['Location Code', 'Name', 'Branch', 'Created By', 'Updated By', 'Status'],
    rows: [],
  },
];

type OrgDimensionPageProps = {
  searchParams?: Promise<{ tab?: string | string[] }>;
};

function normalizeTab(value?: string | string[]) {
  const tab = Array.isArray(value) ? value[0] : value;
  if (tab === 'departments' || tab === 'locations') return tab;
  return 'branches';
}

export default async function OrganizationReportingDimensionsPage({ searchParams }: OrgDimensionPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTab = normalizeTab(resolvedSearchParams?.tab);
  const [initialBranchesData, initialDepartmentsData, initialLocationsData] = await Promise.all([
    getBranchesRegister().catch(() => null),
    getDepartmentsRegister().catch(() => null),
    getLocationsRegister().catch(() => null),
  ]);

  return (
    <OrganizationReportingDimensionsClient
      staticTabs={staticTabs}
      initialBranchesData={initialBranchesData}
      initialDepartmentsData={initialDepartmentsData}
      initialLocationsData={initialLocationsData}
      initialTab={initialTab}
    />
  );
}
