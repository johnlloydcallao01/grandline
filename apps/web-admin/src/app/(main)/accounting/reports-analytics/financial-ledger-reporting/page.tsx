import { ReportsAnalyticsPage, type ReportsAnalyticsTab } from '../_components/ReportsAnalyticsPage';

const tabs: ReportsAnalyticsTab[] = [
  {
    id: 'trial-balance',
    label: 'Trial Balance',
    description: 'Review trial-balance output by account code, account name, type, debit, credit, and closing balance.',
    searchPlaceholder: 'Search account code, account name, type, debit, credit, or closing balance',
    filters: ['Trial Balance', 'Non-Zero', 'Assets', 'Liabilities'],
    actions: [
      { label: 'Open Trial Balance', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Report', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Accounts In Scope', value: '63', change: 'Accounts with debit or credit movement', trend: 'up' },
      { label: 'Total Debit', value: 'PHP 12.48M', change: 'Aggregated debit movement', trend: 'up' },
      { label: 'Total Credit', value: 'PHP 12.48M', change: 'Aggregated credit movement', trend: 'up' },
      { label: 'Difference', value: 'PHP 0', change: 'Balanced report output', trend: 'neutral' },
    ],
    tableTitle: 'Trial Balance Report',
    tableDescription: 'Trial-balance rows aligned to the real trial-balance service and query support in apps/cms.',
    columns: ['Account Code', 'Account Name', 'Type', 'Total Debit', 'Total Credit', 'Closing Balance'],
    rows: [
      {
        id: 'tb-1',
        cells: [
          { text: '1100', emphasis: true },
          'Accounts Receivable',
          'asset',
          { text: 'PHP 1,428,880', emphasis: true, align: 'right' },
          { text: 'PHP 214,600', align: 'right' },
          { text: 'PHP 1,214,280', emphasis: true, align: 'right' },
        ],
      },
      {
        id: 'tb-2',
        cells: [
          { text: '2100', emphasis: true },
          'Accrued Liabilities',
          'liability',
          { text: 'PHP 68,500', align: 'right' },
          { text: 'PHP 612,400', emphasis: true, align: 'right' },
          { text: 'PHP 543,900', emphasis: true, align: 'right' },
        ],
      },
      {
        id: 'tb-3',
        cells: [
          { text: '4100', emphasis: true },
          'Service Revenue',
          'income',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 4,286,300', emphasis: true, align: 'right' },
          { text: 'PHP 4,286,300', emphasis: true, align: 'right' },
        ],
      },
      {
        id: 'tb-4',
        cells: [
          { text: '5200', emphasis: true },
          'Utilities Expense',
          'expense',
          { text: 'PHP 684,110', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 684,110', emphasis: true, align: 'right' },
        ],
      },
    ],
  },
  {
    id: 'general-ledger',
    label: 'General Ledger',
    description: 'Review posted and reversed journal-line activity by account, posting date, debit, credit, and running balance.',
    searchPlaceholder: 'Search entry no., account, posting date, debit, credit, or running balance',
    filters: ['General Ledger', 'Posted', 'Reversed', 'By Account'],
    actions: [
      { label: 'Open General Ledger', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Report', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Ledger Rows', value: '426', change: 'Rows returned from ledger reporting', trend: 'up' },
      { label: 'Posted Journals', value: '74', change: 'Headers included in ledger output', trend: 'up' },
      { label: 'Reversed Journals', value: '5', change: 'Reversal visibility retained', trend: 'neutral' },
      { label: 'Accounts Hit', value: '63', change: 'Accounts represented in ledger lines', trend: 'up' },
    ],
    tableTitle: 'General Ledger Report',
    tableDescription: 'General-ledger lines aligned to the real ledger-report service and query support in apps/cms.',
    columns: ['Posting Date', 'Entry No.', 'Account', 'Debit', 'Credit', 'Running Balance'],
    rows: [
      {
        id: 'gl-1',
        cells: [
          '2026-05-31',
          { text: 'JE-2026-0904', emphasis: true },
          '1100 Accounts Receivable',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 1,428,880', emphasis: true, align: 'right' },
        ],
      },
      {
        id: 'gl-2',
        cells: [
          '2026-05-31',
          { text: 'JE-2026-0904', emphasis: true },
          '4100 Service Revenue',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 188,848', emphasis: true, align: 'right' },
          { text: 'PHP 4,286,300', emphasis: true, align: 'right' },
        ],
      },
      {
        id: 'gl-3',
        cells: [
          '2026-05-30',
          { text: 'JE-2026-0896', emphasis: true },
          '5200 Utilities Expense',
          { text: 'PHP 46,220', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 684,110', emphasis: true, align: 'right' },
        ],
      },
      {
        id: 'gl-4',
        cells: [
          '2026-05-29',
          { text: 'JE-2026-0888', emphasis: true },
          '2100 Accrued Liabilities',
          { text: 'PHP 68,500', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 212,800', emphasis: true, align: 'right' },
        ],
      },
    ],
  },
  {
    id: 'asset-register',
    label: 'Asset Register',
    description: 'Review fixed-asset register rows using asset code, category, acquisition cost, accumulated depreciation, and carrying amount.',
    searchPlaceholder: 'Search asset code, asset name, category, branch, or status',
    filters: ['Asset Register', 'Active', 'Depreciating', 'By Category'],
    actions: [
      { label: 'Open Asset Register', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Report', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Registered Assets', value: '24', change: 'Assets included in register output', trend: 'up' },
      { label: 'Gross Cost', value: 'PHP 8.12M', change: 'Total acquisition cost in scope', trend: 'up' },
      { label: 'Accumulated Depn.', value: 'PHP 2.04M', change: 'Depreciation captured in register', trend: 'up' },
      { label: 'Net Book Value', value: 'PHP 6.08M', change: 'Remaining carrying amount', trend: 'neutral' },
    ],
    tableTitle: 'Asset Register Report',
    tableDescription: 'Fixed-asset register aligned to the exposed asset-register report endpoint in apps/cms.',
    columns: ['Asset Code', 'Asset Name', 'Category', 'Acquisition Cost', 'Accumulated Depn.', 'Status'],
    rows: [
      {
        id: 'asset-1',
        cells: [
          { text: 'FA-0008', emphasis: true },
          'Training Simulator Unit',
          'equipment',
          { text: 'PHP 2,450,000', emphasis: true, align: 'right' },
          { text: 'PHP 612,500', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'asset-2',
        cells: [
          { text: 'FA-0011', emphasis: true },
          'Cebu Branch Van',
          'vehicle',
          { text: 'PHP 1,320,000', emphasis: true, align: 'right' },
          { text: 'PHP 352,000', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'asset-3',
        cells: [
          { text: 'FA-0015', emphasis: true },
          'Server Rack Upgrade',
          'equipment',
          { text: 'PHP 680,000', emphasis: true, align: 'right' },
          { text: 'PHP 102,000', align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'asset-4',
        cells: [
          { text: 'FA-0003', emphasis: true },
          'Legacy Projector Set',
          'equipment',
          { text: 'PHP 240,000', emphasis: true, align: 'right' },
          { text: 'PHP 240,000', align: 'right' },
          { text: 'Disposed', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function FinancialLedgerReportingPage() {
  return (
    <ReportsAnalyticsPage
      eyebrow="Operations / Reports & Analytics"
      title="Financial & Ledger Reporting"
      description="Review ledger-oriented accounting reports supported by trial-balance, general-ledger, and asset-register backend capabilities."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Open Report', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
