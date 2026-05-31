import { JournalsLedgerPage, type JournalsLedgerTab } from '../_components/JournalsLedgerPage';

const tabs: JournalsLedgerTab[] = [
  {
    id: 'journal-entries',
    label: 'Journal Entries',
    description: 'Manage journal entry headers with entry numbers, dates, source type, status, posting status, and balancing totals.',
    searchPlaceholder: 'Search entry no., source ref, memo, posting date, or status',
    filters: ['Draft', 'Posted', 'Reversed', 'Manual'],
    actions: [
      { label: 'Create Journal', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Entries', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft Entries', value: '18', change: 'Unposted journal headers still mutable', trend: 'neutral' },
      { label: 'Posted Entries', value: '74', change: 'Committed to ledger and no longer directly editable', trend: 'up' },
      { label: 'Balanced Journals', value: '89', change: 'Headers passing debit-credit balance checks', trend: 'up' },
      { label: 'Reversed Entries', value: '5', change: 'Original journals already paired to reversals', trend: 'down' },
    ],
    tableTitle: 'Journal Entry Register',
    tableDescription: 'Journal header register using entry number, posting date, source type, totals, and posting status fields.',
    columns: ['Entry No.', 'Posting Date', 'Source Type', 'Memo', 'Total Debit', 'Status'],
    rows: [
      {
        id: 'je-1',
        cells: [
          { text: 'JE-2026-0908', emphasis: true },
          '2026-05-31',
          'manual',
          'Month-end accrual adjustment',
          { text: 'PHP 184,600', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'je-2',
        cells: [
          { text: 'JE-2026-0904', emphasis: true },
          '2026-05-31',
          'system',
          'Invoice posting batch',
          { text: 'PHP 428,880', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'je-3',
        cells: [
          { text: 'JE-2026-0896', emphasis: true },
          '2026-05-30',
          'adjustment',
          'Expense reclass entry',
          { text: 'PHP 92,440', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'je-4',
        cells: [
          { text: 'JE-2026-0888', emphasis: true },
          '2026-05-29',
          'reversal',
          'Reversal of JE-2026-0875',
          { text: 'PHP 68,500', emphasis: true, align: 'right' },
          { text: 'Reversed', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'journal-entry-detail',
    label: 'Journal Entry Detail',
    description: 'Inspect journal line detail with accounts, descriptions, debit and credit values, tax codes, and reference entities.',
    searchPlaceholder: 'Search entry no., account, line description, tax code, or reference entity',
    filters: ['With Tax Code', 'Manual', 'Adjustment', 'System'],
    actions: [
      { label: 'Open Journal Detail', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Detail', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Journal Lines', value: '426', change: 'Lines stored under current journal headers', trend: 'up' },
      { label: 'Tax-Coded Lines', value: '61', change: 'Journal lines carrying tax-code references', trend: 'neutral' },
      { label: 'Referenced Lines', value: '138', change: 'Lines with source entity references', trend: 'up' },
      { label: 'Balanced Detail Sets', value: '92', change: 'Entries whose lines reconcile to header totals', trend: 'up' },
    ],
    tableTitle: 'Journal Line Detail',
    tableDescription: 'Line-level detail for journal entries showing account coding, amounts, tax links, and source references.',
    columns: ['Entry No.', 'Line', 'Account', 'Debit', 'Credit', 'Reference'],
    rows: [
      {
        id: 'detail-1',
        cells: [
          { text: 'JE-2026-0908', emphasis: true },
          '1',
          '6100 Salaries Expense',
          { text: 'PHP 92,300', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          'payroll_run / PR-2026-018',
        ],
      },
      {
        id: 'detail-2',
        cells: [
          { text: 'JE-2026-0908', emphasis: true },
          '2',
          '2100 Accrued Liabilities',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 92,300', emphasis: true, align: 'right' },
          'payroll_run / PR-2026-018',
        ],
      },
      {
        id: 'detail-3',
        cells: [
          { text: 'JE-2026-0904', emphasis: true },
          '3',
          '2200 Output VAT',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 25,752', emphasis: true, align: 'right' },
          'invoice / INV-2026-1452',
        ],
      },
      {
        id: 'detail-4',
        cells: [
          { text: 'JE-2026-0896', emphasis: true },
          '1',
          '5200 Utilities Expense',
          { text: 'PHP 46,220', emphasis: true, align: 'right' },
          { text: 'PHP 0', align: 'right' },
          'expense / EXP-2026-1173',
        ],
      },
    ],
  },
  {
    id: 'journal-source-types',
    label: 'Journal Source Types',
    description: 'Review journal records by source type such as manual, opening balance, adjustment, reversal, and system.',
    searchPlaceholder: 'Search source type, entry no., source reference, memo, or user',
    filters: ['Manual', 'Opening Balance', 'Adjustment', 'Reversal'],
    actions: [
      { label: 'Open Source View', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Sources', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Manual Entries', value: '21', change: 'User-created journal headers', trend: 'neutral' },
      { label: 'Opening Balance Entries', value: '3', change: 'Entries flagged as opening balance source type', trend: 'neutral' },
      { label: 'Adjustment Entries', value: '14', change: 'Adjustment journals currently stored', trend: 'up' },
      { label: 'System Entries', value: '51', change: 'Generated by supported posting workflows', trend: 'up' },
    ],
    tableTitle: 'Source-Type Journal View',
    tableDescription: 'Journal inventory grouped around the supported `sourceType` values already modeled by the backend.',
    columns: ['Entry No.', 'Source Type', 'Source Ref', 'Posting Date', 'Posted By', 'Status'],
    rows: [
      {
        id: 'source-1',
        cells: [
          { text: 'JE-2026-0908', emphasis: true },
          'manual',
          'MEM-2026-31',
          '2026-05-31',
          '-',
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'source-2',
        cells: [
          { text: 'JE-2026-0841', emphasis: true },
          'opening_balance',
          'OPENING-2026',
          '2026-01-01',
          'finance.controller',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'source-3',
        cells: [
          { text: 'JE-2026-0896', emphasis: true },
          'adjustment',
          'ADJ-UTIL-0526',
          '2026-05-30',
          'gl.manager',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'source-4',
        cells: [
          { text: 'JE-2026-0888', emphasis: true },
          'reversal',
          'JE-2026-0875',
          '2026-05-29',
          'gl.manager',
          { text: 'Posted', tone: 'green' },
        ],
      },
    ],
  },
];

export default function JournalManagementPage() {
  return (
    <JournalsLedgerPage
      eyebrow="Core / Journals & Ledger"
      title="Journal Management"
      description="Create, review, and track journal headers, line detail, and supported journal source types."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Journal', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
