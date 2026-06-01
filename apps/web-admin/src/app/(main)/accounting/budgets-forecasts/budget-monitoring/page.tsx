import { BudgetsForecastsPage, type BudgetsForecastsTab } from '../_components/BudgetsForecastsPage';

const tabs: BudgetsForecastsTab[] = [
  {
    id: 'budget-vs-actual',
    label: 'Budget Vs Actual',
    description:
      'Review budget variance output using planned amount, posted actual amount, and variance amount by account and period for the selected budget.',
    searchPlaceholder: 'Search budget code, account code, account name, period, planned amount, actual amount, or variance',
    filters: ['Budget Vs Actual', 'Positive Variance', 'Negative Variance', 'Posted Actuals'],
    actions: [
      { label: 'Open Variance', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Monitoring', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Monitored Budgets', value: '11', change: 'Approved budgets currently used for variance review', trend: 'up' },
      { label: 'Planned Amount', value: 'PHP 12.6M', change: 'Planned amount across monitored budget rows', trend: 'up' },
      { label: 'Actual Amount', value: 'PHP 11.9M', change: 'Posted actual amount collected from journal lines', trend: 'up' },
      { label: 'Net Variance', value: 'PHP -700K', change: 'Combined actual minus plan across current budget set', trend: 'down' },
    ],
    tableTitle: 'Budget Vs Actual Register',
    tableDescription:
      'Variance view aligned to `AccountingBudgetService.getBudgetVsActual()` and `AccountingBudgetVarianceService.getBudgetVariance()`, including planned, actual, and variance by account-period row.',
    columns: ['Budget', 'Account Code', 'Account Name', 'Planned', 'Actual', 'Variance'],
    rows: [
      {
        id: 'variance-1',
        cells: [
          { text: 'BUD-2026-001', emphasis: true },
          '4100',
          'Course Revenue',
          { text: 'PHP 950,000', align: 'right' },
          { text: 'PHP 902,000', align: 'right' },
          { text: 'PHP -48,000', align: 'right' },
        ],
      },
      {
        id: 'variance-2',
        cells: [
          { text: 'BUD-2026-004', emphasis: true },
          '5305',
          'Instructor Delivery Expense',
          { text: 'PHP 145,000', align: 'right' },
          { text: 'PHP 158,400', align: 'right' },
          { text: 'PHP 13,400', align: 'right' },
        ],
      },
      {
        id: 'variance-3',
        cells: [
          { text: 'BUD-2026-007', emphasis: true },
          '1605',
          'Training Equipment',
          { text: 'PHP 1,800,000', align: 'right' },
          { text: 'PHP 1,620,000', align: 'right' },
          { text: 'PHP -180,000', align: 'right' },
        ],
      },
      {
        id: 'variance-4',
        cells: [
          { text: 'BUD-2026-011', emphasis: true },
          '4190',
          'Discount Contra Revenue',
          { text: 'PHP 120,000', align: 'right' },
          { text: 'PHP 134,500', align: 'right' },
          { text: 'PHP 14,500', align: 'right' },
        ],
      },
    ],
  },
];

export default function BudgetMonitoringPage() {
  return (
    <BudgetsForecastsPage
      eyebrow="Advanced Finance / Budgets & Forecasts"
      title="Budget Monitoring"
      description="Review budget-vs-actual variance using budget lines and posted journal activity from the existing budget reporting service."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Export Variance', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
