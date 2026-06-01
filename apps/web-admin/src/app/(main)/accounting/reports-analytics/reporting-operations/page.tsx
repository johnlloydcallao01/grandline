import { ReportsAnalyticsPage, type ReportsAnalyticsTab } from '../_components/ReportsAnalyticsPage';

const tabs: ReportsAnalyticsTab[] = [
  {
    id: 'dashboard-summary',
    label: 'Dashboard Summary',
    description: 'Review the accounting dashboard summary output for receivables, payables, cash, and recent transaction activity.',
    searchPlaceholder: 'Search summary metric, invoice, bill, payment, or dashboard row',
    filters: ['Dashboard', 'Receivables', 'Payables', 'Cash'],
    actions: [
      { label: 'Open Dashboard', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Summary', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Receivables', value: 'PHP 4.28M', change: 'Dashboard receivables total', trend: 'up' },
      { label: 'Payables', value: 'PHP 2.14M', change: 'Dashboard payables total', trend: 'up' },
      { label: 'Cash & Bank', value: 'PHP 6.73M', change: 'Dashboard cash total', trend: 'up' },
      { label: 'Overdue Invoices', value: '18', change: 'Dashboard overdue count', trend: 'down' },
    ],
    tableTitle: 'Dashboard Summary Register',
    tableDescription: 'Overview rows aligned to the exposed accounting dashboard report endpoint in apps/cms.',
    columns: ['Section', 'Reference', 'Party / Account', 'Amount', 'Last Activity', 'Status'],
    rows: [
      {
        id: 'dash-1',
        cells: [
          'Recent Invoice',
          { text: 'INV-2026-1452', emphasis: true },
          'Grandline Corporate',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          '2026-05-31',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'dash-2',
        cells: [
          'Recent Bill',
          { text: 'BILL-2026-1184', emphasis: true },
          'Office Depot',
          { text: 'PHP 12,880', emphasis: true, align: 'right' },
          '2026-05-31',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'dash-3',
        cells: [
          'Payment Received',
          { text: 'RCT-2026-1184', emphasis: true },
          'BDO Operations',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          '2026-05-31',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'dash-4',
        cells: [
          'Payment Made',
          { text: 'PM-2026-083', emphasis: true },
          'Metrobank Main',
          { text: 'PHP 12,880', emphasis: true, align: 'right' },
          '2026-05-31',
          { text: 'Posted', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'report-catalog',
    label: 'Report Catalog',
    description: 'Review the report set currently exposed through accounting report endpoints and supporting report services.',
    searchPlaceholder: 'Search report name, endpoint, data source, or output type',
    filters: ['Exposed Endpoints', 'Registers', 'Ledger Reports', 'Analytics'],
    actions: [
      { label: 'Open Report Route', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Catalog', icon: 'refresh', variant: 'secondary' },
      { label: 'Download Catalog', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Exposed Report Routes', value: '11', change: 'HTTP endpoints under accounting reports', trend: 'up' },
      { label: 'Register Reports', value: '5', change: 'Invoice, bill, expense, and payment registers', trend: 'up' },
      { label: 'Snapshot Reports', value: '4', change: 'Dashboard, tax summary, cash activity, and aging', trend: 'up' },
      { label: 'Service-Only Reports', value: '3', change: 'Reports backed by services but not yet exposed as routes', trend: 'neutral' },
    ],
    tableTitle: 'Accounting Report Catalog',
    tableDescription: 'Catalog view aligned to the current report endpoints plus trial balance, general ledger, and profitability service support.',
    columns: ['Report Name', 'Backend Source', 'Output Scope', 'Route / Service', 'Primary Data', 'Status'],
    rows: [
      {
        id: 'catalog-1',
        cells: [
          { text: 'Dashboard Summary', emphasis: true },
          'route',
          'overview',
          '/api/accounting/reports/dashboard',
          'invoices, bills, payments',
          { text: 'Exposed', tone: 'green' },
        ],
      },
      {
        id: 'catalog-2',
        cells: [
          { text: 'Trial Balance', emphasis: true },
          'service',
          'ledger',
          'AccountingTrialBalanceService',
          'journal entry lines',
          { text: 'Service Ready', tone: 'blue' },
        ],
      },
      {
        id: 'catalog-3',
        cells: [
          { text: 'General Ledger', emphasis: true },
          'service',
          'ledger',
          'AccountingLedgerReportService',
          'journal entry lines',
          { text: 'Service Ready', tone: 'blue' },
        ],
      },
      {
        id: 'catalog-4',
        cells: [
          { text: 'Budget vs Actual', emphasis: true },
          'service',
          'analytics',
          'AccountingBudgetVarianceService',
          'budgets',
          { text: 'Service Ready', tone: 'blue' },
        ],
      },
    ],
  },
];

export default function ReportingOperationsPage() {
  return (
    <ReportsAnalyticsPage
      eyebrow="Operations / Reports & Analytics"
      title="Reporting Operations"
      description="Review the current dashboard summary and the catalog of accounting report endpoints and services already supported by the backend."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Open Report View', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
