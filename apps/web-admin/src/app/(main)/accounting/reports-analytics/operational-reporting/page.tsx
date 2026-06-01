import { ReportsAnalyticsPage, type ReportsAnalyticsTab } from '../_components/ReportsAnalyticsPage';

const tabs: ReportsAnalyticsTab[] = [
  {
    id: 'sales-reports',
    label: 'Sales Reports',
    description: 'Review invoice and payments-received register outputs backed by the sales reporting service.',
    searchPlaceholder: 'Search invoice no., receipt no., customer, status, or amount',
    filters: ['Invoice Register', 'Payments Received', 'Posted', 'Partially Paid'],
    actions: [
      { label: 'Open Sales Report', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Sales', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Recent Invoices', value: '10', change: 'Latest invoice-register rows', trend: 'up' },
      { label: 'Recent Receipts', value: '10', change: 'Latest payments-received rows', trend: 'up' },
      { label: 'Open AR Total', value: 'PHP 4.28M', change: 'Receivables balance from sales reports', trend: 'up' },
      { label: 'Overdue Invoices', value: '18', change: 'Invoices overdue in aging support', trend: 'down' },
    ],
    tableTitle: 'Sales Report Register',
    tableDescription: 'Sales-side report rows aligned to invoice-register and payments-received-register support in apps/cms.',
    columns: ['Document No.', 'Date', 'Customer', 'Type', 'Total', 'Status'],
    rows: [
      {
        id: 'sales-1',
        cells: [
          { text: 'INV-2026-1452', emphasis: true },
          '2026-05-31',
          'Grandline Corporate',
          'Invoice',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'sales-2',
        cells: [
          { text: 'INV-2026-1449', emphasis: true },
          '2026-05-31',
          'Blue Anchor Marine',
          'Invoice',
          { text: 'PHP 188,240', emphasis: true, align: 'right' },
          { text: 'Partially Paid', tone: 'amber' },
        ],
      },
      {
        id: 'sales-3',
        cells: [
          { text: 'RCT-2026-1184', emphasis: true },
          '2026-05-31',
          'Grandline Corporate',
          'Payment Received',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'sales-4',
        cells: [
          { text: 'RCT-2026-1181', emphasis: true },
          '2026-05-31',
          'Blue Anchor Marine',
          'Payment Received',
          { text: 'PHP 88,240', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'purchase-reports',
    label: 'Purchase Reports',
    description: 'Review bill and payments-made register outputs backed by the expense reporting service.',
    searchPlaceholder: 'Search bill no., payment no., vendor, status, or amount',
    filters: ['Bill Register', 'Payments Made', 'Posted', 'Partially Paid'],
    actions: [
      { label: 'Open Purchase Report', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Purchases', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Recent Bills', value: '10', change: 'Latest bill-register rows', trend: 'up' },
      { label: 'Recent Payments', value: '10', change: 'Latest payments-made rows', trend: 'up' },
      { label: 'Open AP Total', value: 'PHP 2.14M', change: 'Payables balance from purchase reports', trend: 'up' },
      { label: 'Overdue Bills', value: '9', change: 'Bills overdue in aging support', trend: 'down' },
    ],
    tableTitle: 'Purchase Report Register',
    tableDescription: 'Purchase-side report rows aligned to bill-register and payments-made-register support in apps/cms.',
    columns: ['Document No.', 'Date', 'Vendor', 'Type', 'Total', 'Status'],
    rows: [
      {
        id: 'purchase-1',
        cells: [
          { text: 'BILL-2026-1184', emphasis: true },
          '2026-05-31',
          'Office Depot',
          'Bill',
          { text: 'PHP 12,880', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'purchase-2',
        cells: [
          { text: 'BILL-2026-1181', emphasis: true },
          '2026-05-31',
          'City Water',
          'Bill',
          { text: 'PHP 6,240', emphasis: true, align: 'right' },
          { text: 'Partially Paid', tone: 'amber' },
        ],
      },
      {
        id: 'purchase-3',
        cells: [
          { text: 'PM-2026-083', emphasis: true },
          '2026-05-31',
          'Office Depot',
          'Payment Made',
          { text: 'PHP 12,880', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'purchase-4',
        cells: [
          { text: 'PM-2026-081', emphasis: true },
          '2026-05-30',
          'City Water',
          'Payment Made',
          { text: 'PHP 6,240', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'expense-reports',
    label: 'Expense Reports',
    description: 'Review posted expense-register output using expense number, expense date, vendor, and total amount fields.',
    searchPlaceholder: 'Search expense no., expense date, vendor, status, or amount',
    filters: ['Expense Register', 'Posted', 'With Vendor', 'Recent'],
    actions: [
      { label: 'Open Expense Report', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Expenses', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Posted Expenses', value: '14', change: 'Rows in expense-register output', trend: 'up' },
      { label: 'Expense Total', value: 'PHP 286,440', change: 'Posted expense amount in scope', trend: 'up' },
      { label: 'With Tax Code', value: '8', change: 'Posted expenses carrying tax data', trend: 'neutral' },
      { label: 'With Journal Link', value: '14', change: 'Expense rows traceable to posted journals', trend: 'up' },
    ],
    tableTitle: 'Expense Register',
    tableDescription: 'Expense report rows aligned to the exposed expense-register endpoint in apps/cms.',
    columns: ['Expense No.', 'Date', 'Vendor', 'Currency', 'Total', 'Status'],
    rows: [
      {
        id: 'expense-1',
        cells: [
          { text: 'EXP-2026-1173', emphasis: true },
          '2026-05-30',
          'Cebu Pacific',
          'PHP',
          { text: 'PHP 18,420', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'expense-2',
        cells: [
          { text: 'EXP-2026-1168', emphasis: true },
          '2026-05-30',
          'City Water',
          'PHP',
          { text: 'PHP 6,240', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'expense-3',
        cells: [
          { text: 'EXP-2026-1162', emphasis: true },
          '2026-05-29',
          'Grab',
          'PHP',
          { text: 'PHP 1,450', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'expense-4',
        cells: [
          { text: 'EXP-2026-1154', emphasis: true },
          '2026-05-28',
          'Office Depot',
          'PHP',
          { text: 'PHP 12,880', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'cash-tax-aging',
    label: 'Cash, Tax & Aging',
    description: 'Review cash activity, tax summary, and AR/AP aging outputs backed by exposed report endpoints and report services.',
    searchPlaceholder: 'Search bank account, tax code, customer, vendor, aging bucket, or amount',
    filters: ['Cash Activity', 'Tax Summary', 'AR Aging', 'AP Aging'],
    actions: [
      { label: 'Open Report', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Reports', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Cash Activity Rows', value: '31', change: 'Posted cash inflow/outflow rows', trend: 'up' },
      { label: 'Tax Summary Codes', value: '9', change: 'Tax-code rows in summary output', trend: 'neutral' },
      { label: 'AR Aging Rows', value: '18', change: 'Receivable aging balances', trend: 'up' },
      { label: 'AP Aging Rows', value: '9', change: 'Payable aging balances', trend: 'up' },
    ],
    tableTitle: 'Cash / Tax / Aging Snapshot',
    tableDescription: 'Mixed operational report snapshot aligned to cash-activity, tax-summary, and aging-report support in apps/cms.',
    columns: ['Report Type', 'Reference', 'Party / Account', 'Bucket / Scope', 'Amount', 'Status'],
    rows: [
      {
        id: 'cta-1',
        cells: [
          'Cash Activity',
          { text: 'RCT-2026-1184', emphasis: true },
          'BDO Operations',
          'inflow',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'cta-2',
        cells: [
          'Tax Summary',
          { text: 'VAT12', emphasis: true },
          'Standard VAT 12%',
          'both',
          { text: 'PHP 712,440', emphasis: true, align: 'right' },
          { text: 'Active', tone: 'blue' },
        ],
      },
      {
        id: 'cta-3',
        cells: [
          'AR Aging',
          { text: 'INV-2026-1449', emphasis: true },
          'Blue Anchor Marine',
          '1-30',
          { text: 'PHP 188,240', emphasis: true, align: 'right' },
          { text: 'Overdue', tone: 'amber' },
        ],
      },
      {
        id: 'cta-4',
        cells: [
          'AP Aging',
          { text: 'BILL-2026-1181', emphasis: true },
          'City Water',
          '1-30',
          { text: 'PHP 6,240', emphasis: true, align: 'right' },
          { text: 'Overdue', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function OperationalReportingPage() {
  return (
    <ReportsAnalyticsPage
      eyebrow="Operations / Reports & Analytics"
      title="Operational Reporting"
      description="Review commercial, expense, cash, tax, and aging reports backed by the current exposed reporting endpoints and services."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Open Report', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
