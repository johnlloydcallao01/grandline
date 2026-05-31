import { JournalsLedgerPage, type JournalsLedgerTab } from '../_components/JournalsLedgerPage';

const tabs: JournalsLedgerTab[] = [
  {
    id: 'opening-balance-journals',
    label: 'Opening Balance Journals',
    description: 'Review journal entries created with the `opening_balance` source type and their locked opening positions.',
    searchPlaceholder: 'Search entry no., source reference, posting date, memo, or status',
    filters: ['Opening Balance', 'Draft', 'Posted', 'Balanced'],
    actions: [
      { label: 'Create Opening Journal', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Entries', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Opening Entries', value: '3', change: 'Entries tagged as opening balances', trend: 'neutral' },
      { label: 'Posted Opening Entries', value: '2', change: 'Committed to the opening ledger position', trend: 'neutral' },
      { label: 'Draft Opening Entries', value: '1', change: 'Still under validation before posting', trend: 'neutral' },
      { label: 'Opening Line Count', value: '24', change: 'Lines contributing to starting balances', trend: 'up' },
    ],
    tableTitle: 'Opening Balance Journal View',
    tableDescription: 'Opening-balance journal headers using source type, totals, balance validation, and posting status.',
    columns: ['Entry No.', 'Posting Date', 'Source Ref', 'Total Debit', 'Balanced', 'Status'],
    rows: [
      {
        id: 'open-1',
        cells: [
          { text: 'JE-2026-0841', emphasis: true },
          '2026-01-01',
          'OPENING-2026',
          { text: 'PHP 4,820,000', emphasis: true, align: 'right' },
          { text: 'Yes', tone: 'green' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'open-2',
        cells: [
          { text: 'JE-2026-0842', emphasis: true },
          '2026-01-01',
          'OPENING-AR-2026',
          { text: 'PHP 684,200', emphasis: true, align: 'right' },
          { text: 'Yes', tone: 'green' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'open-3',
        cells: [
          { text: 'JE-2026-0901', emphasis: true },
          '2026-05-31',
          'OPENING-CLEAR',
          { text: 'PHP 92,000', emphasis: true, align: 'right' },
          { text: 'No', tone: 'amber' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'adjustment-entries',
    label: 'Adjustment Entries',
    description: 'Manage adjustment journals that refine balances while preserving source references, notes, and posting control.',
    searchPlaceholder: 'Search entry no., reference no., memo, posting date, or approver',
    filters: ['Adjustment', 'Draft', 'Posted', 'Needs Review'],
    actions: [
      { label: 'Create Adjustment', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Adjustments', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft Adjustments', value: '6', change: 'Prepared but not yet posted', trend: 'neutral' },
      { label: 'Posted Adjustments', value: '14', change: 'Committed correction entries', trend: 'up' },
      { label: 'Balanced Adjustments', value: '18', change: 'Entries that pass total checks', trend: 'up' },
      { label: 'Approved By Set', value: '9', change: 'Adjustment journals with approver recorded', trend: 'up' },
    ],
    tableTitle: 'Adjustment Journal Register',
    tableDescription: 'Adjustment journals using reference numbers, notes, approvers, totals, and posting status.',
    columns: ['Entry No.', 'Posting Date', 'Reference No.', 'Memo', 'Total Debit', 'Status'],
    rows: [
      {
        id: 'adj-1',
        cells: [
          { text: 'JE-2026-0908', emphasis: true },
          '2026-05-31',
          'ADJ-MAY-END',
          'Month-end accrual adjustment',
          { text: 'PHP 184,600', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'adj-2',
        cells: [
          { text: 'JE-2026-0896', emphasis: true },
          '2026-05-30',
          'ADJ-UTIL-0526',
          'Expense reclass entry',
          { text: 'PHP 92,440', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'adj-3',
        cells: [
          { text: 'JE-2026-0889', emphasis: true },
          '2026-05-29',
          'ADJ-PREPAID-0525',
          'Prepaid expense allocation',
          { text: 'PHP 74,300', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'adj-4',
        cells: [
          { text: 'JE-2026-0881', emphasis: true },
          '2026-05-28',
          'ADJ-CLEAR-0524',
          'Clearing account correction',
          { text: 'PHP 38,200', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'reversal-entries',
    label: 'Reversal Entries',
    description: 'Reverse posted journal entries while preserving the original journal link, reversed user, and reversal timestamps.',
    searchPlaceholder: 'Search reversal entry, original entry, posting date, reversed by, or memo',
    filters: ['Reversal', 'Posted', 'Original Linked', 'Recent'],
    actions: [
      { label: 'Create Reversal', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Reversals', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Reversal Entries', value: '5', change: 'Created against posted source journals', trend: 'up' },
      { label: 'Original Links', value: '5', change: 'Reversal entries tied to source journal ids', trend: 'up' },
      { label: 'Reversed Sources', value: '5', change: 'Original journals now marked reversed', trend: 'up' },
      { label: 'Recent Reversals', value: '2', change: 'Created in the current week', trend: 'neutral' },
    ],
    tableTitle: 'Reversal Journal Register',
    tableDescription: 'Reversal entries using reversal-of links, original journal numbers, and reversed user/timestamp fields.',
    columns: ['Reversal Entry', 'Original Entry', 'Posting Date', 'Memo', 'Reversed By', 'Status'],
    rows: [
      {
        id: 'rev-1',
        cells: [
          { text: 'JE-2026-0888', emphasis: true },
          'JE-2026-0875',
          '2026-05-29',
          'Reversal of JE-2026-0875: duplicate accrual',
          'gl.manager',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'rev-2',
        cells: [
          { text: 'JE-2026-0862', emphasis: true },
          'JE-2026-0859',
          '2026-05-24',
          'Reversal of JE-2026-0859: wrong source reference',
          'finance.controller',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'rev-3',
        cells: [
          { text: 'JE-2026-0831', emphasis: true },
          'JE-2026-0828',
          '2026-05-18',
          'Reversal of JE-2026-0828: period correction',
          'gl.manager',
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'rev-4',
        cells: [
          { text: 'JE-2026-0802', emphasis: true },
          'JE-2026-0799',
          '2026-05-09',
          'Reversal of JE-2026-0799: staging cleanup',
          'finance.controller',
          { text: 'Posted', tone: 'green' },
        ],
      },
    ],
  },
];

export default function PostingCorrectionsPage() {
  return (
    <JournalsLedgerPage
      eyebrow="Core / Journals & Ledger"
      title="Posting & Corrections"
      description="Handle opening-balance journals, adjustment entries, and reversals using the correction paths supported by the backend."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Adjustment', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
