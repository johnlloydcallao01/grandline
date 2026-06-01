import {
  PayrollContractorFinancePage,
  type PayrollContractorFinanceTab,
} from '../_components/PayrollContractorFinancePage';

const tabs: PayrollContractorFinanceTab[] = [
  {
    id: 'payroll-runs',
    label: 'Payroll Runs',
    description:
      'Review finance-oriented payroll run headers using payroll code, period dates, payment date, status, approval request link, and posted journal linkage.',
    searchPlaceholder: 'Search payroll code, period start, period end, payment date, status, or posted journal',
    filters: ['Payroll Runs', 'Draft', 'Approved', 'Posted'],
    actions: [
      { label: 'New Payroll Run', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Runs', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Payroll Runs', value: '14', change: 'Finance payroll batches tracked for posting', trend: 'up' },
      { label: 'Approved Runs', value: '5', change: 'Runs already cleared for posting workflow', trend: 'up' },
      { label: 'Posted Runs', value: '6', change: 'Runs already posted to journal entries', trend: 'up' },
      { label: 'Pending Review', value: '3', change: 'Runs still in draft or review status', trend: 'neutral' },
    ],
    tableTitle: 'Payroll Run Register',
    tableDescription:
      'Run records aligned to `accounting-payroll-runs`, including period, payment date, status, approval request, and posted journal entry.',
    columns: ['Payroll Code', 'Period Start', 'Period End', 'Payment Date', 'Status', 'Posted Journal'],
    rows: [
      {
        id: 'run-1',
        cells: [
          { text: 'PAYRUN-20260530001', emphasis: true },
          '2026-05-01',
          '2026-05-15',
          '2026-05-20',
          { text: 'posted', tone: 'green' },
          'JE-2026-1201',
        ],
      },
      {
        id: 'run-2',
        cells: [
          { text: 'PAYRUN-20260530002', emphasis: true },
          '2026-05-16',
          '2026-05-31',
          '2026-06-05',
          { text: 'approved', tone: 'blue' },
          '-',
        ],
      },
      {
        id: 'run-3',
        cells: [
          { text: 'PAYRUN-20260530003', emphasis: true },
          '2026-06-01',
          '2026-06-15',
          '2026-06-20',
          { text: 'review', tone: 'amber' },
          '-',
        ],
      },
      {
        id: 'run-4',
        cells: [
          { text: 'PAYRUN-20260530004', emphasis: true },
          '2026-06-16',
          '2026-06-30',
          '2026-07-05',
          { text: 'draft', tone: 'amber' },
          '-',
        ],
      },
    ],
  },
  {
    id: 'payroll-entries',
    label: 'Payroll Entries',
    description:
      'Review person-level payroll and contractor payout rows using user or instructor, project, entry type, gross amount, deductions, net amount, and status.',
    searchPlaceholder: 'Search payroll run, user, instructor, project, entry type, net amount, or status',
    filters: ['Payroll Entries', 'Salary', 'Contractor', 'Posted'],
    actions: [
      { label: 'New Payroll Entry', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Entries', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Payroll Entries', value: '126', change: 'Rows grouped under payroll runs', trend: 'up' },
      { label: 'Contractor Entries', value: '18', change: 'Entries using contractor type in payroll rows', trend: 'up' },
      { label: 'Net Amount', value: 'PHP 2.14M', change: 'Current summed net amount across visible payroll rows', trend: 'up' },
      { label: 'Posted Entries', value: '72', change: 'Rows already posted through the payroll service', trend: 'up' },
    ],
    tableTitle: 'Payroll Entry Register',
    tableDescription:
      'Entry rows aligned to `accounting-payroll-entries`, including salary, contractor, reimbursement, and adjustment entry types.',
    columns: ['Payroll Run', 'Person', 'Project', 'Entry Type', 'Net Amount', 'Status'],
    rows: [
      {
        id: 'entry-1',
        cells: [
          { text: 'PAYRUN-20260530001', emphasis: true },
          'Maria Santos',
          'BlueWave Cadet Cohort 1',
          { text: 'salary', tone: 'green' },
          { text: 'PHP 48,500', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'entry-2',
        cells: [
          { text: 'PAYRUN-20260530001', emphasis: true },
          'Instructor Joel Reyes',
          'Radar Observer Course',
          { text: 'contractor', tone: 'blue' },
          { text: 'PHP 18,000', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'entry-3',
        cells: [
          { text: 'PAYRUN-20260530002', emphasis: true },
          'Ana Cruz',
          'BST Internal Refresh',
          { text: 'reimbursement', tone: 'gray' },
          { text: 'PHP 3,600', align: 'right' },
          { text: 'approved', tone: 'blue' },
        ],
      },
      {
        id: 'entry-4',
        cells: [
          { text: 'PAYRUN-20260530003', emphasis: true },
          'Paolo Ramos',
          'Oceanic Fleet Upskilling',
          { text: 'adjustment', tone: 'amber' },
          { text: 'PHP 2,150', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'payroll-posting',
    label: 'Payroll Posting',
    description:
      'Review posting readiness for payroll runs based on approved status, entry counts, journal linkage, and payroll service posting behavior.',
    searchPlaceholder: 'Search payroll code, payment date, journal status, ready-to-post state, or entry count',
    filters: ['Payroll Posting', 'Ready To Post', 'Posted', 'Needs Approval'],
    actions: [
      { label: 'Post Payroll Run', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Posting', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Ready To Post', value: '5', change: 'Approved runs with entries ready for payroll posting', trend: 'up' },
      { label: 'Posted Journals', value: '6', change: 'Runs already linked to posted journal entries', trend: 'up' },
      { label: 'Runs Awaiting Approval', value: '3', change: 'Runs blocked before the post route can execute', trend: 'neutral' },
      { label: 'Posting Value', value: 'PHP 2.48M', change: 'Gross payroll expense value represented in current posting queue', trend: 'up' },
    ],
    tableTitle: 'Payroll Posting Queue',
    tableDescription:
      'Posting view grounded in `AccountingPayrollService.postPayrollRun()` and the `/accounting/payroll/runs/[id]/post` route.',
    columns: ['Payroll Code', 'Payment Date', 'Entry Count', 'Approval State', 'Posted Journal', 'Posting State'],
    rows: [
      {
        id: 'posting-1',
        cells: [
          { text: 'PAYRUN-20260530002', emphasis: true },
          '2026-06-05',
          { text: '19', align: 'right' },
          { text: 'approved', tone: 'blue' },
          '-',
          { text: 'ready_to_post', tone: 'green' },
        ],
      },
      {
        id: 'posting-2',
        cells: [
          { text: 'PAYRUN-20260530001', emphasis: true },
          '2026-05-20',
          { text: '22', align: 'right' },
          { text: 'approved', tone: 'blue' },
          'JE-2026-1201',
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'posting-3',
        cells: [
          { text: 'PAYRUN-20260530003', emphasis: true },
          '2026-06-20',
          { text: '16', align: 'right' },
          { text: 'review', tone: 'amber' },
          '-',
          { text: 'blocked', tone: 'red' },
        ],
      },
      {
        id: 'posting-4',
        cells: [
          { text: 'PAYRUN-20260530004', emphasis: true },
          '2026-07-05',
          { text: '0', align: 'right' },
          { text: 'draft', tone: 'amber' },
          '-',
          { text: 'incomplete', tone: 'red' },
        ],
      },
    ],
  },
];

export default function PayrollOperationsPage() {
  return (
    <PayrollContractorFinancePage
      eyebrow="Advanced Finance / Payroll & Contractor Finance"
      title="Payroll Operations"
      description="Review payroll runs, payroll entries, and posting readiness grounded in the current payroll collections, approval flow, and posting route."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Payroll Run', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
