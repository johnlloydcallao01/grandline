import { ProjectsTimePage, type ProjectsTimeTab } from '../_components/ProjectsTimePage';

const tabs: ProjectsTimeTab[] = [
  {
    id: 'project-expenses',
    label: 'Project Expenses',
    description:
      'Review posted project-linked expenses used in profitability calculations, grouped by project, document number, vendor, and total cost.',
    searchPlaceholder: 'Search project, expense number, vendor, posting status, or project expense total',
    filters: ['Project Expenses', 'Posted', 'High Cost', 'Current Month'],
    actions: [
      { label: 'Open Expense', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Expenses', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Posted Project Expenses', value: '47', change: 'Expense records tied to projects and already posted', trend: 'up' },
      { label: 'Direct Expense Cost', value: 'PHP 1.18M', change: 'Direct project expense cost in the current view', trend: 'up' },
      { label: 'Average Project Expense', value: 'PHP 25.1K', change: 'Average posted project-expense amount', trend: 'neutral' },
      { label: 'Projects With Expenses', value: '14', change: 'Projects currently carrying posted direct expenses', trend: 'up' },
    ],
    tableTitle: 'Project Expense Register',
    tableDescription:
      'Expense rows aligned to project-linked posted records in `accounting-expenses`, matching the cost components used by the project profitability service.',
    columns: ['Expense Number', 'Project', 'Vendor', 'Posting Date', 'Total Cost', 'Status'],
    rows: [
      {
        id: 'proj-exp-1',
        cells: [
          { text: 'EXP-2026-0511', emphasis: true },
          'BlueWave Cadet Cohort 1',
          'Harbor Uniform Supplies',
          '2026-05-12',
          { text: 'PHP 84,000', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'proj-exp-2',
        cells: [
          { text: 'EXP-2026-0524', emphasis: true },
          'Oceanic Fleet Upskilling',
          'Ocean View Venue Services',
          '2026-05-18',
          { text: 'PHP 112,500', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'proj-exp-3',
        cells: [
          { text: 'EXP-2026-0533', emphasis: true },
          'Simulator Lab Rollout',
          'Marine Tech Installers',
          '2026-05-24',
          { text: 'PHP 168,000', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'proj-exp-4',
        cells: [
          { text: 'EXP-2026-0541', emphasis: true },
          'BST Internal Refresh',
          'Training Material House',
          '2026-05-27',
          { text: 'PHP 36,400', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'project-billing',
    label: 'Project Billing',
    description:
      'Review posted and collectible project-linked invoices used as the revenue side of project profitability calculations.',
    searchPlaceholder: 'Search project, invoice number, customer, invoice total, balance due, or invoice status',
    filters: ['Project Billing', 'Posted', 'Partially Paid', 'Paid'],
    actions: [
      { label: 'Open Invoice', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Billing', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Project Invoices', value: '39', change: 'Project-linked invoices contributing to profitability', trend: 'up' },
      { label: 'Project Revenue', value: 'PHP 3.64M', change: 'Revenue tied to posted, partially paid, or paid invoices', trend: 'up' },
      { label: 'Average Invoice', value: 'PHP 93.3K', change: 'Average value of project billing records', trend: 'neutral' },
      { label: 'Open Project AR', value: 'PHP 844K', change: 'Remaining collectible balance on project invoices', trend: 'neutral' },
    ],
    tableTitle: 'Project Billing Register',
    tableDescription:
      'Invoice rows aligned to project-linked records in `accounting-invoices`, matching the revenue inputs used by the project profitability service.',
    columns: ['Invoice Number', 'Project', 'Customer', 'Posting Date', 'Total', 'Status'],
    rows: [
      {
        id: 'proj-inv-1',
        cells: [
          { text: 'INV-2026-0458', emphasis: true },
          'BlueWave Cadet Cohort 1',
          'BlueWave Manning Services',
          '2026-05-13',
          { text: 'PHP 420,000', align: 'right' },
          { text: 'partially_paid', tone: 'blue' },
        ],
      },
      {
        id: 'proj-inv-2',
        cells: [
          { text: 'INV-2026-0467', emphasis: true },
          'Oceanic Fleet Upskilling',
          'Oceanic Fleet Management',
          '2026-05-19',
          { text: 'PHP 318,000', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'proj-inv-3',
        cells: [
          { text: 'INV-2026-0479', emphasis: true },
          'Simulator Lab Rollout',
          'Grandline Capital Program',
          '2026-05-25',
          { text: 'PHP 610,000', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'proj-inv-4',
        cells: [
          { text: 'INV-2026-0483', emphasis: true },
          'BST Internal Refresh',
          'Grandline Training Ops',
          '2026-05-28',
          { text: 'PHP 88,000', align: 'right' },
          { text: 'paid', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'project-profitability',
    label: 'Project Profitability',
    description:
      'Review project profitability output using revenue, direct expenses, payroll cost, time cost, tracked hours, total cost, gross profit, margin, budget, and budget variance.',
    searchPlaceholder: 'Search project code, revenue, time cost, total cost, gross profit, margin, or budget variance',
    filters: ['Profitability', 'Positive Margin', 'Negative Variance', 'High Revenue'],
    actions: [
      { label: 'Open Profitability', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Profitability', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Projects With Profitability', value: '18', change: 'Projects carrying enough linked finance data for profitability review', trend: 'up' },
      { label: 'Gross Profit', value: 'PHP 1.12M', change: 'Current gross profit across selected project set', trend: 'up' },
      { label: 'Tracked Hours', value: '1,486h', change: 'Time hours flowing into profitability cost calculations', trend: 'up' },
      { label: 'Average Gross Margin', value: '30.8%', change: 'Average gross margin across current project rows', trend: 'neutral' },
    ],
    tableTitle: 'Project Profitability Register',
    tableDescription:
      'Profitability view aligned to `AccountingProjectProfitabilityService.getProjectProfitability()`, including revenue, cost stack, gross profit, margin, and budget variance.',
    columns: ['Project Code', 'Revenue', 'Total Cost', 'Gross Profit', 'Gross Margin', 'Budget Variance'],
    rows: [
      {
        id: 'profit-1',
        cells: [
          { text: 'PRJ-20260601001', emphasis: true },
          { text: 'PHP 420,000', align: 'right' },
          { text: 'PHP 286,500', align: 'right' },
          { text: 'PHP 133,500', align: 'right' },
          { text: '31.8%', tone: 'green' },
          { text: 'PHP 18,500', align: 'right' },
        ],
      },
      {
        id: 'profit-2',
        cells: [
          { text: 'PRJ-20260601003', emphasis: true },
          { text: 'PHP 318,000', align: 'right' },
          { text: 'PHP 229,400', align: 'right' },
          { text: 'PHP 88,600', align: 'right' },
          { text: '27.9%', tone: 'blue' },
          { text: 'PHP -11,400', align: 'right' },
        ],
      },
      {
        id: 'profit-3',
        cells: [
          { text: 'PRJ-20260601004', emphasis: true },
          { text: 'PHP 610,000', align: 'right' },
          { text: 'PHP 472,300', align: 'right' },
          { text: 'PHP 137,700', align: 'right' },
          { text: '22.6%', tone: 'blue' },
          { text: 'PHP -32,300', align: 'right' },
        ],
      },
      {
        id: 'profit-4',
        cells: [
          { text: 'PRJ-20260601002', emphasis: true },
          { text: 'PHP 88,000', align: 'right' },
          { text: 'PHP 64,800', align: 'right' },
          { text: 'PHP 23,200', align: 'right' },
          { text: '26.4%', tone: 'blue' },
          { text: 'PHP 6,200', align: 'right' },
        ],
      },
    ],
  },
];

export default function ProjectFinancePage() {
  return (
    <ProjectsTimePage
      eyebrow="Advanced Finance / Projects & Time"
      title="Project Finance"
      description="Review project-linked expenses, project billing, and profitability outputs that combine revenue, direct costs, payroll, time cost, and budget variance."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Export Finance View', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
