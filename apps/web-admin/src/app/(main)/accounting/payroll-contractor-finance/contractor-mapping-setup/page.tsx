import {
  PayrollContractorFinancePage,
  type PayrollContractorFinanceTab,
} from '../_components/PayrollContractorFinancePage';

const tabs: PayrollContractorFinanceTab[] = [
  {
    id: 'instructor-payouts',
    label: 'Instructor Payouts',
    description:
      'Review payout obligations and approvals for instructors using source reference, course, period dates, calculated amount, approved amount, and payout status.',
    searchPlaceholder: 'Search instructor, course, period, source reference, approved amount, or payout status',
    filters: ['Instructor Payouts', 'Draft', 'Approved', 'Current Period'],
    actions: [
      { label: 'Open Payout', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Payouts', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Payout Rows', value: '34', change: 'Instructor payout obligations tracked from LMS activity', trend: 'up' },
      { label: 'Approved Amount', value: 'PHP 412K', change: 'Current approved payout value across visible rows', trend: 'up' },
      { label: 'Draft Payouts', value: '9', change: 'Rows still waiting for payout review or approval', trend: 'neutral' },
      { label: 'Courses Covered', value: '12', change: 'Courses represented in payout obligations', trend: 'up' },
    ],
    tableTitle: 'Instructor Payout Register',
    tableDescription:
      'Payout rows aligned to `accounting-instructor-payouts`, which is the actual contractor-adjacent payout surface in the backend today.',
    columns: ['Instructor', 'Course', 'Period', 'Calculated Amount', 'Approved Amount', 'Status'],
    rows: [
      {
        id: 'payout-1',
        cells: [
          { text: 'Joel Reyes', emphasis: true },
          'Radar Observer Course',
          '2026-05-01 to 2026-05-15',
          { text: 'PHP 18,000', align: 'right' },
          { text: 'PHP 18,000', align: 'right' },
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'payout-2',
        cells: [
          { text: 'Marvin Dela Cruz', emphasis: true },
          'Basic Safety Training',
          '2026-05-16 to 2026-05-31',
          { text: 'PHP 22,500', align: 'right' },
          { text: 'PHP 21,000', align: 'right' },
          { text: 'review', tone: 'blue' },
        ],
      },
      {
        id: 'payout-3',
        cells: [
          { text: 'Lani Mercado', emphasis: true },
          'GMDSS General Operator',
          '2026-05-16 to 2026-05-31',
          { text: 'PHP 14,000', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'payout-4',
        cells: [
          { text: 'Eric Tiu', emphasis: true },
          'Engine Room Resource Mgmt',
          '2026-06-01 to 2026-06-15',
          { text: 'PHP 19,200', align: 'right' },
          { text: 'PHP 19,200', align: 'right' },
          { text: 'approved', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'payroll-account-mapping',
    label: 'Payroll Account Mapping',
    description:
      'Review how payroll entry rows map gross and net values into finance posting accounts using `expenseAccount` and `payableAccount` on payroll entries.',
    searchPlaceholder: 'Search entry type, project, expense account, payable account, gross amount, or deduction amount',
    filters: ['Payroll Mapping', 'Salary', 'Contractor', 'With Deductions'],
    actions: [
      { label: 'Open Mapping', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Mapping', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Mapped Payroll Rows', value: '126', change: 'Payroll entries carrying explicit expense and payable accounts', trend: 'up' },
      { label: 'Salary Rows', value: '78', change: 'Entries using salary type in current mapped set', trend: 'up' },
      { label: 'Contractor Rows', value: '18', change: 'Entries using contractor type in current mapped set', trend: 'up' },
      { label: 'With Deductions', value: '63', change: 'Rows where net amount differs from gross because of deductions', trend: 'neutral' },
    ],
    tableTitle: 'Payroll Mapping Register',
    tableDescription:
      'Mapping view grounded in `accounting-payroll-entries`, where expense and payable account mapping actually lives today.',
    columns: ['Entry Type', 'Person', 'Expense Account', 'Payable Account', 'Deduction Amount', 'Status'],
    rows: [
      {
        id: 'mapping-1',
        cells: [
          { text: 'salary', tone: 'green' },
          'Maria Santos',
          '5010 Salaries Expense',
          '2105 Payroll Payable',
          { text: 'PHP 4,500', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'mapping-2',
        cells: [
          { text: 'contractor', tone: 'blue' },
          'Instructor Joel Reyes',
          '5035 Contractor Instruction Expense',
          '2115 Contractor Payable',
          { text: 'PHP 0', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'mapping-3',
        cells: [
          { text: 'reimbursement', tone: 'gray' },
          'Ana Cruz',
          '5050 Staff Reimbursements',
          '2120 Employee Reimbursements Payable',
          { text: 'PHP 0', align: 'right' },
          { text: 'approved', tone: 'blue' },
        ],
      },
      {
        id: 'mapping-4',
        cells: [
          { text: 'adjustment', tone: 'amber' },
          'Paolo Ramos',
          '5065 Payroll Adjustments Expense',
          '2105 Payroll Payable',
          { text: 'PHP 1,250', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function ContractorMappingSetupPage() {
  return (
    <PayrollContractorFinancePage
      eyebrow="Advanced Finance / Payroll & Contractor Finance"
      title="Contractor & Mapping Setup"
      description="Review the narrower contractor-related payout surface and the payroll account mappings that actually exist in the current backend."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Export Setup View', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
