import { LmsBillingCollectionsPage, type LmsBillingCollectionsTab } from '../_components/LmsBillingCollectionsPage';

const tabs: LmsBillingCollectionsTab[] = [
  {
    id: 'scholarship-awards',
    label: 'Scholarship Awards',
    description:
      'Review sponsor and scholarship coverage awards applied to LMS billing links, including award type, award amount, trainee share, sponsor, and status.',
    searchPlaceholder: 'Search billing link, sponsor, trainee, award type, amount, trainee share, or status',
    filters: ['Scholarship Awards', 'Active', 'Partial', 'Third-Party Billed'],
    actions: [
      { label: 'New Award', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Awards', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Awards', value: '38', change: 'Scholarship coverage records linked to LMS billing', trend: 'up' },
      { label: 'Active Awards', value: '31', change: 'Awards currently contributing to charge reductions', trend: 'up' },
      { label: 'Sponsored Coverage', value: 'PHP 486K', change: 'Value of sponsor-funded coverage now active', trend: 'up' },
      { label: 'Trainee Share', value: 'PHP 219K', change: 'Residual trainee share across award-backed enrollments', trend: 'neutral' },
    ],
    tableTitle: 'Scholarship Award Register',
    tableDescription:
      'Award records aligned to `accounting-scholarship-awards`, including sponsor, billing link, award type, award amount, trainee share, and status.',
    columns: ['Billing Link', 'Sponsor', 'Trainee', 'Award Type', 'Award Amount', 'Status'],
    rows: [
      {
        id: 'award-1',
        cells: [
          { text: 'ENR-1152', emphasis: true },
          'TESDA Region IV',
          'Paolo Javier',
          'third_party_billed',
          { text: 'PHP 24,000', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'award-2',
        cells: [
          { text: 'ENR-1260', emphasis: true },
          'CHED Maritime Scholars',
          'Rina Tolentino',
          'partial',
          { text: 'PHP 7,500', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'award-3',
        cells: [
          { text: 'ENR-1272', emphasis: true },
          'Batangas Maritime Grant',
          'Jay Matic',
          'full',
          { text: 'PHP 18,900', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'award-4',
        cells: [
          { text: 'ENR-1221', emphasis: true },
          'Alumni Support Pool',
          'Cris Matias',
          'partial',
          { text: 'PHP 4,500', align: 'right' },
          { text: 'inactive', tone: 'gray' },
        ],
      },
    ],
  },
  {
    id: 'corporate-billing-links',
    label: 'Corporate Billing Links',
    description:
      'Review corporate payer coverage links between LMS enrollments, corporate accounts, invoices, covered amounts, trainee share, and link status.',
    searchPlaceholder: 'Search billing link, corporate account, invoice, coverage type, covered amount, or status',
    filters: ['Corporate Links', 'Active', 'Full Company Pay', 'Shared Coverage'],
    actions: [
      { label: 'New Corporate Link', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Links', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Corporate Links', value: '27', change: 'Corporate payer coverage records tied to LMS billing', trend: 'up' },
      { label: 'Active Links', value: '24', change: 'Corporate coverage records currently in force', trend: 'up' },
      { label: 'Corporate Coverage', value: 'PHP 721K', change: 'Covered amount from company billing records', trend: 'up' },
      { label: 'Shared Coverage Links', value: '9', change: 'Links where trainee share remains after corporate pay', trend: 'neutral' },
    ],
    tableTitle: 'Corporate Billing Link Register',
    tableDescription:
      'Corporate coverage records aligned to `accounting-corporate-billing-links`, including account, invoice, covered amount, trainee share, and status.',
    columns: ['Billing Link', 'Corporate Account', 'Invoice', 'Coverage Type', 'Covered Amount', 'Status'],
    rows: [
      {
        id: 'corp-link-1',
        cells: [
          { text: 'ENR-1234', emphasis: true },
          'BlueWave Manning Services',
          'INV-2026-0448',
          'shared_company_pay',
          { text: 'PHP 6,400', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'corp-link-2',
        cells: [
          { text: 'ENR-1291', emphasis: true },
          'Oceanic Fleet Management',
          'INV-2026-0467',
          'full_company_pay',
          { text: 'PHP 28,000', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'corp-link-3',
        cells: [
          { text: 'ENR-1310', emphasis: true },
          'Harbor Marine Logistics',
          'INV-2026-0481',
          'shared_company_pay',
          { text: 'PHP 12,500', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'corp-link-4',
        cells: [
          { text: 'ENR-1173', emphasis: true },
          'Legacy Offshore Training Pool',
          'INV-2026-0402',
          'full_company_pay',
          { text: 'PHP 16,900', align: 'right' },
          { text: 'inactive', tone: 'gray' },
        ],
      },
    ],
  },
];

export default function SponsorCorporateBillingPage() {
  return (
    <LmsBillingCollectionsPage
      eyebrow="LMS Finance / LMS Billing & Collections"
      title="Sponsor & Corporate Billing"
      description="Review scholarship awards and corporate billing links that reduce or transfer LMS trainee charges to sponsor and company payers."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Coverage Record', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
