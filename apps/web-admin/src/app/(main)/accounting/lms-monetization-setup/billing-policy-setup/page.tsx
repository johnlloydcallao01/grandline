import { LmsMonetizationSetupPage, type LmsMonetizationTab } from '../_components/LmsMonetizationSetupPage';

const tabs: LmsMonetizationTab[] = [
  {
    id: 'scholarship-sponsors',
    label: 'Scholarship Sponsors',
    description:
      'Review scholarship and sponsor master records mapped to accounting customers for LMS-sponsored enrollments and third-party billing.',
    searchPlaceholder: 'Search sponsor code, sponsor name, customer, contact, email, or status',
    filters: ['Active Sponsors', 'With Customer', 'Scholarship', 'Third-Party Billing'],
    actions: [
      { label: 'New Sponsor', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Sponsors', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Sponsors', value: '14', change: 'Scholarship and sponsorship master records', trend: 'up' },
      { label: 'Mapped Customers', value: '13', change: 'Sponsors linked to accounting customers', trend: 'up' },
      { label: 'Active Sponsors', value: '12', change: 'Sponsors currently eligible for awards', trend: 'neutral' },
      { label: 'Billing Contacts Set', value: '11', change: 'Sponsor records with contact details completed', trend: 'up' },
    ],
    tableTitle: 'Scholarship Sponsor Register',
    tableDescription:
      'Sponsor setup aligned to `accounting-scholarship-sponsors`, including sponsor code, customer mapping, contact details, and status.',
    columns: ['Sponsor Code', 'Sponsor Name', 'Default Customer', 'Contact', 'Email', 'Status'],
    rows: [
      {
        id: 'sponsor-1',
        cells: [
          { text: 'SPN-CHED-01', emphasis: true },
          'CHED Maritime Scholars',
          'CUST-0042 CHED Foundation',
          'Mia Robles',
          'maritime@ched.gov.ph',
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'sponsor-2',
        cells: [
          { text: 'SPN-TESDA-04', emphasis: true },
          'TESDA Regional Training Grant',
          'CUST-0051 TESDA Region IV',
          'Rene Bautista',
          'grant-admin@tesda.gov.ph',
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'sponsor-3',
        cells: [
          { text: 'SPN-LGU-09', emphasis: true },
          'Batangas Maritime Grant',
          'CUST-0067 Batangas Province',
          'Ivy Santos',
          'education@batangas.gov.ph',
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'sponsor-4',
        cells: [
          { text: 'SPN-ALUMNI-02', emphasis: true },
          'Alumni Support Pool',
          'CUST-0074 Alumni Fund',
          'Luis Reyes',
          'alumni-fund@grandline.com',
          { text: 'inactive', tone: 'gray' },
        ],
      },
    ],
  },
  {
    id: 'corporate-accounts',
    label: 'Corporate Accounts',
    description:
      'Review B2B customer payer records used for corporate training billing, negotiated pricing policy, and credit or payment terms.',
    searchPlaceholder: 'Search account code, company, customer, credit terms, payment terms, or status',
    filters: ['Active Accounts', 'Credit Terms', 'Negotiated Pricing', 'Corporate Billing'],
    actions: [
      { label: 'New Corporate Account', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Accounts', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Corporate Accounts', value: '21', change: 'B2B payer records for training clients', trend: 'up' },
      { label: 'Negotiated Pricing', value: '16', change: 'Accounts with custom pricing policy metadata', trend: 'up' },
      { label: 'Active Billing Accounts', value: '19', change: 'Corporate payers currently in use', trend: 'neutral' },
      { label: 'Customer Links', value: '21', change: 'Accounts tied to customer master records', trend: 'up' },
    ],
    tableTitle: 'Corporate Account Register',
    tableDescription:
      'Corporate billing setup aligned to `accounting-corporate-accounts`, including customer mapping, terms, and negotiated pricing metadata.',
    columns: ['Account Code', 'Name', 'Customer', 'Credit Terms', 'Payment Terms', 'Status'],
    rows: [
      {
        id: 'corp-1',
        cells: [
          { text: 'CORP-0008', emphasis: true },
          'Oceanic Fleet Management',
          'CUST-0088 Oceanic Fleet',
          '30 days',
          'Bank transfer',
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'corp-2',
        cells: [
          { text: 'CORP-0011', emphasis: true },
          'BlueWave Manning Services',
          'CUST-0093 BlueWave Manning',
          '45 days',
          'Corporate SOA',
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'corp-3',
        cells: [
          { text: 'CORP-0015', emphasis: true },
          'Harbor Marine Logistics',
          'CUST-0104 Harbor Marine',
          '15 days',
          'Bank transfer',
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'corp-4',
        cells: [
          { text: 'CORP-0005', emphasis: true },
          'Legacy Offshore Training Pool',
          'CUST-0079 Legacy Offshore',
          '60 days',
          'Manual billing',
          { text: 'inactive', tone: 'gray' },
        ],
      },
    ],
  },
];

export default function BillingPolicySetupPage() {
  return (
    <LmsMonetizationSetupPage
      eyebrow="LMS Finance / LMS Monetization Setup"
      title="Billing Policy Setup"
      description="Review sponsor and corporate payer master records that support scholarship coverage, third-party billing, and negotiated LMS customer billing."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Billing Policy', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
