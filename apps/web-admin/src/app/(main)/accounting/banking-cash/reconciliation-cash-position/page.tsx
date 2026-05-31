import { BankingCashPage, type BankingCashTab } from '../_components/BankingCashPage';

const tabs: BankingCashTab[] = [
  {
    id: 'bank-reconciliations',
    label: 'Bank Reconciliations',
    description: 'Track reconciliation progress from draft through locked completion with history visibility.',
    searchPlaceholder: 'Search statement month, bank account, preparer, or reconciliation id',
    filters: ['In Progress', 'Needs Review', 'Locked', 'Variance Items'],
    actions: [
      { label: 'Start Reconciliation', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Bank Lines', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Recon Pack', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Reconciliations', value: '4', change: '2 due today', trend: 'neutral' },
      { label: 'Uncleared Variance', value: 'PHP 21,450', change: '7 open line differences', trend: 'down' },
      { label: 'Locked This Month', value: '11', change: 'All prior periods sealed', trend: 'up' },
      { label: 'Oldest Open Session', value: '3 days', change: 'Metrobank April catch-up', trend: 'down' },
    ],
    tableTitle: 'Reconciliation Sessions',
    tableDescription: 'Operational view of bank reconciliation progress, outstanding variances, and final locking status.',
    columns: ['Session', 'Bank Account', 'Statement Period', 'Prepared By', 'Variance', 'Status'],
    rows: [
      {
        id: 'rec-1',
        cells: [
          { text: 'REC-2026-05-BDO', emphasis: true },
          'BDO Operations',
          'May 2026',
          'A. Ramos',
          { text: 'PHP 0.00', emphasis: true, align: 'right' },
          { text: 'Ready To Lock', tone: 'green' },
        ],
      },
      {
        id: 'rec-2',
        cells: [
          { text: 'REC-2026-05-MB', emphasis: true },
          'Metrobank Main',
          'May 2026',
          'J. Cruz',
          { text: 'PHP 8,450', emphasis: true, align: 'right' },
          { text: 'Needs Review', tone: 'amber' },
        ],
      },
      {
        id: 'rec-3',
        cells: [
          { text: 'REC-2026-05-UB', emphasis: true },
          'UnionBank Payroll',
          'May 2026',
          'Treasury Team',
          { text: 'PHP 13,000', emphasis: true, align: 'right' },
          { text: 'In Progress', tone: 'blue' },
        ],
      },
      {
        id: 'rec-4',
        cells: [
          { text: 'REC-2026-04-RCBC', emphasis: true },
          'RCBC Reserve',
          'April 2026',
          'A. Ramos',
          { text: 'PHP 0.00', emphasis: true, align: 'right' },
          { text: 'Locked', tone: 'green' },
        ],
      },
    ],
    sidePanels: [],
  },
  {
    id: 'cash-flow',
    label: 'Cash Flow',
    description: 'Review cash position, movement, forecast, and account-level liquidity trends.',
    searchPlaceholder: 'Search account, horizon, forecast bucket, or treasury note',
    filters: ['Today', 'This Week', 'This Month', 'By Account'],
    actions: [
      { label: 'Refresh Forecast', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Cash View', icon: 'download', variant: 'ghost' },
      { label: 'Record Treasury Note', icon: 'plus', variant: 'primary' },
    ],
    metrics: [
      { label: 'Available Cash', value: 'PHP 8.42M', change: '+PHP 310k vs yesterday', trend: 'up' },
      { label: '7-Day Outflows', value: 'PHP 4.13M', change: 'Payroll and vendor heavy', trend: 'down' },
      { label: 'Forecasted Closing Cash', value: 'PHP 6.98M', change: 'After planned settlements', trend: 'neutral' },
      { label: 'Lowest Account Buffer', value: 'PHP 280k', change: 'UnionBank Payroll', trend: 'down' },
    ],
    tableTitle: 'Cash Position By Account',
    tableDescription: 'Monitor available balances, expected inflows, and planned outflows across treasury accounts.',
    columns: ['Account', 'Current Balance', 'Expected Inflows', 'Planned Outflows', 'Projected Close', 'Risk'],
    rows: [
      {
        id: 'cf-1',
        cells: [
          { text: 'BDO Operations', emphasis: true },
          { text: 'PHP 3.26M', emphasis: true, align: 'right' },
          { text: 'PHP 540k', align: 'right' },
          { text: 'PHP 1.12M', align: 'right' },
          { text: 'PHP 2.68M', emphasis: true, align: 'right' },
          { text: 'Low Risk', tone: 'green' },
        ],
      },
      {
        id: 'cf-2',
        cells: [
          { text: 'UnionBank Payroll', emphasis: true },
          { text: 'PHP 780k', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 500k', align: 'right' },
          { text: 'PHP 280k', emphasis: true, align: 'right' },
          { text: 'Watch', tone: 'amber' },
        ],
      },
      {
        id: 'cf-3',
        cells: [
          { text: 'Metrobank Main', emphasis: true },
          { text: 'PHP 2.94M', emphasis: true, align: 'right' },
          { text: 'PHP 1.24M', align: 'right' },
          { text: 'PHP 1.45M', align: 'right' },
          { text: 'PHP 2.73M', emphasis: true, align: 'right' },
          { text: 'Healthy', tone: 'green' },
        ],
      },
      {
        id: 'cf-4',
        cells: [
          { text: 'RCBC Reserve', emphasis: true },
          { text: 'PHP 1.44M', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 1.44M', emphasis: true, align: 'right' },
          { text: 'Reserve', tone: 'blue' },
        ],
      },
    ],
    sidePanels: [],
  },
];

export default function ReconciliationCashPositionPage() {
  return (
    <BankingCashPage
      eyebrow="Operations / Banking & Cash"
      title="Reconciliation & Cash Position"
      description="Monitor bank reconciliations and overall cash position so finance teams can keep balances aligned and liquidity visible."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Start Reconciliation', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
