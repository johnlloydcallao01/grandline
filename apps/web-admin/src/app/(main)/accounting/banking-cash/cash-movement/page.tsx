import { BankingCashPage, type BankingCashTab } from '../_components/BankingCashPage';

const tabs: BankingCashTab[] = [
  {
    id: 'deposits',
    label: 'Deposits',
    description: 'Track deposit creation, posting status, included payments, and audit visibility.',
    searchPlaceholder: 'Search deposit batch, payment ref, receipt no., or prepared by',
    filters: ['Draft Batches', 'Ready To Post', 'Posted Today', 'Deposit Variances'],
    actions: [
      { label: 'New Deposit Batch', icon: 'plus', variant: 'primary' },
      { label: 'Import Deposit Slip', icon: 'upload', variant: 'secondary' },
      { label: 'Export Batch List', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Open Deposit Batches', value: '7', change: '3 need posting today', trend: 'neutral' },
      { label: 'Undeposited Receipts', value: 'PHP 412,700', change: 'Across 26 receipts', trend: 'up' },
      { label: 'Posted Today', value: '4 batches', change: 'PHP 301,200 cleared', trend: 'up' },
      { label: 'Deposit Variances', value: '2', change: '1 unresolved difference', trend: 'down' },
    ],
    tableTitle: 'Deposit Batches',
    tableDescription: 'Review grouped customer receipts before posting them into bank deposits.',
    columns: ['Batch No.', 'Prepared Date', 'Bank Account', 'Included Receipts', 'Batch Amount', 'Status'],
    rows: [
      {
        id: 'dep-1',
        cells: [
          { text: 'DEP-2026-0531-01', emphasis: true },
          '2026-05-31',
          'BDO Operations',
          '8 receipts',
          { text: 'PHP 124,500', emphasis: true, align: 'right' },
          { text: 'Ready To Post', tone: 'green' },
        ],
      },
      {
        id: 'dep-2',
        cells: [
          { text: 'DEP-2026-0531-02', emphasis: true },
          '2026-05-31',
          'Metrobank Main',
          '5 receipts',
          { text: 'PHP 89,200', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'dep-3',
        cells: [
          { text: 'DEP-2026-0530-05', emphasis: true },
          '2026-05-30',
          'BDO Operations',
          '11 receipts',
          { text: 'PHP 156,000', emphasis: true, align: 'right' },
          { text: 'Variance', tone: 'red' },
        ],
      },
      {
        id: 'dep-4',
        cells: [
          { text: 'DEP-2026-0530-03', emphasis: true },
          '2026-05-30',
          'RCBC Reserve',
          '3 receipts',
          { text: 'PHP 43,500', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
    ],
    sidePanels: [],
  },
  {
    id: 'transfers-undeposited',
    label: 'Transfers & Undeposited Funds',
    description: 'Monitor internal transfers and cash still waiting to be deposited.',
    searchPlaceholder: 'Search transfer id, source account, receipt batch, or destination account',
    filters: ['Transfers Pending', 'Undeposited Receipts', 'Internal Moves', 'Exceptions'],
    actions: [
      { label: 'Create Transfer', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Balances', icon: 'refresh', variant: 'secondary' },
      { label: 'Download Cash Staging', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Pending Transfers', value: '5', change: '2 awaiting approval', trend: 'neutral' },
      { label: 'Undeposited Funds', value: 'PHP 412,700', change: '26 receipts not batched', trend: 'up' },
      { label: 'Internal Cash Moves Today', value: 'PHP 920,000', change: 'Across 4 bank hops', trend: 'up' },
      { label: 'Staging Exceptions', value: '3', change: '1 deposit batch overdue', trend: 'down' },
    ],
    tableTitle: 'Cash Movement Queue',
    tableDescription: 'Combined view of transfers, staged receipts, and undeposited amounts that still need action.',
    columns: ['Movement', 'Source', 'Destination / Batch', 'Owner', 'Amount', 'Status'],
    rows: [
      {
        id: 'mov-1',
        cells: [
          { text: 'TRF-2026-0531-04', emphasis: true },
          'RCBC Reserve',
          'BDO Operations',
          'Treasury Team',
          { text: 'PHP 250,000', emphasis: true, align: 'right' },
          { text: 'Pending Approval', tone: 'amber' },
        ],
      },
      {
        id: 'mov-2',
        cells: [
          { text: 'Undeposited Batch UDF-118', emphasis: true },
          'Cashier Receipts',
          'Awaiting Deposit Group',
          'Front Desk',
          { text: 'PHP 68,200', emphasis: true, align: 'right' },
          { text: 'Needs Batch', tone: 'blue' },
        ],
      },
      {
        id: 'mov-3',
        cells: [
          { text: 'TRF-2026-0530-11', emphasis: true },
          'Metrobank Main',
          'UnionBank Payroll',
          'Treasury Team',
          { text: 'PHP 430,000', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'mov-4',
        cells: [
          { text: 'Undeposited Batch UDF-104', emphasis: true },
          'Collections Desk',
          'Stale Since Yesterday',
          'Cashier Lead',
          { text: 'PHP 17,500', emphasis: true, align: 'right' },
          { text: 'Overdue', tone: 'red' },
        ],
      },
    ],
    sidePanels: [],
  },
  {
    id: 'bounced-payments',
    label: 'Bounced Payments',
    description: 'Track failed incoming payments, reversals, charges, and resolution progress.',
    searchPlaceholder: 'Search case id, invoice no., payer, or reversal reference',
    filters: ['Open Cases', 'Awaiting Reversal', 'Charges Applied', 'Resolved'],
    actions: [
      { label: 'Create Bounce Case', icon: 'plus', variant: 'primary' },
      { label: 'Post Reversal', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Case Log', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Open Bounce Cases', value: '6', change: '2 require same-day reversal', trend: 'down' },
      { label: 'Bank Charges', value: 'PHP 3,250', change: 'Month to date', trend: 'up' },
      { label: 'Recovery Rate', value: '71%', change: 'Recovered within 14 days', trend: 'up' },
      { label: 'Customer Follow-ups', value: '4', change: 'Pending collections outreach', trend: 'neutral' },
    ],
    tableTitle: 'Bounced Payment Caseboard',
    tableDescription: 'Track every failed payment from bank notification to reversal, charge posting, and recovery handling.',
    columns: ['Case ID', 'Customer', 'Original Receipt', 'Bounce Reason', 'Exposure', 'Case Status'],
    rows: [
      {
        id: 'bpc-1',
        cells: [
          { text: 'BNC-2026-042', emphasis: true },
          'Harbor Training Ltd.',
          'RCT-2026-1183',
          'Insufficient funds',
          { text: 'PHP 24,500', emphasis: true, align: 'right' },
          { text: 'Awaiting Reversal', tone: 'red' },
        ],
      },
      {
        id: 'bpc-2',
        cells: [
          { text: 'BNC-2026-041', emphasis: true },
          'Blue Anchor Marine',
          'RCT-2026-1179',
          'Account closed',
          { text: 'PHP 12,000', emphasis: true, align: 'right' },
          { text: 'Collections Follow-up', tone: 'amber' },
        ],
      },
      {
        id: 'bpc-3',
        cells: [
          { text: 'BNC-2026-039', emphasis: true },
          'SM Shipping Corp.',
          'RCT-2026-1164',
          'Payment recalled',
          { text: 'PHP 86,500', emphasis: true, align: 'right' },
          { text: 'Resolved', tone: 'green' },
        ],
      },
    ],
    sidePanels: [],
  },
];

export default function CashMovementPage() {
  return (
    <BankingCashPage
      eyebrow="Operations / Banking & Cash"
      title="Cash Movement"
      description="Manage deposits, internal transfers, undeposited funds, and bounced payment exceptions in one cash-movement workspace."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Create Transfer', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
