import { FixedAssetsPage, type FixedAssetsTab } from '../_components/FixedAssetsPage';

const tabs: FixedAssetsTab[] = [
  {
    id: 'acquisition-details',
    label: 'Acquisition Details',
    description:
      'Review acquisition-related fields stored directly on the fixed-asset record, including purchase date, in-service date, cost, salvage value, useful life, and supporting document.',
    searchPlaceholder: 'Search asset, purchase date, in-service date, cost, useful life, or supporting document',
    filters: ['Acquisition', 'In Service', 'Recent Purchase', 'With Document'],
    actions: [
      { label: 'Open Asset', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Lifecycle', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Assets In Service', value: '28', change: 'Assets with active in-service tracking', trend: 'up' },
      { label: 'Recent Acquisitions', value: '7', change: 'Assets purchased within the recent planning window', trend: 'up' },
      { label: 'With Supporting Documents', value: '33', change: 'Assets linked to uploaded source documents', trend: 'up' },
      { label: 'Average Useful Life', value: '49 mo', change: 'Average useful life across current fixed-asset rows', trend: 'neutral' },
    ],
    tableTitle: 'Asset Acquisition Register',
    tableDescription:
      'Acquisition view grounded in the purchase, service, cost, useful-life, and supporting-document fields stored on `accounting-fixed-assets`.',
    columns: ['Asset', 'Purchase Date', 'In Service', 'Cost', 'Useful Life', 'Document'],
    rows: [
      {
        id: 'acq-1',
        cells: [
          { text: 'Bridge Simulator Set A', emphasis: true },
          '2026-01-15',
          '2026-02-01',
          { text: 'PHP 2,400,000', align: 'right' },
          '60 months',
          'simulator-po-2026.pdf',
        ],
      },
      {
        id: 'acq-2',
        cells: [
          { text: 'Training Room Furniture Block 3', emphasis: true },
          '2026-02-10',
          '2026-02-17',
          { text: 'PHP 380,000', align: 'right' },
          '48 months',
          'furniture-invoice-0210.pdf',
        ],
      },
      {
        id: 'acq-3',
        cells: [
          { text: 'Server Rack Upgrade', emphasis: true },
          '2026-03-05',
          '-',
          { text: 'PHP 640,000', align: 'right' },
          '36 months',
          'server-upgrade-quote.pdf',
        ],
      },
      {
        id: 'acq-4',
        cells: [
          { text: 'Company Utility Van', emphasis: true },
          '2025-11-20',
          '2025-11-28',
          { text: 'PHP 1,250,000', align: 'right' },
          '48 months',
          'vehicle-or-cr.pdf',
        ],
      },
    ],
  },
  {
    id: 'asset-disposal-write-offs',
    label: 'Asset Disposal & Write-Offs',
    description:
      'Review asset disposal records using disposal date, disposal type, proceeds, book value, gain or loss, status, and posted journal linkage.',
    searchPlaceholder: 'Search asset, disposal date, type, proceeds, book value, gain/loss, or status',
    filters: ['Disposals', 'Write-Off', 'Draft', 'Posted'],
    actions: [
      { label: 'New Disposal', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Disposals', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Disposal Records', value: '9', change: 'Lifecycle exits tracked in the disposal register', trend: 'up' },
      { label: 'Posted Disposals', value: '5', change: 'Disposals already journal-posted through the asset service', trend: 'up' },
      { label: 'Write-Offs', value: '3', change: 'Disposal records tagged as write-off type', trend: 'neutral' },
      { label: 'Net Gain / Loss', value: 'PHP 42K', change: 'Combined gain or loss across posted disposals', trend: 'up' },
    ],
    tableTitle: 'Asset Disposal Register',
    tableDescription:
      'Disposal rows aligned to `accounting-asset-disposals`, including type, proceeds, book value, gain or loss, status, and posted journal entry.',
    columns: ['Asset', 'Disposal Date', 'Type', 'Proceeds', 'Gain / Loss', 'Status'],
    rows: [
      {
        id: 'disp-1',
        cells: [
          { text: 'Company Utility Van', emphasis: true },
          '2026-04-12',
          'sale',
          { text: 'PHP 340,000', align: 'right' },
          { text: 'PHP 18,000', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'disp-2',
        cells: [
          { text: 'Legacy Desktop Cluster', emphasis: true },
          '2026-04-28',
          'write_off',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP -11,500', align: 'right' },
          { text: 'posted', tone: 'green' },
        ],
      },
      {
        id: 'disp-3',
        cells: [
          { text: 'Printer Bay 2', emphasis: true },
          '2026-05-09',
          'transfer',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 0', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'disp-4',
        cells: [
          { text: 'Damaged Projector Unit', emphasis: true },
          '2026-05-21',
          'write_off',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP -8,200', align: 'right' },
          { text: 'approved', tone: 'blue' },
        ],
      },
    ],
  },
];

export default function AssetLifecyclePage() {
  return (
    <FixedAssetsPage
      eyebrow="Advanced Finance / Fixed Assets"
      title="Asset Lifecycle"
      description="Review acquisition details held on the asset record and disposal or write-off records that close the asset lifecycle."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Disposal', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
