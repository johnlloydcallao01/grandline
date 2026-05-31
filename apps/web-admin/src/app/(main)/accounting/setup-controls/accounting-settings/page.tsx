import { SetupControlsPage, type SetupControlsTab } from '../_components/SetupControlsPage';

const tabs: SetupControlsTab[] = [
  {
    id: 'fiscal-years',
    label: 'Fiscal Years',
    description: 'Review fiscal-year setup records that define accounting ranges, close mode, lock date, and close status.',
    searchPlaceholder: 'Search fiscal year code, name, status, close mode, or lock date',
    filters: ['Open', 'Closed', 'Draft', 'Manual Close'],
    actions: [
      { label: 'Create Fiscal Year', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Years', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Configured Years', value: '4', change: 'Fiscal-year records available in settings', trend: 'neutral' },
      { label: 'Closed Years', value: '1', change: 'Years with close information recorded', trend: 'neutral' },
      { label: 'Open Years', value: '2', change: 'Years currently usable for active posting', trend: 'up' },
      { label: 'Locked Dates Set', value: '3', change: 'Years enforcing a lock date', trend: 'up' },
    ],
    tableTitle: 'Fiscal Year Settings',
    tableDescription: 'Fiscal-year records showing code, range, close mode, lock date, and close status.',
    columns: ['Code', 'Name', 'Date Range', 'Close Mode', 'Locked From', 'Status'],
    rows: [
      {
        id: 'fy-set-1',
        cells: [
          { text: 'FY2025', emphasis: true },
          'Fiscal Year 2025',
          '2025-01-01 to 2025-12-31',
          'manual',
          '2025-12-31',
          { text: 'Closed', tone: 'green' },
        ],
      },
      {
        id: 'fy-set-2',
        cells: [
          { text: 'FY2026', emphasis: true },
          'Fiscal Year 2026',
          '2026-01-01 to 2026-12-31',
          'manual',
          '2026-05-25',
          { text: 'Open', tone: 'blue' },
        ],
      },
      {
        id: 'fy-set-3',
        cells: [
          { text: 'FY2027', emphasis: true },
          'Fiscal Year 2027',
          '2027-01-01 to 2027-12-31',
          'manual',
          '-',
          { text: 'Draft', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'accounting-periods',
    label: 'Accounting Periods',
    description: 'Review period setup records under a fiscal year including period number, label, date range, and close state.',
    searchPlaceholder: 'Search period label, fiscal year, number, status, or lock date',
    filters: ['Open', 'Closed', 'Draft', 'Locked'],
    actions: [
      { label: 'Create Period', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Periods', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Configured Periods', value: '18', change: 'Periods stored under fiscal years', trend: 'up' },
      { label: 'Closed Periods', value: '14', change: 'Periods already closed', trend: 'neutral' },
      { label: 'Open Periods', value: '2', change: 'Periods available for posting', trend: 'neutral' },
      { label: 'Locked Periods', value: '6', change: 'Periods with lock dates set', trend: 'up' },
    ],
    tableTitle: 'Accounting Period Settings',
    tableDescription: 'Period records showing fiscal-year linkage, numbering, date range, lock date, and status.',
    columns: ['Label', 'Fiscal Year', 'Period No.', 'Date Range', 'Locked From', 'Status'],
    rows: [
      {
        id: 'period-set-1',
        cells: [
          { text: '2026 P04', emphasis: true },
          'FY2026',
          '4',
          '2026-04-01 to 2026-04-30',
          '2026-04-30',
          { text: 'Closed', tone: 'green' },
        ],
      },
      {
        id: 'period-set-2',
        cells: [
          { text: '2026 P05', emphasis: true },
          'FY2026',
          '5',
          '2026-05-01 to 2026-05-31',
          '2026-05-25',
          { text: 'Open', tone: 'blue' },
        ],
      },
      {
        id: 'period-set-3',
        cells: [
          { text: '2026 P06', emphasis: true },
          'FY2026',
          '6',
          '2026-06-01 to 2026-06-30',
          '-',
          { text: 'Draft', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'ledger-controls',
    label: 'Ledger Controls',
    description: 'Review chart-of-account control flags used by posting and ledger governance such as retained earnings, suspense, and manual entry settings.',
    searchPlaceholder: 'Search account code, account name, control flag, or manual-entry rule',
    filters: ['Control Accounts', 'Retained Earnings', 'Suspense', 'Manual Entries Allowed'],
    actions: [
      { label: 'Open Account Control', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Controls', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Control Accounts', value: '11', change: 'Accounts flagged as system-controlled', trend: 'neutral' },
      { label: 'Retained Earnings', value: '1', change: 'Dedicated retained earnings account flagged', trend: 'neutral' },
      { label: 'Suspense Accounts', value: '1', change: 'Suspense account available for exception handling', trend: 'neutral' },
      { label: 'Manual Entry Allowed', value: '103', change: 'Accounts open to direct manual journals', trend: 'up' },
    ],
    tableTitle: 'Ledger Control Settings',
    tableDescription: 'Control-oriented chart-of-account records using manual-entry, control, retained-earnings, and suspense flags.',
    columns: ['Code', 'Account Name', 'Control Account', 'Retained Earnings', 'Suspense', 'Manual Entries'],
    rows: [
      {
        id: 'ledger-ctrl-1',
        cells: [
          { text: '1100', emphasis: true },
          'Accounts Receivable',
          { text: 'Yes', tone: 'blue' },
          'No',
          'No',
          'No',
        ],
      },
      {
        id: 'ledger-ctrl-2',
        cells: [
          { text: '3200', emphasis: true },
          'Retained Earnings',
          { text: 'Yes', tone: 'blue' },
          { text: 'Yes', tone: 'green' },
          'No',
          'No',
        ],
      },
      {
        id: 'ledger-ctrl-3',
        cells: [
          { text: '9999', emphasis: true },
          'Suspense Account',
          'No',
          'No',
          { text: 'Yes', tone: 'amber' },
          'Yes',
        ],
      },
    ],
  },
];

export default function AccountingSettingsPage() {
  return (
    <SetupControlsPage
      eyebrow="Core / Setup & Controls"
      title="Accounting Settings"
      description="Review fiscal-year, period, and ledger-control records that currently define the accounting operating environment."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Setting Record', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
