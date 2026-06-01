import { DocumentsInboxPage, type DocumentsInboxTab } from '../_components/DocumentsInboxPage';

const tabs: DocumentsInboxTab[] = [
  {
    id: 'all-files',
    label: 'All Files',
    description:
      'Browse the full accounting document inventory across uploaded files and linked records stored through `media` and `accounting-document-links`.',
    searchPlaceholder: 'Search filename, uploader, category, entity type, or upload date',
    filters: ['All Files', 'Linked', 'Primary', 'Recent'],
    actions: [
      { label: 'Open File', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Library', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Total Files', value: '142', change: 'Files visible in the shared library', trend: 'up' },
      { label: 'Linked Records', value: '88', change: 'Files with accounting link metadata', trend: 'up' },
      { label: 'Primary Documents', value: '41', change: 'Records flagged as primary supporting files', trend: 'neutral' },
      { label: 'Multi-Link Files', value: '12', change: 'Files referenced by more than one finance record', trend: 'neutral' },
    ],
    tableTitle: 'Document Library',
    tableDescription:
      'Unified file register combining upload metadata from `media` with accounting linkage metadata where available.',
    columns: ['File Name', 'Category', 'Entity Type', 'Entity ID', 'Uploaded By', 'Status'],
    rows: [
      {
        id: 'library-1',
        cells: [
          { text: 'bdo-statement-may-2026.pdf', emphasis: true },
          'bank_statement',
          'bank_reconciliation',
          'REC-2026-05-BDO',
          'finance.admin',
          { text: 'Primary', tone: 'green' },
        ],
      },
      {
        id: 'library-2',
        cells: [
          { text: 'office-depot-bill-1184.jpg', emphasis: true },
          'bill',
          'bill',
          'BILL-2026-1184',
          'ap.processor',
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'library-3',
        cells: [
          { text: 'grab-receipt-exp-1168.png', emphasis: true },
          '-',
          '-',
          '-',
          'expense.ops',
          { text: 'Unlinked', tone: 'amber' },
        ],
      },
      {
        id: 'library-4',
        cells: [
          { text: 'vat-support-pack-q2.zip', emphasis: true },
          'tax',
          'journal_entry',
          'JE-2026-0908',
          'tax.admin',
          { text: 'Linked', tone: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'receipt-archive',
    label: 'Receipt Archive',
    description:
      'Review receipt-oriented supporting documents using document categories such as `receipt`, `expense_receipt`, and `proof_of_payment`.',
    searchPlaceholder: 'Search receipt file, entity id, category, uploader, or document date',
    filters: ['Receipt', 'Expense Receipt', 'Proof Of Payment', 'Primary'],
    actions: [
      { label: 'Open Receipt', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Archive', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Receipt Records', value: '46', change: 'Linked records under receipt-oriented categories', trend: 'up' },
      { label: 'Expense Receipts', value: '18', change: 'Expense-specific receipt documents', trend: 'neutral' },
      { label: 'Proof Of Payment', value: '11', change: 'Payment-supporting document links', trend: 'neutral' },
      { label: 'Primary Receipts', value: '29', change: 'Receipt links marked as primary', trend: 'up' },
    ],
    tableTitle: 'Receipt Archive',
    tableDescription:
      'Document-link view filtered to receipt-like categories already modeled by the accounting document-link collection.',
    columns: ['File Name', 'Document Category', 'Entity Type', 'Entity ID', 'Document Date', 'Status'],
    rows: [
      {
        id: 'receipt-1',
        cells: [
          { text: 'grab-receipt-exp-1162.png', emphasis: true },
          'expense_receipt',
          'expense',
          'EXP-2026-1162',
          '2026-05-30',
          { text: 'Primary', tone: 'green' },
        ],
      },
      {
        id: 'receipt-2',
        cells: [
          { text: 'payment-slip-pm-2026-081.pdf', emphasis: true },
          'proof_of_payment',
          'payment_made',
          'PM-2026-081',
          '2026-05-30',
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'receipt-3',
        cells: [
          { text: 'receipt-rct-2026-1184.pdf', emphasis: true },
          'receipt',
          'receipt',
          'RCT-2026-1184',
          '2026-05-31',
          { text: 'Primary', tone: 'green' },
        ],
      },
      {
        id: 'receipt-4',
        cells: [
          { text: 'office-depot-proof.pdf', emphasis: true },
          'proof_of_payment',
          'bill',
          'BILL-2026-1184',
          '2026-05-31',
          { text: 'Linked', tone: 'blue' },
        ],
      },
    ],
  },
  {
    id: 'linked-documents',
    label: 'Linked Documents',
    description:
      'Review accounting document links by entity type, entity id, category, document date, and primary-document flag.',
    searchPlaceholder: 'Search entity type, entity id, category, notes, or uploader',
    filters: ['Invoices', 'Bills', 'Expenses', 'Banking'],
    actions: [
      { label: 'Create Link', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Links', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Linked Documents', value: '88', change: 'Accounting document-link records in scope', trend: 'up' },
      { label: 'Invoice / Bill Links', value: '39', change: 'Commercial transaction attachments', trend: 'up' },
      { label: 'Expense / Banking Links', value: '27', change: 'Expense and banking support files', trend: 'neutral' },
      { label: 'With Notes', value: '31', change: 'Linked records carrying document notes', trend: 'neutral' },
    ],
    tableTitle: 'Linked Document Register',
    tableDescription:
      'Link-centric register built directly from `accounting-document-links` using entity type, entity id, and category metadata.',
    columns: ['File Name', 'Entity Type', 'Entity ID', 'Category', 'Is Primary', 'Status'],
    rows: [
      {
        id: 'linked-1',
        cells: [
          { text: 'office-depot-bill-1184.jpg', emphasis: true },
          'bill',
          'BILL-2026-1184',
          'bill',
          { text: 'Yes', tone: 'green' },
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'linked-2',
        cells: [
          { text: 'bdo-statement-may-2026.pdf', emphasis: true },
          'bank_reconciliation',
          'REC-2026-05-BDO',
          'bank_statement',
          { text: 'Yes', tone: 'green' },
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'linked-3',
        cells: [
          { text: 'vat-support-pack-q2.zip', emphasis: true },
          'journal_entry',
          'JE-2026-0908',
          'tax',
          { text: 'No', tone: 'gray' },
          { text: 'Linked', tone: 'blue' },
        ],
      },
      {
        id: 'linked-4',
        cells: [
          { text: 'receipt-rct-2026-1184.pdf', emphasis: true },
          'receipt',
          'RCT-2026-1184',
          'receipt',
          { text: 'Yes', tone: 'green' },
          { text: 'Linked', tone: 'blue' },
        ],
      },
    ],
  },
];

export default function DocumentLibraryPage() {
  return (
    <DocumentsInboxPage
      eyebrow="Operations / Documents & Inbox"
      title="Document Library"
      description="Browse accounting-supporting files and document links across invoices, bills, expenses, receipts, and banking records."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Open Library View', icon: 'plus', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
