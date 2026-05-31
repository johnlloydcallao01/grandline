import { JournalsLedgerPage, type JournalsLedgerTab } from '../_components/JournalsLedgerPage';

const tabs: JournalsLedgerTab[] = [
  {
    id: 'general-ledger',
    label: 'General Ledger',
    description: 'Browse posted and reversed journal-line activity by account with posting dates, descriptions, and running balances.',
    searchPlaceholder: 'Search account code, account name, entry no., posting date, or memo',
    filters: ['Posted', 'Reversed', 'With Running Balance', 'By Account'],
    actions: [
      { label: 'Open Ledger View', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Ledger', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Ledger Rows', value: '426', change: 'Lines available to general-ledger reporting', trend: 'up' },
      { label: 'Posted Journals', value: '74', change: 'Headers included in ledger output', trend: 'up' },
      { label: 'Reversed Journals', value: '5', change: 'Still visible in ledger reporting scope', trend: 'neutral' },
      { label: 'Accounts Hit', value: '63', change: 'Accounts with ledger movement in range', trend: 'up' },
    ],
    tableTitle: 'General Ledger View',
    tableDescription: 'General-ledger rows derived from posted and reversed journal lines with account and running-balance context.',
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
    id: 'trial-balance',
    label: 'Trial Balance',
    description: 'Review trial-balance totals by account using posted and reversed journals across a period or date range.',
    searchPlaceholder: 'Search account code, account name, account type, debit, or credit',
    filters: ['All Accounts', 'Non-Zero', 'Assets', 'Liabilities'],
    actions: [
      { label: 'Refresh Trial Balance', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Accounts In TB', value: '63', change: 'Accounts with debit or credit movement', trend: 'up' },
      { label: 'Total Debit', value: 'PHP 12.48M', change: 'Aggregated debit movement in scope', trend: 'up' },
      { label: 'Total Credit', value: 'PHP 12.48M', change: 'Aggregated credit movement in scope', trend: 'up' },
      { label: 'Balanced Result', value: 'PHP 0', change: 'Debit-credit difference across the report', trend: 'neutral' },
    ],
    tableTitle: 'Trial Balance View',
    tableDescription: 'Trial-balance rows by account code and type with total debit, total credit, and closing balance.',
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
    id: 'journal-register',
    label: 'Journal Register',
    description: 'Review posted and reversed journal headers as a reporting-oriented register built from journal entry records.',
    searchPlaceholder: 'Search entry no., source type, posting date, memo, or status',
    filters: ['Posted', 'Reversed', 'Adjustment', 'System'],
    actions: [
      { label: 'Refresh Register', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Register Entries', value: '79', change: 'Posted and reversed journals in reporting scope', trend: 'up' },
      { label: 'System-Generated', value: '51', change: 'Entries created by downstream posting services', trend: 'up' },
      { label: 'Manual / Adjustment', value: '28', change: 'Directly managed journal workflows', trend: 'neutral' },
      { label: 'Reversal Links', value: '5', change: 'Reversal pairs still visible in reports', trend: 'neutral' },
    ],
    tableTitle: 'Journal Register',
    tableDescription: 'Reporting register of journal headers with source type, posting date, totals, and current journal status.',
    columns: ['Entry No.', 'Posting Date', 'Source Type', 'Reference No.', 'Total Debit', 'Status'],
    rows: [
      {
        id: 'jr-1',
        cells: [
          { text: 'JE-2026-0904', emphasis: true },
          '2026-05-31',
          'system',
          'INV-2026-1452',
          { text: 'PHP 428,880', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'jr-2',
        cells: [
          { text: 'JE-2026-0908', emphasis: true },
          '2026-05-31',
          'adjustment',
          'ADJ-MAY-END',
          { text: 'PHP 184,600', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'jr-3',
        cells: [
          { text: 'JE-2026-0888', emphasis: true },
          '2026-05-29',
          'reversal',
          'JE-2026-0875',
          { text: 'PHP 68,500', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'jr-4',
        cells: [
          { text: 'JE-2026-0841', emphasis: true },
          '2026-01-01',
          'opening_balance',
          'OPENING-2026',
          { text: 'PHP 4,820,000', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
    ],
  },
];

export default function LedgerReportingPage() {
  return (
    <JournalsLedgerPage
      eyebrow="Core / Journals & Ledger"
      title="Ledger & Reporting"
      description="Browse general-ledger output, validate the trial balance, and review posted journal registers from accounting data."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Download Ledger View', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
