import { SalesReceivablesPage, type SalesReceivablesTab } from '../_components/SalesReceivablesPage';

const tabs: SalesReceivablesTab[] = [
  {
    id: 'invoices',
    label: 'Invoices',
    description: 'Create, review, and post customer invoices with due dates, totals, balances, and settlement status.',
    searchPlaceholder: 'Search invoice no., customer, reference no., memo, or due date',
    filters: ['Draft', 'Approved', 'Posted', 'Partially Paid'],
    actions: [
      { label: 'Create Invoice', icon: 'plus', variant: 'primary' },
      { label: 'Upload Support', icon: 'upload', variant: 'secondary' },
      { label: 'Refresh List', icon: 'refresh', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft Invoices', value: '24', change: 'Prepared before posting', trend: 'neutral' },
      { label: 'Posted Invoices', value: '63', change: 'Includes paid and partially paid invoices', trend: 'up' },
      { label: 'Open Receivable Balance', value: 'PHP 3.18M', change: 'Across posted and partially paid invoices', trend: 'neutral' },
      { label: 'Due This Week', value: '18', change: 'Upcoming receivable due dates', trend: 'down' },
    ],
    tableTitle: 'Invoice Register',
    tableDescription: 'Primary invoice register aligned with the invoice collection, due dates, and balance-due fields.',
    columns: ['Invoice No.', 'Invoice Date', 'Customer', 'Due Date', 'Total', 'Status'],
    rows: [
      {
        id: 'inv-1',
        cells: [
          { text: 'INV-2026-1452', emphasis: true },
          '2026-05-31',
          'SM Shipping Corp.',
          '2026-06-15',
          { text: 'PHP 186,500', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'inv-2',
        cells: [
          { text: 'INV-2026-1447', emphasis: true },
          '2026-05-30',
          'Blue Anchor Marine',
          '2026-06-09',
          { text: 'PHP 248,880', emphasis: true, align: 'right' },
          { text: 'Approved', tone: 'amber' },
        ],
      },
      {
        id: 'inv-3',
        cells: [
          { text: 'INV-2026-1439', emphasis: true },
          '2026-05-29',
          'Harbor Training Ltd.',
          '2026-06-28',
          { text: 'PHP 96,440', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'inv-4',
        cells: [
          { text: 'INV-2026-1433', emphasis: true },
          '2026-05-28',
          'Grandline Corporate',
          '2026-06-05',
          { text: 'PHP 314,600', emphasis: true, align: 'right' },
          { text: 'Partially Paid', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'invoice-detail',
    label: 'Invoice Detail',
    description: 'Inspect invoice headers, normalized line items, tax totals, document support, and journal linkage.',
    searchPlaceholder: 'Search invoice no., customer, line description, tax code, or journal ref',
    filters: ['With Lines', 'With Tax', 'With Documents', 'Journal Linked'],
    actions: [
      { label: 'Open Invoice Detail', icon: 'plus', variant: 'primary' },
      { label: 'Add Attachment', icon: 'upload', variant: 'secondary' },
      { label: 'Refresh Detail', icon: 'refresh', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Invoices With Lines', value: '72', change: 'Normalized through invoice line items', trend: 'up' },
      { label: 'Invoice Lines', value: '384', change: 'Service and revenue-coded detail lines', trend: 'up' },
      { label: 'Linked Documents', value: '66', change: 'Invoice support attached through document links', trend: 'neutral' },
      { label: 'Journal-Linked Invoices', value: '52', change: 'Posted invoices with journal references', trend: 'up' },
    ],
    tableTitle: 'Invoice Detail Coverage',
    tableDescription: 'Detail-oriented view of invoice lines, tax totals, open balances, and linked accounting references.',
    columns: ['Invoice No.', 'Customer', 'Line Items', 'Tax Total', 'Balance Due', 'Status'],
    rows: [
      {
        id: 'detail-1',
        cells: [
          { text: 'INV-2026-1447', emphasis: true },
          'Blue Anchor Marine',
          '5 lines',
          { text: 'PHP 26,702', align: 'right' },
          { text: 'PHP 248,880', emphasis: true, align: 'right' },
          { text: 'Approved', tone: 'amber' },
        ],
      },
      {
        id: 'detail-2',
        cells: [
          { text: 'INV-2026-1439', emphasis: true },
          'Harbor Training Ltd.',
          '3 lines',
          { text: 'PHP 10,336', align: 'right' },
          { text: 'PHP 96,440', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'detail-3',
        cells: [
          { text: 'INV-2026-1435', emphasis: true },
          'North Port Logistics',
          '2 lines',
          { text: 'PHP 0', align: 'right' },
          { text: 'PHP 58,000', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'detail-4',
        cells: [
          { text: 'INV-2026-1433', emphasis: true },
          'Grandline Corporate',
          '6 lines',
          { text: 'PHP 33,707', align: 'right' },
          { text: 'PHP 124,600', emphasis: true, align: 'right' },
          { text: 'Partially Paid', tone: 'amber' },
        ],
      },
    ],
  },
  {
    id: 'credit-notes',
    label: 'Credit Notes',
    description: 'Manage customer credit notes through source invoices, applications, remaining balances, and posting status.',
    searchPlaceholder: 'Search credit note no., customer, source invoice, reason, or posting date',
    filters: ['Draft', 'Approved', 'Posted', 'Remaining Balance'],
    actions: [
      { label: 'Create Credit Note', icon: 'plus', variant: 'primary' },
      { label: 'Upload Support', icon: 'upload', variant: 'secondary' },
      { label: 'Refresh Credits', icon: 'refresh', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Draft Credits', value: '8', change: 'Prepared but not yet posted', trend: 'neutral' },
      { label: 'Posted Credits', value: '16', change: 'Reducing open receivable balances', trend: 'up' },
      { label: 'Applied Amount', value: 'PHP 286,300', change: 'Applied back to customer invoices', trend: 'up' },
      { label: 'Remaining Credit', value: 'PHP 74,920', change: 'Available for further application', trend: 'down' },
    ],
    tableTitle: 'Credit Note Register',
    tableDescription: 'Customer credit notes with source-invoice references, application progress, and remaining balances.',
    columns: ['Credit No.', 'Credit Date', 'Customer', 'Source Invoice', 'Remaining', 'Status'],
    rows: [
      {
        id: 'credit-1',
        cells: [
          { text: 'CN-2026-028', emphasis: true },
          '2026-05-31',
          'SM Shipping Corp.',
          'INV-2026-1452',
          { text: 'PHP 18,400', emphasis: true, align: 'right' },
          { text: 'Draft', tone: 'blue' },
        ],
      },
      {
        id: 'credit-2',
        cells: [
          { text: 'CN-2026-026', emphasis: true },
          '2026-05-30',
          'Grandline Corporate',
          'INV-2026-1433',
          { text: 'PHP 0', emphasis: true, align: 'right' },
          { text: 'Posted', tone: 'green' },
        ],
      },
      {
        id: 'credit-3',
        cells: [
          { text: 'CN-2026-024', emphasis: true },
          '2026-05-29',
          'Blue Anchor Marine',
          'INV-2026-1447',
          { text: 'PHP 11,520', emphasis: true, align: 'right' },
          { text: 'Approved', tone: 'amber' },
        ],
      },
      {
        id: 'credit-4',
        cells: [
          { text: 'CN-2026-021', emphasis: true },
          '2026-05-27',
          'Harbor Training Ltd.',
          'INV-2026-1418',
          { text: 'PHP 0', emphasis: true, align: 'right' },
          { text: 'Voided', tone: 'red' },
        ],
      },
    ],
  },
];

export default function SalesDocumentsPage() {
  return (
    <SalesReceivablesPage
      eyebrow="Operations / Sales & Receivables"
      title="Sales Documents"
      description="Manage invoices, invoice detail records, and customer credit notes across the receivables document workflow."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'New Invoice', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
