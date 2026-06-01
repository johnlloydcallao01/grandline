import { ReportsAnalyticsPage, type ReportsAnalyticsTab } from '../_components/ReportsAnalyticsPage';

const tabs: ReportsAnalyticsTab[] = [
  {
    id: 'budget-vs-actual',
    label: 'Budget vs Actual',
    description: 'Review budget-variance output backed by accounting budgets and the budget-variance service.',
    searchPlaceholder: 'Search budget code, branch, department, project, budget amount, or variance',
    filters: ['Budget vs Actual', 'Annual', 'By Project', 'Negative Variance'],
    actions: [
      { label: 'Open Budget Report', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Budget View', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Budgets In Scope', value: '12', change: 'Budget records available for variance review', trend: 'up' },
      { label: 'Budget Amount', value: 'PHP 18.40M', change: 'Configured budget amount across selected budgets', trend: 'up' },
      { label: 'Actual Spend', value: 'PHP 14.92M', change: 'Actuals measured by variance service', trend: 'up' },
      { label: 'Variance', value: 'PHP 3.48M', change: 'Remaining amount against active budgets', trend: 'neutral' },
    ],
    tableTitle: 'Budget vs Actual Analysis',
    tableDescription: 'Budget variance view aligned to accounting budgets and the budget-variance service in apps/cms.',
    columns: ['Budget Code', 'Scope', 'Budget Amount', 'Actual Amount', 'Variance', 'Status'],
    rows: [
      {
        id: 'bva-1',
        cells: [
          { text: 'BUD-2026-OPS', emphasis: true },
          'Operations / Company',
          { text: 'PHP 6,000,000', emphasis: true, align: 'right' },
          { text: 'PHP 5,124,880', align: 'right' },
          { text: 'PHP 875,120', emphasis: true, align: 'right' },
          { text: 'Within Budget', tone: 'green' },
        ],
      },
      {
        id: 'bva-2',
        cells: [
          { text: 'BUD-2026-TRAIN', emphasis: true },
          'Training Delivery / Branch',
          { text: 'PHP 3,800,000', emphasis: true, align: 'right' },
          { text: 'PHP 4,018,420', align: 'right' },
          { text: 'PHP -218,420', emphasis: true, align: 'right' },
          { text: 'Over Budget', tone: 'amber' },
        ],
      },
      {
        id: 'bva-3',
        cells: [
          { text: 'BUD-2026-IT', emphasis: true },
          'IT / Department',
          { text: 'PHP 2,200,000', emphasis: true, align: 'right' },
          { text: 'PHP 1,642,300', align: 'right' },
          { text: 'PHP 557,700', emphasis: true, align: 'right' },
          { text: 'Within Budget', tone: 'green' },
        ],
      },
      {
        id: 'bva-4',
        cells: [
          { text: 'BUD-2026-PROJ07', emphasis: true },
          'Project 07',
          { text: 'PHP 1,500,000', emphasis: true, align: 'right' },
          { text: 'PHP 1,366,910', align: 'right' },
          { text: 'PHP 133,090', emphasis: true, align: 'right' },
          { text: 'Within Budget', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'project-profitability',
    label: 'Project Profitability',
    description: 'Review project profitability output using project revenue, expenses, payroll cost, time cost, and gross margin.',
    searchPlaceholder: 'Search project code, project name, status, revenue, cost, or margin',
    filters: ['Project Profitability', 'Active', 'Positive Margin', 'Negative Margin'],
    actions: [
      { label: 'Open Project Report', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Projects', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Projects In Scope', value: '9', change: 'Projects with profitability data available', trend: 'up' },
      { label: 'Revenue', value: 'PHP 9.86M', change: 'Posted invoice revenue linked to projects', trend: 'up' },
      { label: 'Total Cost', value: 'PHP 6.24M', change: 'Expense, payroll, and time cost combined', trend: 'up' },
      { label: 'Gross Profit', value: 'PHP 3.62M', change: 'Profitability service output', trend: 'neutral' },
    ],
    tableTitle: 'Project Profitability Analysis',
    tableDescription: 'Profitability view aligned to project, invoice, expense, payroll-entry, time-entry, and budget support in apps/cms.',
    columns: ['Project Code', 'Project Name', 'Revenue', 'Total Cost', 'Gross Profit', 'Status'],
    rows: [
      {
        id: 'pp-1',
        cells: [
          { text: 'PRJ-007', emphasis: true },
          'Maritime Batch 7 Rollout',
          { text: 'PHP 2,420,000', emphasis: true, align: 'right' },
          { text: 'PHP 1,604,400', align: 'right' },
          { text: 'PHP 815,600', emphasis: true, align: 'right' },
          { text: 'Profitable', tone: 'green' },
        ],
      },
      {
        id: 'pp-2',
        cells: [
          { text: 'PRJ-011', emphasis: true },
          'Harbor Expansion Training',
          { text: 'PHP 1,880,000', emphasis: true, align: 'right' },
          { text: 'PHP 1,264,210', align: 'right' },
          { text: 'PHP 615,790', emphasis: true, align: 'right' },
          { text: 'Profitable', tone: 'green' },
        ],
      },
      {
        id: 'pp-3',
        cells: [
          { text: 'PRJ-014', emphasis: true },
          'Simulator Upgrade Support',
          { text: 'PHP 1,120,000', emphasis: true, align: 'right' },
          { text: 'PHP 1,242,330', align: 'right' },
          { text: 'PHP -122,330', emphasis: true, align: 'right' },
          { text: 'Negative Margin', tone: 'amber' },
        ],
      },
      {
        id: 'pp-4',
        cells: [
          { text: 'PRJ-018', emphasis: true },
          'Corporate Cadet Program',
          { text: 'PHP 3,140,000', emphasis: true, align: 'right' },
          { text: 'PHP 2,126,500', align: 'right' },
          { text: 'PHP 1,013,500', emphasis: true, align: 'right' },
          { text: 'Profitable', tone: 'green' },
        ],
      },
    ],
  },
];

export default function PerformancePlanningAnalyticsPage() {
  return (
    <ReportsAnalyticsPage
      eyebrow="Operations / Reports & Analytics"
      title="Performance & Planning Analytics"
      description="Review budget-variance and project-profitability analytics backed by accounting budgets, projects, and profitability services."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Open Analytics View', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
