import { PurchasesPayablesPage, type PurchasesPayablesTab } from '../_components/PurchasesPayablesPage';

const tabs: PurchasesPayablesTab[] = [
  {
    id: 'payments-made',
    label: 'Payments Made',
    description: 'Manage outgoing vendor payments with posting status, payment method, bank account, and bill applications.',
    searchPlaceholder: 'Search payment no., vendor, bank account, reference no., or payment method',
    filters: ['Draft', 'Posted', 'With Applications', 'Voided'],
    actions: [
      { label: 'Create Payment', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Payments', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft Payments', value: '11', change: 'Prepared for release or posting', trend: 'neutral' },
      { label: 'Posted Payments', value: '34', change: 'Registered as completed disbursements', trend: 'up' },
      { label: 'Unapplied Value', value: 'PHP 92,400', change: 'Payments not yet fully tied to bills', trend: 'down' },
      { label: 'Bank Transfer Volume', value: 'PHP 1.12M', change: 'Primary payment method this week', trend: 'up' },
    ],
    tableTitle: 'Vendor Payment Register',
    tableDescription: 'Payment-made records with bank account routing, application coverage, and posting status.',
    columns: ['Payment No.', 'Payment Date', 'Vendor', 'Method', 'Amount', 'Status'],
    rows: [
      {
        id: 'pay-1',
        cells: [
          { text: 'PM-2026-083', emphasis: true },
          '2026-05-31',
          'Office Depot',
          'Bank Transfer',
          { text: 'PHP 84,600', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'pay-2',
        cells: [
          { text: 'PM-2026-081', emphasis: true },
          '2026-05-30',
          'Blue Anchor Marine',
          'Check',
          { text: 'PHP 140,000', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'pay-3',
        cells: [
          { text: 'PM-2026-078', emphasis: true },
          '2026-05-29',
          'City Water',
          'Bank Transfer',
          { text: 'PHP 36,440', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'pay-4',
        cells: [
          { text: 'PM-2026-074', emphasis: true },
          '2026-05-28',
          'Harbor Training Ltd.',
          'Cash',
          { text: 'PHP 18,500', emphasis: true, align: 'right' },
          { text: 'Voided', tone: 'red' },
        ],
      },
    ],
  },
  {
    id: 'vendor-balances',
    label: 'Vendor Balances',
    description: 'Monitor open payable balances by vendor using vendor master status, bill totals, due dates, and aging position.',
    searchPlaceholder: 'Search vendor, vendor code, payment terms, open balance, or oldest due date',
    filters: ['Active Vendors', 'Overdue', 'High Balance', 'On Hold'],
    actions: [
      { label: 'Open Vendor Record', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Balances', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Active Vendors', value: '86', change: 'Master records currently usable for AP', trend: 'up' },
      { label: 'Vendors With Open Bills', value: '29', change: 'Derived from posted and partially paid bills', trend: 'neutral' },
      { label: 'Total Balance Due', value: 'PHP 2.46M', change: 'Open balances across vendor obligations', trend: 'down' },
      { label: 'Overdue Vendors', value: '12', change: 'Vendors with at least one overdue bill', trend: 'down' },
    ],
    tableTitle: 'Vendor Balance View',
    tableDescription: 'Vendor-level open balance view aligned with vendor master records and accounts payable aging logic.',
    columns: ['Vendor', 'Vendor Code', 'Payment Terms', 'Open Bills', 'Balance Due', 'Vendor Status'],
    rows: [
      {
        id: 'vb-1',
        cells: [
          { text: 'Blue Anchor Marine', emphasis: true },
          'V-00182',
          '30 days',
          '4',
          { text: 'PHP 486,200', emphasis: true, align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'vb-2',
        cells: [
          { text: 'Office Depot', emphasis: true },
          'V-00044',
          '15 days',
          '3',
          { text: 'PHP 188,400', emphasis: true, align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'vb-3',
        cells: [
          { text: 'City Water', emphasis: true },
          'V-00008',
          '30 days',
          '2',
          { text: 'PHP 72,880', emphasis: true, align: 'right' },
          { text: 'Active', tone: 'green' },
        ],
      },
      {
        id: 'vb-4',
        cells: [
          { text: 'Harbor Training Ltd.', emphasis: true },
          'V-00111',
          '7 days',
          '1',
          { text: 'PHP 24,500', emphasis: true, align: 'right' },
          { text: 'On Hold', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function VendorPaymentsBalancesPage() {
  return (
    <PurchasesPayablesPage
      eyebrow="Operations / Purchases & Payables"
      title="Vendor Payments & Balances"
      description="Manage vendor disbursements and vendor-level payable balances in one payables workspace."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Payment', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
