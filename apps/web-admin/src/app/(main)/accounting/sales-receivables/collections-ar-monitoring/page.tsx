import { SalesReceivablesPage, type SalesReceivablesTab } from '../_components/SalesReceivablesPage';

const tabs: SalesReceivablesTab[] = [
  {
    id: 'overdue-invoices',
    label: 'Overdue Invoices',
    description: 'Track overdue receivables using invoice due dates, remaining balances, and customer visibility for follow-up.',
    searchPlaceholder: 'Search customer, invoice no., due date, balance due, or days overdue',
    filters: ['Overdue', 'Due Today', 'Partially Paid', 'High Balance'],
    actions: [
      { label: 'Open AR Queue', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Queue', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Overdue Invoices', value: '21', change: 'Invoices already beyond due date', trend: 'down' },
      { label: 'Overdue Balance', value: 'PHP 1.04M', change: 'Open receivable exposure needing follow-up', trend: 'down' },
      { label: 'Partially Paid Overdue', value: '7', change: 'Invoices with residual unpaid balances', trend: 'neutral' },
      { label: 'Due Today', value: '3', change: 'Immediate collection review window', trend: 'neutral' },
    ],
    tableTitle: 'Overdue Receivable Queue',
    tableDescription: 'Operational AR queue focused on overdue invoices, remaining balances, and customer follow-up priority.',
    columns: ['Customer', 'Invoice No.', 'Due Date', 'Balance Due', 'Days Overdue', 'Status'],
    rows: [
      {
        id: 'od-1',
        cells: [
          { text: 'Grandline Corporate', emphasis: true },
          'INV-2026-1394',
          '2026-05-04',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          '27',
          { text: 'Partially Paid', tone: 'amber' },
        ],
      },
      {
        id: 'od-2',
        cells: [
          { text: 'Blue Anchor Marine', emphasis: true },
          'INV-2026-1388',
          '2026-04-21',
          { text: 'PHP 128,400', emphasis: true, align: 'right' },
          '40',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'od-3',
        cells: [
          { text: 'Harbor Training Ltd.', emphasis: true },
          'INV-2026-1377',
          '2026-03-28',
          { text: 'PHP 96,440', emphasis: true, align: 'right' },
          '64',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'od-4',
        cells: [
          { text: 'SM Shipping Corp.', emphasis: true },
          'INV-2026-1361',
          '2026-01-14',
          { text: 'PHP 182,800', emphasis: true, align: 'right' },
          '137',
          { text: 'Posted', tone: 'red' },
        ],
      },
    ],
  },
  {
    id: 'accounts-receivable-aging',
    label: 'Accounts Receivable Aging',
    description: 'Review accounts receivable aging using balance due, due dates, and days-overdue buckets from open invoices.',
    searchPlaceholder: 'Search customer, invoice no., due date, balance, or aging bucket',
    filters: ['Current', '1-30 Days', '31-60 Days', 'Over 90 Days'],
    actions: [
      { label: 'Refresh Aging', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Open AR Balance', value: 'PHP 3.18M', change: 'From posted and partially paid invoices', trend: 'neutral' },
      { label: 'Overdue Invoices', value: '21', change: 'Invoices already past due date', trend: 'down' },
      { label: '1-30 Day Bucket', value: 'PHP 724,600', change: 'Nearest overdue concentration', trend: 'down' },
      { label: 'Over 90 Days', value: 'PHP 204,300', change: 'Longest-aged receivable exposure', trend: 'down' },
    ],
    tableTitle: 'AR Aging Detail',
    tableDescription: 'Invoice-level receivable aging using due dates, remaining balances, and days-overdue calculations.',
    columns: ['Customer', 'Invoice No.', 'Due Date', 'Balance Due', 'Days Overdue', 'Aging Bucket'],
    rows: [
      {
        id: 'aging-1',
        cells: [
          { text: 'Grandline Corporate', emphasis: true },
          'INV-2026-1394',
          '2026-05-04',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          '27',
          { text: '1-30 Days', tone: 'amber' },
        ],
      },
      {
        id: 'aging-2',
        cells: [
          { text: 'Blue Anchor Marine', emphasis: true },
          'INV-2026-1388',
          '2026-04-21',
          { text: 'PHP 128,400', emphasis: true, align: 'right' },
          '40',
          { text: '31-60 Days', tone: 'amber' },
        ],
      },
      {
        id: 'aging-3',
        cells: [
          { text: 'SM Shipping Corp.', emphasis: true },
          'INV-2026-1452',
          '2026-06-15',
          { text: 'PHP 186,500', emphasis: true, align: 'right' },
          '0',
          { text: 'Current', tone: 'green' },
        ],
      },
      {
        id: 'aging-4',
        cells: [
          { text: 'Legacy Freight Group', emphasis: true },
          'INV-2025-908',
          '2026-01-12',
          { text: 'PHP 204,300', emphasis: true, align: 'right' },
          '140',
          { text: 'Over 90 Days', tone: 'red' },
        ],
      },
    ],
  },
];

export default function CollectionsArMonitoringPage() {
  return (
    <SalesReceivablesPage
      eyebrow="Operations / Sales & Receivables"
      title="Collections & AR Monitoring"
      description="Monitor overdue receivables and AR aging so customer balances and collection priorities stay visible."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Download AR View', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
