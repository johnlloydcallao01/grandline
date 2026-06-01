import { BudgetsForecastsPage, type BudgetsForecastsTab } from '../_components/BudgetsForecastsPage';

const tabs: BudgetsForecastsTab[] = [
  {
    id: 'budgets',
    label: 'Budgets',
    description:
      'Review budget headers using budget code, name, fiscal year, status, budget type, dimensions, related project, course category, and linked scenario.',
    searchPlaceholder: 'Search budget code, name, fiscal year, status, budget type, project, or scenario',
    filters: ['Budgets', 'Draft', 'Approved', 'Annual'],
    actions: [
      { label: 'New Budget', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Budgets', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Budgets', value: '22', change: 'Planning headers available for finance monitoring and approvals', trend: 'up' },
      { label: 'Approved Budgets', value: '11', change: 'Budgets already approved for active monitoring', trend: 'up' },
      { label: 'Draft Budgets', value: '7', change: 'Budgets still being prepared or reviewed', trend: 'neutral' },
      { label: 'Project-Linked Budgets', value: '9', change: 'Budgets linked directly to project planning', trend: 'up' },
    ],
    tableTitle: 'Budget Register',
    tableDescription:
      'Budget header records aligned to `accounting-budgets`, including fiscal year, status, budget type, dimensions, project, and scenario links.',
    columns: ['Budget Code', 'Name', 'Fiscal Year', 'Budget Type', 'Scenario', 'Status'],
    rows: [
      {
        id: 'budget-1',
        cells: [
          { text: 'BUD-2026-001', emphasis: true },
          '2026 Corporate Training Budget',
          'FY 2026',
          'annual',
          'Base Case FY 2026',
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'budget-2',
        cells: [
          { text: 'BUD-2026-004', emphasis: true },
          'BlueWave Cohort Budget',
          'FY 2026',
          'project',
          'Conservative Case FY 2026',
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'budget-3',
        cells: [
          { text: 'BUD-2026-007', emphasis: true },
          'Simulator Lab Capex Budget',
          'FY 2026',
          'capital',
          'Base Case FY 2026',
          { text: 'approved', tone: 'green' },
        ],
      },
      {
        id: 'budget-4',
        cells: [
          { text: 'BUD-2026-011', emphasis: true },
          'LMS Revenue Plan',
          'FY 2026',
          'annual',
          'Aggressive Case FY 2026',
          { text: 'submitted', tone: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'budget-lines',
    label: 'Budget Lines',
    description:
      'Review line-level planned values by budget, account, period, and planned amount for later comparison against posted actuals.',
    searchPlaceholder: 'Search budget, account code, account name, period, or planned amount',
    filters: ['Budget Lines', 'This Year', 'Revenue', 'Expense'],
    actions: [
      { label: 'New Budget Line', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Lines', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Budget Lines', value: '286', change: 'Line-level planned values loaded across all budgets', trend: 'up' },
      { label: 'Planned Amount', value: 'PHP 18.4M', change: 'Combined planned amount across visible lines', trend: 'up' },
      { label: 'Revenue Lines', value: '114', change: 'Lines mapped to revenue accounts', trend: 'up' },
      { label: 'Period-Specific Lines', value: '251', change: 'Lines already tied to explicit accounting periods', trend: 'neutral' },
    ],
    tableTitle: 'Budget Line Register',
    tableDescription:
      'Budget-line records aligned to `accounting-budget-lines`, including budget relationship, account, period, and planned amount.',
    columns: ['Budget', 'Account Code', 'Account Name', 'Period', 'Planned Amount', 'Line Type'],
    rows: [
      {
        id: 'line-1',
        cells: [
          { text: '2026 Corporate Training Budget', emphasis: true },
          '4100',
          'Course Revenue',
          '2026-01',
          { text: 'PHP 950,000', align: 'right' },
          { text: 'revenue', tone: 'green' },
        ],
      },
      {
        id: 'line-2',
        cells: [
          { text: 'BlueWave Cohort Budget', emphasis: true },
          '5305',
          'Instructor Delivery Expense',
          '2026-02',
          { text: 'PHP 145,000', align: 'right' },
          { text: 'expense', tone: 'amber' },
        ],
      },
      {
        id: 'line-3',
        cells: [
          { text: 'Simulator Lab Capex Budget', emphasis: true },
          '1605',
          'Training Equipment',
          '2026-03',
          { text: 'PHP 1,800,000', align: 'right' },
          { text: 'asset', tone: 'blue' },
        ],
      },
      {
        id: 'line-4',
        cells: [
          { text: 'LMS Revenue Plan', emphasis: true },
          '4190',
          'Discount Contra Revenue',
          '2026-04',
          { text: 'PHP 120,000', align: 'right' },
          { text: 'contra', tone: 'gray' },
        ],
      },
    ],
  },
];

export default function BudgetPlanningPage() {
  return (
    <BudgetsForecastsPage
      eyebrow="Advanced Finance / Budgets & Forecasts"
      title="Budget Planning"
      description="Review budget headers and budget lines that drive finance planning, approvals, and budget-vs-actual comparison."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Budget', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
