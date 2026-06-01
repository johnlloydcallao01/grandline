import { LmsFinanceReportingPage, type LmsFinanceReportingTab } from '../_components/LmsFinanceReportingPage';

const tabs: LmsFinanceReportingTab[] = [
  {
    id: 'pending-enrollment-billing',
    label: 'Pending Enrollment Billing',
    description:
      'Review pending LMS enrollment billing workload using the LMS dashboard summary fields for pending enrollment requests and estimated pending billing value.',
    searchPlaceholder: 'Search enrollment, course, trainee, requested amount, or billing state',
    filters: ['Pending Billing', 'Needs Invoice', 'Awaiting Payment', 'Recent Requests'],
    actions: [
      { label: 'Refresh Pipeline', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Pending Requests', value: '17', change: 'Pending LMS enrollment requests from the dashboard summary', trend: 'neutral' },
      { label: 'Estimated Pending Billings', value: 'PHP 463K', change: 'Estimated billing value tied to pending requests', trend: 'up' },
      { label: 'Links Not Started', value: '9', change: 'Billing links still in not-started state', trend: 'neutral' },
      { label: 'Needs Customer Setup', value: '4', change: 'Enrollments still needing billing-customer resolution', trend: 'down' },
    ],
    tableTitle: 'Pending Enrollment Billing Register',
    tableDescription:
      'Pipeline view grounded in the pending-enrollment measures returned by `AccountingLmsDashboardService.getDashboard()` and the enrollment-billing link status model.',
    columns: ['Enrollment', 'Course', 'Trainee', 'Billing State', 'Estimated Charge', 'Action Stage'],
    rows: [
      {
        id: 'pending-1',
        cells: [
          { text: 'ENR-1331', emphasis: true },
          'Basic Safety Training',
          'Lea Navarro',
          { text: 'not_started', tone: 'amber' },
          { text: 'PHP 18,500', align: 'right' },
          'Needs billing link review',
        ],
      },
      {
        id: 'pending-2',
        cells: [
          { text: 'ENR-1337', emphasis: true },
          'Radar Observer Course',
          'Mark Sison',
          { text: 'pending_payment', tone: 'blue' },
          { text: 'PHP 24,000', align: 'right' },
          'Invoice sent',
        ],
      },
      {
        id: 'pending-3',
        cells: [
          { text: 'ENR-1340', emphasis: true },
          'Engine Room Resource Mgmt',
          'Mika Cruz',
          { text: 'not_started', tone: 'amber' },
          { text: 'PHP 32,600', align: 'right' },
          'Needs customer creation',
        ],
      },
      {
        id: 'pending-4',
        cells: [
          { text: 'ENR-1344', emphasis: true },
          'GMDSS General Operator',
          'BlueWave Manning',
          { text: 'invoiced', tone: 'green' },
          { text: 'PHP 12,400', align: 'right' },
          'Awaiting allocation',
        ],
      },
    ],
  },
  {
    id: 'corporate-receivables',
    label: 'Corporate Receivables',
    description:
      'Review active corporate receivable balances using the dedicated LMS corporate receivables query output.',
    searchPlaceholder: 'Search corporate account, invoice, covered amount, trainee share, balance due, or status',
    filters: ['Corporate Receivables', 'Active', 'High Balance', 'Shared Coverage'],
    actions: [
      { label: 'Refresh Receivables', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Report', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Corporate Balance Due', value: 'PHP 721K', change: 'Outstanding corporate receivable balance from active links', trend: 'up' },
      { label: 'Active Corporate Links', value: '24', change: 'Corporate billing links contributing to the report', trend: 'up' },
      { label: 'Shared Coverage', value: '9', change: 'Rows where trainee share still remains', trend: 'neutral' },
      { label: 'Average Corporate Balance', value: 'PHP 30K', change: 'Average balance due per active corporate row', trend: 'neutral' },
    ],
    tableTitle: 'Corporate Receivables Register',
    tableDescription:
      'Receivables view aligned to the `getCorporateReceivables()` query and its output for account, invoice, covered amount, trainee share, and balance due.',
    columns: ['Account Code', 'Corporate Account', 'Invoice', 'Covered Amount', 'Balance Due', 'Status'],
    rows: [
      {
        id: 'corp-rec-1',
        cells: [
          { text: 'CORP-0011', emphasis: true },
          'BlueWave Manning Services',
          'INV-2026-0448',
          { text: 'PHP 6,400', align: 'right' },
          { text: 'PHP 6,400', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'corp-rec-2',
        cells: [
          { text: 'CORP-0008', emphasis: true },
          'Oceanic Fleet Management',
          'INV-2026-0467',
          { text: 'PHP 28,000', align: 'right' },
          { text: 'PHP 19,500', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'corp-rec-3',
        cells: [
          { text: 'CORP-0015', emphasis: true },
          'Harbor Marine Logistics',
          'INV-2026-0481',
          { text: 'PHP 12,500', align: 'right' },
          { text: 'PHP 12,500', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'corp-rec-4',
        cells: [
          { text: 'CORP-0005', emphasis: true },
          'Legacy Offshore Training Pool',
          'INV-2026-0402',
          { text: 'PHP 16,900', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'inactive', tone: 'gray' },
        ],
      },
    ],
  },
  {
    id: 'trainee-collections',
    label: 'Trainee Collections',
    description:
      'Review top trainee collection balances using the LMS dashboard output that ranks due amounts per billing link and related trainee or customer context.',
    searchPlaceholder: 'Search enrollment, trainee id, customer id, amount due, or collection priority',
    filters: ['Trainee Collections', 'High Balance', 'Top 20', 'Outstanding'],
    actions: [
      { label: 'Refresh Collections', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Report', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Outstanding Trainee Due', value: 'PHP 588K', change: 'Open trainee-side collection balance in the current top list', trend: 'up' },
      { label: 'Top 20 Rows', value: '20', change: 'Dashboard-limited trainee collection rows in view', trend: 'neutral' },
      { label: 'Average Due', value: 'PHP 29.4K', change: 'Average due per trainee-collection row', trend: 'neutral' },
      { label: 'Largest Due', value: 'PHP 48.5K', change: 'Highest single trainee balance in the ranked list', trend: 'up' },
    ],
    tableTitle: 'Trainee Collections Register',
    tableDescription:
      'Collections view aligned to the `traineeCollections` array returned by `AccountingLmsDashboardService.getDashboard()`.',
    columns: ['Enrollment', 'Trainee ID', 'Customer ID', 'Amount Due', 'Priority', 'Collection State'],
    rows: [
      {
        id: 'collect-1',
        cells: [
          { text: 'ENR-1207', emphasis: true },
          'TRN-1044',
          'CUST-0155',
          { text: 'PHP 24,450', align: 'right' },
          { text: 'High', tone: 'amber' },
          'Outstanding',
        ],
      },
      {
        id: 'collect-2',
        cells: [
          { text: 'ENR-1234', emphasis: true },
          'TRN-1061',
          'CUST-0162',
          { text: 'PHP 12,400', align: 'right' },
          { text: 'Medium', tone: 'blue' },
          'Awaiting payment',
        ],
      },
      {
        id: 'collect-3',
        cells: [
          { text: 'ENR-1337', emphasis: true },
          'TRN-1092',
          'CUST-0178',
          { text: 'PHP 24,000', align: 'right' },
          { text: 'High', tone: 'amber' },
          'Invoice sent',
        ],
      },
      {
        id: 'collect-4',
        cells: [
          { text: 'ENR-1260', emphasis: true },
          'TRN-1074',
          'CUST-0171',
          { text: 'PHP 7,500', align: 'right' },
          { text: 'Low', tone: 'gray' },
          'Partially sponsored',
        ],
      },
    ],
  },
];

export default function BillingPipelineMonitoringPage() {
  return (
    <LmsFinanceReportingPage
      eyebrow="LMS Finance / LMS Finance Reporting"
      title="Billing Pipeline Monitoring"
      description="Review pending enrollment billing, corporate receivable balances, and trainee collection exposure using the LMS reporting service outputs."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Export Report', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
