import { BankingCashPage, type BankingCashTab } from '../_components/BankingCashPage';

const tabs: BankingCashTab[] = [
  {
    id: 'bank-transactions',
    label: 'Bank Transactions',
    description: 'Review bank transaction intake and matching status across imported and manually entered records.',
    searchPlaceholder: 'Search by reference, counterparty, amount, or memo',
    filters: ['Needs Matching', 'Imported Today', 'Manual Entries', 'Exceptions'],
    actions: [
      { label: 'Import Statement', icon: 'upload', variant: 'secondary' },
      { label: 'Refresh Feed', icon: 'refresh', variant: 'ghost' },
      { label: 'Create Manual Transaction', icon: 'plus', variant: 'primary' },
    ],
    metrics: [
      { label: 'Open Bank Items', value: '148', change: '+12 since morning', trend: 'up' },
      { label: 'Auto-Matched Today', value: '92', change: '61% match rate', trend: 'up' },
      { label: 'Exceptions Queue', value: '17', change: '4 high priority', trend: 'down' },
      { label: 'Unposted Cash Delta', value: 'PHP 184,250', change: 'Awaiting review', trend: 'neutral' },
    ],
    tableTitle: 'Incoming Transaction Queue',
    tableDescription: 'Operational queue for imported and manual bank transactions waiting to be matched or reviewed.',
    columns: ['Date', 'Bank Account', 'Reference', 'Counterparty', 'Amount', 'Status'],
    rows: [
      {
        id: 'txn-1',
        cells: [
          '2026-05-31',
          { text: 'BDO Operations', emphasis: true },
          'BNK-240531-019',
          'SM Shipping Corp.',
          { text: 'PHP 86,500', emphasis: true, align: 'right' },
          { text: 'Needs Match', tone: 'amber' },
        ],
      },
      {
        id: 'txn-2',
        cells: [
          '2026-05-31',
          { text: 'UnionBank Payroll', emphasis: true },
          'MAN-000483',
          'Manual Fee Reclass',
          { text: 'PHP 4,800', emphasis: true, align: 'right' },
          { text: 'Manual Draft', tone: 'blue' },
        ],
      },
      {
        id: 'txn-3',
        cells: [
          '2026-05-30',
          { text: 'Metrobank Main', emphasis: true },
          'BNK-240530-144',
          'Harbor Training Ltd.',
          { text: 'PHP 120,000', emphasis: true, align: 'right' },
          { text: 'Matched', tone: 'green' },
        ],
      },
      {
        id: 'txn-4',
        cells: [
          '2026-05-30',
          { text: 'BDO Operations', emphasis: true },
          'BNK-240530-121',
          'Unknown Depositor',
          { text: 'PHP 18,250', emphasis: true, align: 'right' },
          { text: 'Exception', tone: 'red' },
        ],
      },
    ],
    sidePanels: [],
  },
  {
    id: 'statement-imports',
    label: 'Statement Imports',
    description: 'Manage statement import queue, file history, parsing errors, and import outcomes.',
    searchPlaceholder: 'Search by filename, account, uploader, or import batch',
    filters: ['Queued', 'Imported', 'Parsing Errors', 'Requires Re-upload'],
    actions: [
      { label: 'Upload File', icon: 'upload', variant: 'primary' },
      { label: 'Download Template', icon: 'download', variant: 'secondary' },
      { label: 'Retry Failed Imports', icon: 'refresh', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Files In Queue', value: '9', change: '3 waiting validation', trend: 'neutral' },
      { label: 'Imported Today', value: '14', change: '2,481 lines parsed', trend: 'up' },
      { label: 'Failed Imports', value: '3', change: '1 critical format issue', trend: 'down' },
      { label: 'Oldest Pending File', value: '42 min', change: 'Uploaded 08:18 AM', trend: 'neutral' },
    ],
    tableTitle: 'Statement Import Batches',
    tableDescription: 'Track every uploaded bank statement, parse outcome, and finance follow-up action.',
    columns: ['Uploaded', 'Filename', 'Bank Account', 'Lines', 'Uploaded By', 'Import Status'],
    rows: [
      {
        id: 'imp-1',
        cells: [
          '08:18 AM',
          { text: 'BDO-main-2026-05-31.csv', emphasis: true },
          'BDO Operations',
          '241',
          'finance.ops@grandline',
          { text: 'Queued', tone: 'blue' },
        ],
      },
      {
        id: 'imp-2',
        cells: [
          '07:42 AM',
          { text: 'ub-payroll-2026-05-31.xlsx', emphasis: true },
          'UnionBank Payroll',
          '86',
          'treasury@grandline',
          { text: 'Imported', tone: 'green' },
        ],
      },
      {
        id: 'imp-3',
        cells: [
          'Yesterday',
          { text: 'metrobank-main-2026-05-30.csv', emphasis: true },
          'Metrobank Main',
          '311',
          'finance.lead@grandline',
          { text: 'Parse Error', tone: 'red' },
        ],
      },
      {
        id: 'imp-4',
        cells: [
          'Yesterday',
          { text: 'bdo-daily-2026-05-30.csv', emphasis: true },
          'BDO Operations',
          '227',
          'finance.ops@grandline',
          { text: 'Needs Re-upload', tone: 'amber' },
        ],
      },
    ],
    sidePanels: [],
  },
  {
    id: 'bank-feeds',
    label: 'Bank Feeds',
    description: 'Monitor connected accounts, feed health, sync history, and feed rules.',
    searchPlaceholder: 'Search by bank account, connector, sync token, or rule',
    filters: ['Healthy Feeds', 'Sync Delays', 'Rule Changes', 'Disconnected'],
    actions: [
      { label: 'Connect Bank Feed', icon: 'plus', variant: 'primary' },
      { label: 'Sync Now', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Feed Log', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Connected Accounts', value: '6', change: '5 healthy / 1 delayed', trend: 'up' },
      { label: 'Last Sync Success', value: '09:26 AM', change: '4 min average latency', trend: 'up' },
      { label: 'Feed Rules Active', value: '18', change: '3 auto-classify rules edited', trend: 'neutral' },
      { label: 'Disconnected Feeds', value: '1', change: 'Payroll account token expired', trend: 'down' },
    ],
    tableTitle: 'Connected Feed Accounts',
    tableDescription: 'Operational status of each connected bank feed and the rules attached to it.',
    columns: ['Bank Account', 'Connector', 'Last Sync', 'Imported Rows', 'Rule Set', 'Health'],
    rows: [
      {
        id: 'feed-1',
        cells: [
          { text: 'BDO Operations', emphasis: true },
          'Plaid via Treasury Hub',
          '09:26 AM',
          '127',
          'Collections + Refund Rules',
          { text: 'Healthy', tone: 'green' },
        ],
      },
      {
        id: 'feed-2',
        cells: [
          { text: 'Metrobank Main', emphasis: true },
          'CSV Bridge',
          '09:02 AM',
          '91',
          'Manual Review Fallback',
          { text: 'Healthy', tone: 'green' },
        ],
      },
      {
        id: 'feed-3',
        cells: [
          { text: 'UnionBank Payroll', emphasis: true },
          'Direct API',
          'Yesterday 05:11 PM',
          '0',
          'Payroll Settlement Rules',
          { text: 'Token Expired', tone: 'red' },
        ],
      },
      {
        id: 'feed-4',
        cells: [
          { text: 'RCBC Reserve', emphasis: true },
          'Direct API',
          '08:55 AM',
          '14',
          'Treasury Transfer Rules',
          { text: 'Sync Delay', tone: 'amber' },
        ],
      },
    ],
    sidePanels: [],
  },
];

export default function BankOperationsPage() {
  return (
    <BankingCashPage
      eyebrow="Operations / Banking & Cash"
      title="Bank Operations"
      description="Manage bank transaction intake, statement imports, and connected bank feeds in one operations workspace."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Create Manual Transaction', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
