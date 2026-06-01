import { FixedAssetsPage, type FixedAssetsTab } from '../_components/FixedAssetsPage';

const tabs: FixedAssetsTab[] = [
  {
    id: 'fixed-assets',
    label: 'Fixed Assets',
    description:
      'Review fixed-asset register rows using asset code, category, purchase and in-service dates, cost, useful life, linked accounts, status, and document support.',
    searchPlaceholder: 'Search asset code, asset name, category, cost, useful life, status, or supporting document',
    filters: ['Fixed Assets', 'Active', 'Draft', 'Fully Depreciated'],
    actions: [
      { label: 'New Asset', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Assets', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Fixed Assets', value: '41', change: 'Assets tracked in the current register', trend: 'up' },
      { label: 'Active Assets', value: '28', change: 'Assets currently in active service', trend: 'up' },
      { label: 'Draft Assets', value: '6', change: 'Assets still being prepared before service or posting', trend: 'neutral' },
      { label: 'Register Cost', value: 'PHP 8.42M', change: 'Gross cost recorded across the asset register', trend: 'up' },
    ],
    tableTitle: 'Fixed Asset Register',
    tableDescription:
      'Asset records aligned to `accounting-fixed-assets`, including asset category, dates, cost, useful life, linked accounts, status, and supporting document.',
    columns: ['Asset Code', 'Asset Name', 'Category', 'Purchase Date', 'Cost', 'Status'],
    rows: [
      {
        id: 'asset-1',
        cells: [
          { text: 'FA-20260601001', emphasis: true },
          'Bridge Simulator Set A',
          'equipment',
          '2026-01-15',
          { text: 'PHP 2,400,000', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'asset-2',
        cells: [
          { text: 'FA-20260601002', emphasis: true },
          'Training Room Furniture Block 3',
          'furniture',
          '2026-02-10',
          { text: 'PHP 380,000', align: 'right' },
          { text: 'active', tone: 'green' },
        ],
      },
      {
        id: 'asset-3',
        cells: [
          { text: 'FA-20260601003', emphasis: true },
          'Server Rack Upgrade',
          'it_infrastructure',
          '2026-03-05',
          { text: 'PHP 640,000', align: 'right' },
          { text: 'draft', tone: 'amber' },
        ],
      },
      {
        id: 'asset-4',
        cells: [
          { text: 'FA-20260601004', emphasis: true },
          'Company Utility Van',
          'vehicle',
          '2025-11-20',
          { text: 'PHP 1,250,000', align: 'right' },
          { text: 'fully_depreciated', tone: 'gray' },
        ],
      },
    ],
  },
  {
    id: 'asset-categories-depreciation-setup',
    label: 'Asset Categories & Depreciation Setup',
    description:
      'Review the category and depreciation fields configured on fixed assets, including asset category, depreciation method, useful life, salvage value, and account mapping.',
    searchPlaceholder: 'Search asset, category, depreciation method, useful life, salvage value, or depreciation accounts',
    filters: ['Setup', 'Straight Line', 'Equipment', 'Mapped Accounts'],
    actions: [
      { label: 'Open Setup', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Setup', icon: 'refresh', variant: 'secondary' },
      { label: 'Export View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Category Types Used', value: '5', change: 'Distinct fixed-asset categories represented in active records', trend: 'neutral' },
      { label: 'Straight-Line Assets', value: '41', change: 'Assets currently configured with straight-line depreciation', trend: 'up' },
      { label: 'Mapped Expense Accounts', value: '41', change: 'Assets with depreciation expense accounts assigned', trend: 'up' },
      { label: 'Mapped Accumulated Accounts', value: '41', change: 'Assets with accumulated depreciation accounts assigned', trend: 'up' },
    ],
    tableTitle: 'Asset Setup Register',
    tableDescription:
      'Setup view grounded in fields stored directly on `accounting-fixed-assets`, especially category, depreciation method, useful life, salvage value, and linked accounts.',
    columns: ['Asset', 'Category', 'Method', 'Useful Life', 'Salvage Value', 'Account Mapping'],
    rows: [
      {
        id: 'setup-1',
        cells: [
          { text: 'Bridge Simulator Set A', emphasis: true },
          'equipment',
          'straight_line',
          '60 months',
          { text: 'PHP 120,000', align: 'right' },
          '1605 / 1705 / 5308',
        ],
      },
      {
        id: 'setup-2',
        cells: [
          { text: 'Training Room Furniture Block 3', emphasis: true },
          'furniture',
          'straight_line',
          '48 months',
          { text: 'PHP 20,000', align: 'right' },
          '1610 / 1710 / 5310',
        ],
      },
      {
        id: 'setup-3',
        cells: [
          { text: 'Server Rack Upgrade', emphasis: true },
          'it_infrastructure',
          'straight_line',
          '36 months',
          { text: 'PHP 0', align: 'right' },
          '1615 / 1715 / 5315',
        ],
      },
      {
        id: 'setup-4',
        cells: [
          { text: 'Company Utility Van', emphasis: true },
          'vehicle',
          'straight_line',
          '48 months',
          { text: 'PHP 150,000', align: 'right' },
          '1620 / 1720 / 5320',
        ],
      },
    ],
  },
];

export default function AssetRegisterSetupPage() {
  return (
    <FixedAssetsPage
      eyebrow="Advanced Finance / Fixed Assets"
      title="Asset Register & Setup"
      description="Review fixed-asset register records and the category, depreciation, and account-setup fields that drive lifecycle and reporting workflows."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Asset', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
