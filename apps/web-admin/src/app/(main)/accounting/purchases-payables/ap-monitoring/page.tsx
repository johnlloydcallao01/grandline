import { PurchasesPayablesPage, type PurchasesPayablesTab } from '../_components/PurchasesPayablesPage';

const tabs: PurchasesPayablesTab[] = [
  {
    id: 'accounts-payable-aging',
    label: 'Accounts Payable Aging',
    description: 'Review accounts payable aging using balance due, due dates, and days-overdue buckets from open bills.',
    searchPlaceholder: 'Search vendor, bill no., due date, balance, or aging bucket',
    filters: ['Current', '1-30 Days', '31-60 Days', 'Over 90 Days'],
    actions: [
      { label: 'Refresh Aging', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Open AP Balance', value: 'PHP 2.46M', change: 'From posted and partially paid bills', trend: 'neutral' },
      { label: 'Overdue Bills', value: '17', change: 'Bills already past due date', trend: 'down' },
      { label: '1-30 Day Bucket', value: 'PHP 684,500', change: 'Nearest overdue concentration', trend: 'down' },
      { label: 'Over 90 Days', value: 'PHP 118,800', change: 'Longest-aged payable exposure', trend: 'down' },
    ],
    tableTitle: 'AP Aging Detail',
    tableDescription: 'Bill-level payable aging using due dates, remaining balances, and days-overdue calculations.',
    columns: ['Vendor', 'Bill No.', 'Due Date', 'Balance Due', 'Days Overdue', 'Aging Bucket'],
    rows: [
      {
        id: 'aging-1',
        cells: [
          { text: 'Blue Anchor Marine', emphasis: true },
          'BILL-2026-1092',
          '2026-05-02',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          '29',
          { text: '1-30 Days', tone: 'amber' },
        ],
      },
      {
        id: 'aging-2',
        cells: [
          { text: 'Harbor Training Ltd.', emphasis: true },
          'BILL-2026-1038',
          '2026-04-18',
          { text: 'PHP 24,500', emphasis: true, align: 'right' },
          '43',
          { text: '31-60 Days', tone: 'amber' },
        ],
      },
      {
        id: 'aging-3',
        cells: [
          { text: 'Office Depot', emphasis: true },
          'BILL-2026-1184',
          '2026-06-15',
          { text: 'PHP 48,200', emphasis: true, align: 'right' },
          '0',
          { text: 'Current', tone: 'green' },
        ],
      },
      {
        id: 'aging-4',
        cells: [
          { text: 'Legacy Utility Group', emphasis: true },
          'BILL-2025-912',
          '2026-01-12',
          { text: 'PHP 118,800', emphasis: true, align: 'right' },
          '140',
          { text: 'Over 90 Days', tone: 'red' },
        ],
      },
    ],
  },
  {
    id: 'due-date-queue',
    label: 'Due Date Queue',
    description: 'Track open bills by due date, remaining balance, and settlement status for daily AP review.',
    searchPlaceholder: 'Search bill no., vendor, due date, balance due, or status',
    filters: ['Due Today', 'Due This Week', 'Overdue', 'Partially Paid'],
    actions: [
      { label: 'Open Bill Queue', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Queue', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Due Today', value: '4', change: 'Immediate settlement review needed', trend: 'neutral' },
      { label: 'Due In 7 Days', value: '12', change: 'Near-term disbursement planning window', trend: 'up' },
      { label: 'Partially Paid Bills', value: '9', change: 'Bills with remaining open balances', trend: 'neutral' },
      { label: 'Approved Unposted', value: '6', change: 'Ready for posting workflow', trend: 'up' },
    ],
    tableTitle: 'Open Bill Due Queue',
    tableDescription: 'Daily payable queue focused on due dates, balance due, and current document status.',
    columns: ['Bill No.', 'Vendor', 'Bill Date', 'Due Date', 'Balance Due', 'Status'],
    rows: [
      {
        id: 'due-1',
        cells: [
          { text: 'BILL-2026-1179', emphasis: true },
          'Cebu Pacific',
          '2026-05-30',
          '2026-06-09',
          { text: 'PHP 126,880', emphasis: true, align: 'right' },
          { text: 'Approved', tone: 'amber' },
        ],
      },
      {
        id: 'due-2',
        cells: [
          { text: 'BILL-2026-1162', emphasis: true },
          'Blue Anchor Marine',
          '2026-05-28',
          '2026-06-05',
          { text: 'PHP 94,600', emphasis: true, align: 'right' },
          { text: 'Partially Paid', tone: 'amber' },
        ],
      },
      {
        id: 'due-3',
        cells: [
          { text: 'BILL-2026-1170', emphasis: true },
          'City Water',
          '2026-05-29',
          '2026-06-28',
          { text: 'PHP 36,440', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'due-4',
        cells: [
          { text: 'BILL-2026-1184', emphasis: true },
          'Office Depot',
          '2026-05-31',
          '2026-06-15',
          { text: 'PHP 48,200', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
    ],
  },
];

export default function ApMonitoringPage() {
  return (
    <PurchasesPayablesPage
      eyebrow="Operations / Purchases & Payables"
      title="AP Monitoring"
      description="Monitor payable aging and open-bill due dates so AP exposure and settlement timing stay visible."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Download AP View', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
