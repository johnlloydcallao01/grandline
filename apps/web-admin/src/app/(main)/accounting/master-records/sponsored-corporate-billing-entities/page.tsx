import { MasterRecordsPage, type MasterRecordsTab } from '../_components/MasterRecordsPage';

const tabs: MasterRecordsTab[] = [
  {
    id: 'scholarship-sponsors',
    label: 'Scholarship Sponsors',
    description: 'Maintain sponsor master records mapped to accounting customers with contact and status information.',
    searchPlaceholder: 'Search sponsor code, name, default customer, contact, or status',
    filters: ['Active', 'With Default Customer', 'Recent', 'Inactive'],
    actions: [
      { label: 'Create Sponsor', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Sponsors', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Sponsors', value: '12', change: 'Sponsors usable for scholarship billing', trend: 'up' },
      { label: 'Mapped Customers', value: '10', change: 'Sponsors linked to accounting customers', trend: 'up' },
      { label: 'Inactive Sponsors', value: '2', change: 'Retained for prior awards and billing links', trend: 'down' },
      { label: 'With Contact Info', value: '11', change: 'Sponsors with operational contact details', trend: 'neutral' },
    ],
    tableTitle: 'Scholarship Sponsor Register',
    tableDescription: 'Sponsor records using sponsor code, name, default customer relationship, and status.',
    columns: ['Sponsor Code', 'Name', 'Default Customer', 'Contact', 'Email', 'Status'],
    rows: [
      {
        id: 'sponsor-1',
        cells: [
          { text: 'SCH-001', emphasis: true },
          'Maritime Scholars Fund',
          'C-00014 Grandline Corporate',
          'L. Garcia',
          'scholars@msf.org',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'sponsor-2',
        cells: [
          { text: 'SCH-003', emphasis: true },
          'Harbor Skills Grant',
          'C-00057 Harbor Training Ltd.',
          'A. Reyes',
          'grants@harborskills.ph',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'sponsor-3',
        cells: [
          { text: 'SCH-006', emphasis: true },
          'Legacy Cadet Support',
          'C-00108 Blue Anchor Marine',
          'M. Dela Cruz',
          'legacy@cadet.org',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'corporate-accounts',
    label: 'Corporate Accounts',
    description: 'Manage corporate payer accounts linked to customers with contact data, credit terms, payment terms, and status.',
    searchPlaceholder: 'Search account code, company name, customer, billing contact, or status',
    filters: ['Active', 'With Customer', 'With Credit Terms', 'Inactive'],
    actions: [
      { label: 'Create Corporate Account', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Accounts', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Corporate Accounts', value: '18', change: 'Available for company-billed training', trend: 'up' },
      { label: 'Customer Linked', value: '18', change: 'Accounts mapped to receivables customers', trend: 'up' },
      { label: 'With Credit Terms', value: '13', change: 'Accounts storing commercial credit terms', trend: 'neutral' },
      { label: 'Inactive Accounts', value: '3', change: 'Retained for historical billing links', trend: 'down' },
    ],
    tableTitle: 'Corporate Account Register',
    tableDescription: 'Corporate account records using account code, linked customer, billing contact, terms, and status.',
    columns: ['Account Code', 'Name', 'Customer', 'Billing Contact', 'Credit Terms', 'Status'],
    rows: [
      {
        id: 'corp-1',
        cells: [
          { text: 'CORP-014', emphasis: true },
          'Grandline Corporate Training',
          'C-00014 Grandline Corporate',
          'T. Mendoza',
          '30 days',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'corp-2',
        cells: [
          { text: 'CORP-021', emphasis: true },
          'Blue Anchor Fleet Academy',
          'C-00108 Blue Anchor Marine',
          'R. Santos',
          '15 days',
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'corp-3',
        cells: [
          { text: 'CORP-009', emphasis: true },
          'Legacy Maritime Sponsor',
          'C-00057 Harbor Training Ltd.',
          'P. Cruz',
          '45 days',
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'coverage-links',
    label: 'Coverage Links',
    description: 'Review sponsor awards and corporate billing links that connect enrollment billing to payer entities.',
    searchPlaceholder: 'Search sponsor, corporate account, coverage type, enrollment link, or status',
    filters: ['Scholarship Awards', 'Corporate Billing Links', 'Active', 'Recent'],
    actions: [
      { label: 'Open Coverage Link', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Links', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Scholarship Awards', value: '27', change: 'Awards tied to sponsor coverage', trend: 'up' },
      { label: 'Corporate Billing Links', value: '19', change: 'Company coverage links on billing records', trend: 'up' },
      { label: 'Active Coverage Links', value: '39', change: 'Links currently affecting billing sync', trend: 'up' },
      { label: 'Zero-Value Auto Sync', value: 'Disabled', change: 'Sync keeps billing artifacts aligned', trend: 'neutral' },
    ],
    tableTitle: 'Coverage Link Register',
    tableDescription: 'Coverage links drawn from scholarship awards and corporate billing-link records in the backend.',
    columns: ['Link Type', 'Entity', 'Coverage Type', 'Covered Amount', 'Trainee Share', 'Status'],
    rows: [
      {
        id: 'cov-1',
        cells: [
          'Scholarship Award',
          { text: 'Maritime Scholars Fund', emphasis: true },
          'partial',
          { text: 'PHP 18,000', emphasis: true, align: 'right' },
          { text: 'PHP 7,000', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cov-2',
        cells: [
          'Corporate Billing Link',
          { text: 'Grandline Corporate Training', emphasis: true },
          'full_company_pay',
          { text: 'PHP 26,500', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cov-3',
        cells: [
          'Scholarship Award',
          { text: 'Harbor Skills Grant', emphasis: true },
          'partial',
          { text: 'PHP 12,000', emphasis: true, align: 'right' },
          { text: 'PHP 8,500', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'cov-4',
        cells: [
          'Corporate Billing Link',
          { text: 'Blue Anchor Fleet Academy', emphasis: true },
          'shared_company_pay',
          { text: 'PHP 14,000', emphasis: true, align: 'right' },
          { text: 'PHP 6,500', align: 'right' },
          { text: 'Inactive', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function SponsoredCorporateBillingEntitiesPage() {
  return (
    <MasterRecordsPage
      eyebrow="Core / Master Records"
      title="Sponsored & Corporate Billing Entities"
      description="Maintain sponsor and corporate payer entities together with the coverage links that support scholarship and company-billed training."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Billing Entity', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
