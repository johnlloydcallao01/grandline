import { PurchasesPayablesPage, type PurchasesPayablesTab } from '../_components/PurchasesPayablesPage';

const tabs: PurchasesPayablesTab[] = [
  {
    id: 'bills',
    label: 'Bills',
    description: 'Create, review, and post vendor bills with due dates, totals, balances, and status tracking.',
    searchPlaceholder: 'Search bill no., vendor, reference no., memo, or due date',
    filters: ['Draft', 'Approved', 'Posted', 'Partially Paid'],
    actions: [
      { label: 'Create Bill', icon: 'plus', variant: 'primary' },
      { label: 'Upload Bill Support', icon: 'upload', variant: 'secondary' },
      { label: 'Refresh List', icon: 'refresh', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft Bills', value: '27', change: 'Awaiting final review before posting', trend: 'neutral' },
      { label: 'Posted Bills', value: '41', change: 'Includes paid and partially paid records', trend: 'up' },
      { label: 'Open Payable Balance', value: 'PHP 1.84M', change: 'Across posted and partially paid bills', trend: 'neutral' },
      { label: 'Due This Week', value: '13', change: 'Based on bill due dates now on file', trend: 'down' },
    ],
    tableTitle: 'Vendor Bill Register',
    tableDescription: 'Primary bill register based on the bill document collection and payable status fields.',
    columns: ['Bill No.', 'Bill Date', 'Vendor', 'Due Date', 'Total', 'Status'],
    rows: [
      {
        id: 'bill-1',
        cells: [
          { text: 'BILL-2026-1184', emphasis: true },
          '2026-05-31',
          'Office Depot',
          '2026-06-15',
          { text: 'PHP 48,200', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'bill-2',
        cells: [
          { text: 'BILL-2026-1179', emphasis: true },
          '2026-05-30',
          'Cebu Pacific',
          '2026-06-09',
          { text: 'PHP 126,880', emphasis: true, align: 'right' },
          { text: 'Approved', tone: 'amber' },
        ],
      },
      {
        id: 'bill-3',
        cells: [
          { text: 'BILL-2026-1170', emphasis: true },
          '2026-05-29',
          'City Water',
          '2026-06-28',
          { text: 'PHP 36,440', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'bill-4',
        cells: [
          { text: 'BILL-2026-1162', emphasis: true },
          '2026-05-28',
          'Blue Anchor Marine',
          '2026-06-05',
          { text: 'PHP 214,600', emphasis: true, align: 'right' },
          { text: 'Partially Paid', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'bill-detail',
    label: 'Bill Detail',
    description: 'Inspect bill headers, normalized line items, tax totals, linked documents, and journal references.',
    searchPlaceholder: 'Search bill no., vendor, line description, tax code, or journal ref',
    filters: ['With Lines', 'With Tax', 'With Documents', 'Journal Linked'],
    actions: [
      { label: 'Open Bill Detail', icon: 'plus', variant: 'primary' },
      { label: 'Add Attachment', icon: 'upload', variant: 'secondary' },
      { label: 'Refresh Detail', icon: 'refresh', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Bills With Lines', value: '64', change: 'Normalized through bill line items', trend: 'up' },
      { label: 'Bill Lines', value: '286', change: 'Expense, asset, and tax-coded lines', trend: 'up' },
      { label: 'Linked Documents', value: '58', change: 'Bill support attached through document links', trend: 'neutral' },
      { label: 'Journal-Linked Bills', value: '39', change: 'Posted bills with journal references', trend: 'up' },
    ],
    tableTitle: 'Bill Detail Coverage',
    tableDescription: 'Detail-oriented view of line totals, tax totals, document support, and journal linkage for posted and draft bills.',
    columns: ['Bill No.', 'Vendor', 'Line Items', 'Tax Total', 'Balance Due', 'Status'],
    rows: [
      {
        id: 'detail-1',
        cells: [
          { text: 'BILL-2026-1179', emphasis: true },
          'Cebu Pacific',
          '4 lines',
          { text: 'PHP 13,594', align: 'right' },
          { text: 'PHP 126,880', emphasis: true, align: 'right' },
          { text: 'Approved', tone: 'amber' },
        ],
      },
      {
        id: 'detail-2',
        cells: [
          { text: 'BILL-2026-1170', emphasis: true },
          'City Water',
          '2 lines',
          { text: 'PHP 3,900', align: 'right' },
          { text: 'PHP 36,440', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'detail-3',
        cells: [
          { text: 'BILL-2026-1166', emphasis: true },
          'Grandline Rentals',
          '1 line',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 85,000', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'detail-4',
        cells: [
          { text: 'BILL-2026-1162', emphasis: true },
          'Blue Anchor Marine',
          '6 lines',
          { text: 'PHP 18,600', align: 'right' },
          { text: 'PHP 94,600', emphasis: true, align: 'right' },
          { text: 'Partially Paid', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'vendor-credits',
    label: 'Vendor Credits',
    description: 'Manage vendor credits that reduce payables through source bills, applications, and remaining balances.',
    searchPlaceholder: 'Search credit no., vendor, source bill, reason, or posting date',
    filters: ['Draft', 'Approved', 'Posted', 'Remaining Balance'],
    actions: [
      { label: 'Create Vendor Credit', icon: 'plus', variant: 'primary' },
      { label: 'Upload Credit Support', icon: 'upload', variant: 'secondary' },
      { label: 'Refresh Credits', icon: 'refresh', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft Credits', value: '9', change: 'Prepared but not yet posted', trend: 'neutral' },
      { label: 'Posted Credits', value: '18', change: 'Reducing open payable balances', trend: 'up' },
      { label: 'Applied Amount', value: 'PHP 214,300', change: 'Applied against source and target bills', trend: 'up' },
      { label: 'Remaining Credit', value: 'PHP 67,480', change: 'Available for future bill application', trend: 'down' },
    ],
    tableTitle: 'Vendor Credit Register',
    tableDescription: 'Vendor credit records with source-bill references, totals, application progress, and remaining amounts.',
    columns: ['Credit No.', 'Credit Date', 'Vendor', 'Source Bill', 'Remaining', 'Status'],
    rows: [
      {
        id: 'credit-1',
        cells: [
          { text: 'VC-2026-041', emphasis: true },
          '2026-05-31',
          'Office Depot',
          'BILL-2026-1184',
          { text: 'PHP 12,400', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'credit-2',
        cells: [
          { text: 'VC-2026-039', emphasis: true },
          '2026-05-30',
          'Blue Anchor Marine',
          'BILL-2026-1162',
          { text: 'PHP 0', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'credit-3',
        cells: [
          { text: 'VC-2026-037', emphasis: true },
          '2026-05-29',
          'City Water',
          'BILL-2026-1170',
          { text: 'PHP 7,880', emphasis: true, align: 'right' },
          { text: 'Approved', tone: 'amber' },
        ],
      },
      {
        id: 'credit-4',
        cells: [
          { text: 'VC-2026-034', emphasis: true },
          '2026-05-27',
          'Cebu Pacific',
          'BILL-2026-1151',
          { text: 'PHP 0', emphasis: true, align: 'right' },
          { text: 'Voided', tone: 'red' },
        ],
      },
    ],
  },
];

export default function PurchaseDocumentsPage() {
  return (
    <PurchasesPayablesPage
      eyebrow="Operations / Purchases & Payables"
      title="Purchase Documents"
      description="Manage vendor bills, bill detail records, and vendor credits across the payables document workflow."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Bill', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
