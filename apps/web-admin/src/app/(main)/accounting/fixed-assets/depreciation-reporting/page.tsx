import { FixedAssetsPage, type FixedAssetsTab } from '../_components/FixedAssetsPage';

const tabs: FixedAssetsTab[] = [
  {
    id: 'depreciation-schedules',
    label: 'Depreciation Schedules',
    description:
      'Review generated depreciation schedule rows by asset, fiscal year, period, depreciation date, amount, and scheduling status.',
    searchPlaceholder: 'Search asset, fiscal year, period, depreciation date, scheduled amount, or status',
    filters: ['Schedules', 'Scheduled', 'Current Year', 'Ready To Post'],
    actions: [
      { label: 'Generate Schedule', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Schedule', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Scheduled Entries', value: '186', change: 'Rows generated through asset schedule creation', trend: 'up' },
      { label: 'Assets With Schedule', value: '31', change: 'Assets already carrying generated depreciation entries', trend: 'up' },
      { label: 'Current Period Amount', value: 'PHP 214K', change: 'Scheduled depreciation for the current active period', trend: 'up' },
      { label: 'Ready To Post', value: '17', change: 'Scheduled rows awaiting posting action', trend: 'neutral' },
    ],
    tableTitle: 'Depreciation Schedule Register',
    tableDescription:
      'Schedule rows aligned to the depreciation-entry collection and the schedule-generation route for fixed assets.',
    columns: ['Asset', 'Fiscal Year', 'Period', 'Depreciation Date', 'Amount', 'Status'],
    rows: [
      {
        id: 'sched-1',
        cells: [
          { text: 'Bridge Simulator Set A', emphasis: true },
          'FY 2026',
          '2026-06',
          '2026-06-30',
          { text: 'PHP 38,000', align: 'right' },
          { text: 'scheduled', tone: 'amber' },
        ],
      },
      {
        id: 'sched-2',
        cells: [
          { text: 'Training Room Furniture Block 3', emphasis: true },
          'FY 2026',
          '2026-06',
          '2026-06-30',
          { text: 'PHP 7,500', align: 'right' },
          { text: 'scheduled', tone: 'amber' },
        ],
      },
      {
        id: 'sched-3',
        cells: [
          { text: 'Server Rack Upgrade', emphasis: true },
          'FY 2026',
          '2026-07',
          '2026-07-31',
          { text: 'PHP 17,778', align: 'right' },
          { text: 'scheduled', tone: 'amber' },
        ],
      },
      {
        id: 'sched-4',
        cells: [
          { text: 'Company Utility Van', emphasis: true },
          'FY 2026',
          '2026-05',
          '2026-05-31',
          { text: 'PHP 22,917', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'depreciation-entries',
    label: 'Depreciation Entries',
    description:
      'Review scheduled and posted depreciation entries, including posting status and linked journal entries produced by the depreciation posting route.',
    searchPlaceholder: 'Search asset, period, depreciation date, amount, posted journal, or status',
    filters: ['Depreciation Entries', 'Posted', 'Scheduled', 'With Journal'],
    actions: [
      { label: 'Post Entry', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Entries', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Posted Entries', value: '94', change: 'Depreciation rows already posted to journal entries', trend: 'up' },
      { label: 'Scheduled Entries', value: '92', change: 'Rows still pending posting', trend: 'neutral' },
      { label: 'Posted Amount', value: 'PHP 1.86M', change: 'Accumulated depreciation already posted through journal flow', trend: 'up' },
      { label: 'Fully Depreciated Assets', value: '7', change: 'Assets automatically rolled to fully depreciated status', trend: 'up' },
    ],
    tableTitle: 'Depreciation Entry Register',
    tableDescription:
      'Entry rows aligned to `accounting-depreciation-entries` and the depreciation-post route that creates the supporting journal entry.',
    columns: ['Asset', 'Period', 'Depreciation Date', 'Amount', 'Posted Journal', 'Status'],
    rows: [
      {
        id: 'entry-1',
        cells: [
          { text: 'Bridge Simulator Set A', emphasis: true },
          '2026-05',
          '2026-05-31',
          { text: 'PHP 38,000', align: 'right' },
          'JE-2026-1109',
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'entry-2',
        cells: [
          { text: 'Training Room Furniture Block 3', emphasis: true },
          '2026-05',
          '2026-05-31',
          { text: 'PHP 7,500', align: 'right' },
          'JE-2026-1114',
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'entry-3',
        cells: [
          { text: 'Server Rack Upgrade', emphasis: true },
          '2026-06',
          '2026-06-30',
          { text: 'PHP 17,778', align: 'right' },
          '-',
          { text: 'scheduled', tone: 'amber' },
        ],
      },
      {
        id: 'entry-4',
        cells: [
          { text: 'Company Utility Van', emphasis: true },
          '2026-05',
          '2026-05-31',
          { text: 'PHP 22,917', align: 'right' },
          'JE-2026-1088',
          { text: 'posted', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'asset-register-report',
    label: 'Asset Register Report',
    description:
      'Review asset-register reporting output with cost, accumulated depreciation, net book value, dimensions, and status by asset.',
    searchPlaceholder: 'Search asset code, category, branch, department, location, cost, or net book value',
    filters: ['Asset Register Report', 'Active', 'Equipment', 'High NBV'],
    actions: [
      { label: 'Open Register', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Report', icon: 'refresh', variant: 'secondary' },
      { label: 'Export Report', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Net Book Value', value: 'PHP 5.94M', change: 'Current net carrying amount across the asset register report', trend: 'up' },
      { label: 'Accumulated Depreciation', value: 'PHP 2.48M', change: 'Posted accumulated depreciation across reported assets', trend: 'up' },
      { label: 'Reported Assets', value: '41', change: 'Assets flowing into the asset register reporting service', trend: 'up' },
      { label: 'Disposed / Written Off', value: '6', change: 'Assets already exited from active service status', trend: 'neutral' },
    ],
    tableTitle: 'Asset Register Report',
    tableDescription:
      'Reporting view aligned to `AccountingAssetRegisterService.getAssetRegister()`, including cost, accumulated depreciation, net book value, dimensions, and status.',
    columns: ['Asset Code', 'Asset Name', 'Category', 'Cost', 'Net Book Value', 'Status'],
    rows: [
      {
        id: 'report-1',
        cells: [
          { text: 'FA-20260601001', emphasis: true },
          'Bridge Simulator Set A',
          'equipment',
          { text: 'PHP 2,400,000', align: 'right' },
          { text: 'PHP 2,134,000', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'report-2',
        cells: [
          { text: 'FA-20260601002', emphasis: true },
          'Training Room Furniture Block 3',
          'furniture',
          { text: 'PHP 380,000', align: 'right' },
          { text: 'PHP 342,500', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'report-3',
        cells: [
          { text: 'FA-20260601003', emphasis: true },
          'Server Rack Upgrade',
          'it_infrastructure',
          { text: 'PHP 640,000', align: 'right' },
          { text: 'PHP 622,222', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'report-4',
        cells: [
          { text: 'FA-20260601004', emphasis: true },
          'Company Utility Van',
          'vehicle',
          { text: 'PHP 1,250,000', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'disposed', tone: 'gray' },
        ],
      },
    ],
  },
];

export default function DepreciationReportingPage() {
  return (
    <FixedAssetsPage
      eyebrow="Advanced Finance / Fixed Assets"
      title="Depreciation & Reporting"
      description="Review generated depreciation schedules, posted depreciation entries, and asset-register reporting output grounded in the current fixed-asset backend."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Export Asset Report', icon: 'download', variant: 'ghost' },
      ]}
      tabs={tabs}
    />
  );
}
