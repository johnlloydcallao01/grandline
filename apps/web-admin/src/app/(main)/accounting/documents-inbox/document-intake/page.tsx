import { DocumentsInboxPage, type DocumentsInboxTab } from '../_components/DocumentsInboxPage';

const tabs: DocumentsInboxTab[] = [
  {
    id: 'accounting-inbox',
    label: 'Accounting Inbox',
    description:
      'Review uploaded files entering the accounting area through the shared media collection before they are linked to finance entities.',
    searchPlaceholder: 'Search filename, uploaded by, mime type, upload date, or source',
    filters: ['Recent Uploads', 'PDF', 'Images', 'Ready To Link'],
    actions: [
      { label: 'Upload File', icon: 'upload', variant: 'primary' },
      { label: 'Refresh Inbox', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Inbox Files', value: '142', change: 'Files available through `media`', trend: 'up' },
      { label: 'PDF / Image Files', value: '118', change: 'Common finance-supporting upload types', trend: 'up' },
      { label: 'Recently Uploaded', value: '26', change: 'Files added in the latest review window', trend: 'neutral' },
      { label: 'Linked Files', value: '88', change: 'Uploads already referenced by accounting documents', trend: 'up' },
    ],
    tableTitle: 'Accounting Inbox',
    tableDescription:
      'Upload-oriented file view based on the shared `media` collection and the accounting document-link relationship count.',
    columns: ['File Name', 'Uploaded By', 'Mime Type', 'Uploaded At', 'Link Count', 'Status'],
    rows: [
      {
        id: 'inbox-1',
        cells: [
          { text: 'bdo-statement-may-2026.pdf', emphasis: true },
          'finance.admin',
          'application/pdf',
          '2026-05-31 09:08',
          { text: '1', align: 'right' },
          { text: 'Linked', tone: 'green' },
        ],
      },
      {
        id: 'inbox-2',
        cells: [
          { text: 'office-depot-bill-1184.jpg', emphasis: true },
          'ap.processor',
          'image/jpeg',
          '2026-05-31 08:44',
          { text: '1', align: 'right' },
          { text: 'Linked', tone: 'green' },
        ],
      },
      {
        id: 'inbox-3',
        cells: [
          { text: 'grab-receipt-exp-1168.png', emphasis: true },
          'expense.ops',
          'image/png',
          '2026-05-30 17:11',
          { text: '0', align: 'right' },
          { text: 'Unlinked', tone: 'amber' },
        ],
      },
      {
        id: 'inbox-4',
        cells: [
          { text: 'vat-support-pack-q2.zip', emphasis: true },
          'tax.admin',
          'application/zip',
          '2026-05-30 16:04',
          { text: '2', align: 'right' },
          { text: 'Linked', tone: 'green' },
        ],
      },
    ],
  },
  {
    id: 'unlinked-uploads',
    label: 'Unlinked Uploads',
    description:
      'Focus on uploaded files that exist in `media` but do not yet have an `accounting-document-links` record tying them to an accounting entity.',
    searchPlaceholder: 'Search filename, uploaded by, mime type, or missing-link candidate',
    filters: ['Unlinked', 'Receipts', 'Bank Statements', 'Contracts'],
    actions: [
      { label: 'Link Document', icon: 'plus', variant: 'primary' },
      { label: 'Refresh Unlinked', icon: 'refresh', variant: 'secondary' },
      { label: 'Download View', icon: 'download', variant: 'ghost' },
    ],
    metrics: [
      { label: 'Unlinked Files', value: '37', change: 'Media items without accounting link metadata', trend: 'down' },
      { label: 'Receipt Candidates', value: '18', change: 'Uploads likely to become receipt-related links', trend: 'neutral' },
      { label: 'Statement Candidates', value: '6', change: 'Uploads that can map to bank statements', trend: 'neutral' },
      { label: 'Same-Day Uploads', value: '9', change: 'Fresh files ready for finance review', trend: 'up' },
    ],
    tableTitle: 'Unlinked Upload Queue',
    tableDescription:
      'Operational review of files awaiting accounting linkage, driven by the gap between `media` records and `accounting-document-links` records.',
    columns: ['File Name', 'Uploaded By', 'Mime Type', 'Uploaded At', 'Suggested Category', 'Status'],
    rows: [
      {
        id: 'unlinked-1',
        cells: [
          { text: 'grab-receipt-exp-1168.png', emphasis: true },
          'expense.ops',
          'image/png',
          '2026-05-30 17:11',
          'expense_receipt',
          { text: 'Awaiting Link', tone: 'amber' },
        ],
      },
      {
        id: 'unlinked-2',
        cells: [
          { text: 'metrobank-slip-0531.pdf', emphasis: true },
          'treasury.ops',
          'application/pdf',
          '2026-05-30 13:24',
          'proof_of_payment',
          { text: 'Awaiting Link', tone: 'amber' },
        ],
      },
      {
        id: 'unlinked-3',
        cells: [
          { text: 'vendor-contract-renewal.docx', emphasis: true },
          'ap.processor',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '2026-05-29 15:42',
          'contract',
          { text: 'Awaiting Link', tone: 'amber' },
        ],
      },
      {
        id: 'unlinked-4',
        cells: [
          { text: 'bdo-statement-draft-june.pdf', emphasis: true },
          'finance.admin',
          'application/pdf',
          '2026-05-29 09:03',
          'bank_statement',
          { text: 'Awaiting Link', tone: 'amber' },
        ],
      },
    ],
  },
];

export default function DocumentIntakePage() {
  return (
    <DocumentsInboxPage
      eyebrow="Operations / Documents & Inbox"
      title="Document Intake"
      description="Review uploaded files entering accounting and prepare them for linking to invoices, bills, expenses, banking records, and other finance entities."
      headerActions={[
        { label: 'Refresh Workspace', icon: 'refresh', variant: 'secondary' },
        { label: 'Upload Document', icon: 'upload', variant: 'primary' },
      ]}
      tabs={tabs}
    />
  );
}
